"use client";

import { useState, useEffect } from "react";
import { Link as LinkType } from "@/prisma/app/generated/prisma-client";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { recordLinkClick } from "@/app/actions/analytics";

interface LinkItemProps {
    link: LinkType;
    viewMode?: 'card' | 'list';
}

export function LinkItem({ link, viewMode = 'card' }: LinkItemProps) {
    const [showModal, setShowModal] = useState(false);

    // isActive is checked in parent or query, but here we double check or handle "opening soon"
    // If startDate is in future, it's "opening soon".
    // If isActive is false, it shouldn't be here (filtered out by parent), but if it is, handle gracefully.

    // The requirement: 
    // "isActive=false => not shown" (Handled by parent query)
    // "isActive=true => shown". If current < startDate, it is exposed but locked.

    const [isLocked, setIsLocked] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        if (link.startDate) {
            const now = new Date();
            const start = new Date(link.startDate);
            setIsLocked(start > now);

            setFormattedDate(start.toLocaleDateString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            }));
        }
    }, [link.startDate]);

    const handleClick = (e: React.MouseEvent) => {
        if (isLocked) {
            e.preventDefault();
            setShowModal(true);
        } else {
            // Only record click if the link is actually opening
            recordLinkClick(link.id);
        }
    };

    return (
        <>
            <a
                href={!isLocked ? link.url : "#"}
                onClick={handleClick}
                target={!isLocked ? "_blank" : undefined}
                rel={!isLocked ? "noopener noreferrer" : undefined}
                className={cn(
                    "group relative transition-all duration-300 overflow-hidden",
                    viewMode === "card"
                        ? "flex flex-col items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 text-center space-y-2 h-full"
                        : "flex items-center w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                    isLocked && "opacity-70 cursor-not-allowed grayscale"
                )}
            >
                <div className={cn(
                    "flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 overflow-hidden",
                    viewMode === "card"
                        ? "w-full aspect-square bg-zinc-100 dark:bg-zinc-800 mb-0"
                        : "w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                )}>
                    {viewMode === 'card' && link.image ? (
                        <img
                            src={link.image}
                            alt={link.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={cn(
                            "flex items-center justify-center w-full h-full",
                            viewMode === 'card' ? "text-zinc-300 dark:text-zinc-600" : ""
                        )}>
                            {link.icon ? <Icon name={link.icon} size={viewMode === 'card' ? 48 : 20} /> : <Icon name="Image" size={viewMode === 'card' ? 48 : 20} />}
                        </div>
                    )}
                </div>

                <div className={cn(
                    "flex flex-col flex-1 w-full",
                    viewMode === 'list' ? "ml-4 text-left py-1" : "p-3 pb-4 text-center items-center"
                )}>
                    <span className={cn(
                        "font-bold text-zinc-900 dark:text-zinc-100 transition-colors leading-tight",
                        viewMode === 'card' ? "text-sm mb-1" : "text-base"
                    )}>
                        {link.title}
                    </span>
                    {link.description && (
                        <span className={cn(
                            "text-zinc-500 dark:text-zinc-400 line-clamp-1",
                            viewMode === 'card' ? "text-[11px]" : "text-xs mt-1"
                        )}>
                            {link.description}
                        </span>
                    )}
                    {isLocked && (
                        <span className={cn(
                            "inline-flex items-center gap-1 text-red-500 font-medium bg-red-50 dark:bg-red-900/20 rounded-full",
                            viewMode === 'card' ? "text-[10px] px-1.5 py-0.5 mt-1" : "text-xs px-2 py-1 mt-2 self-center lg:self-auto"
                        )}>
                            <Icon name="Lock" size={viewMode === 'card' ? 10 : 12} />
                            <span>{formattedDate} 오픈</span>
                        </span>
                    )}
                </div>

                {viewMode === 'list' && (
                    <div className="text-zinc-400 group-hover:translate-x-1 transition-transform">
                        {/* Right Arrow for list view */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </div>
                )}
            </a>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-gray-100 dark:border-zinc-800 transform transition-all scale-100">
                        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500">
                            <Icon name="Lock" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                            오픈 예정입니다!
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            {formattedDate
                                ? <>이 링크는 <span className="font-semibold text-zinc-900 dark:text-zinc-200">{formattedDate}</span>에 공개됩니다.<br />조금만 기다려주세요! 🚀</>
                                : <>현재 이용할 수 없는 링크입니다.<br />나중에 다시 확인해주세요!</>
                            }
                        </p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold active:scale-95 transition-transform"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
