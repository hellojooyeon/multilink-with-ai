"use client";

import { useState } from "react";
import { Link as LinkType } from "@prisma/client";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

interface LinkItemProps {
    link: LinkType;
}

export function LinkItem({ link }: LinkItemProps) {
    const [showModal, setShowModal] = useState(false);

    const isOpen = link.isActive && (!link.openDate || new Date(link.openDate) <= new Date());

    const handleClick = (e: React.MouseEvent) => {
        if (!isOpen) {
            e.preventDefault();
            setShowModal(true);
        }
    };

    const formattedDate = link.openDate
        ? new Date(link.openDate).toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        })
        : '';

    return (
        <>
            <a
                href={isOpen ? link.url : "#"}
                onClick={handleClick}
                target={isOpen ? "_blank" : undefined}
                rel={isOpen ? "noopener noreferrer" : undefined}
                className={cn(
                    "group flex items-center transition-all duration-300",
                    link.variant === "card"
                        ? "w-full p-4 bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
                        : "w-full p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl",
                    !isOpen && "opacity-70 cursor-not-allowed"
                )}
            >
                <div className={cn(
                    "flex items-center justify-center rounded-full shrink-0",
                    link.variant === "card"
                        ? "w-10 h-10 bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-gray-100"
                        : "w-8 h-8 mr-3 text-zinc-600 dark:text-zinc-400"
                )}>
                    {link.icon && <Icon name={link.icon} size={link.variant === 'card' ? 20 : 18} />}
                </div>

                <div className={cn("flex flex-col flex-1", link.variant === 'card' && "ml-4")}>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-100 transition-colors">
                        {link.title}
                    </span>
                    {!isOpen && (
                        <span className="text-xs text-red-500 font-medium">
                            🔒 오픈 예정: {formattedDate}
                        </span>
                    )}
                </div>

                <div className="text-zinc-400">
                    {/* Chevron or similar could go here */}
                </div>
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
