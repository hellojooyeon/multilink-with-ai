"use client";

import { useState, useMemo } from "react";
import { usePathname } from 'next/navigation'
import { Profile, Link, Group } from "@/prisma/app/generated/prisma-client";
import { ProfileHeader } from "@/components/ProfileHeader";
import { LinkItem } from "@/components/LinkItem";
import { ShareButton } from "@/components/ShareButton";
import { VisitTracker } from "@/components/VisitTracker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Settings, LayoutGrid, List as ListIcon, ArrowUp, ArrowDown } from "lucide-react";

interface MainPageClientProps {
    profile: Profile;
    links: Link[];
    groups: Group[];
}

type ViewMode = 'card' | 'list';
type SortOption = 'date' | 'name';
type SortOrder = 'asc' | 'desc';

export function MainPageClient({ profile, links, groups }: MainPageClientProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [sortBy, setSortBy] = useState<SortOption>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Determine if a link is "open" (active and started).
    // Note: Parent already filters isActive=true.
    // "Opening Soon" links are visible but locked.
    // We don't filter them out here.

    // Sorting Logic
    const sortedLinks = useMemo(() => {
        return [...links].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'date') {
                const aHasDate = a.startDate != null;
                const bHasDate = b.startDate != null;

                // startDate가 null인 링크(항상 오픈)는 항상 맨 뒤로
                if (!aHasDate && !bHasDate) return 0;
                if (!aHasDate) return 1;
                if (!bHasDate) return -1;

                const dateA = new Date(a.startDate!).getTime();
                const dateB = new Date(b.startDate!).getTime();
                comparison = dateA - dateB;
            } else if (sortBy === 'name') {
                comparison = a.title.localeCompare(b.title);
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [links, sortBy, sortOrder]);

    // Grouping Logic
    // We need to render groups in order, then ungrouped links.
    const groupedLinks = useMemo(() => {
        // Map of groupId -> links
        const groupMap = new Map<number, Link[]>();
        const ungrouped: Link[] = [];

        sortedLinks.forEach(link => {
            if (link.groupId) {
                if (!groupMap.has(link.groupId)) {
                    groupMap.set(link.groupId, []);
                }
                groupMap.get(link.groupId)!.push(link);
            } else {
                ungrouped.push(link);
            }
        });

        return { groupMap, ungrouped };
    }, [sortedLinks]);

    // Sort groups by their order
    const sortedGroups = useMemo(() => {
        return [...groups].sort((a, b) => a.order - b.order);
    }, [groups]);

    const pathname = usePathname();
    const isAdminPreview = pathname === '/admin/preview';

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-12 px-4 selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
            <VisitTracker />
            <div className="max-w-md mx-auto w-full">
                {/* Controls Header */}
                <div className="flex justify-between items-center mb-4">
                    <ThemeToggle />
                    <div className="flex gap-2">
                        {/* Admin Button */}
                        {!isAdminPreview && <a
                            href="/admin"
                            className="flex items-center justify-center p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm hover:shadow transition-all text-zinc-600 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700"
                            aria-label="Admin Dashboard"
                        >
                            <Settings size={20} />
                        </a>}
                        <ShareButton />
                    </div>
                </div>

                <ProfileHeader profile={profile} />

                {/* View & Sort Controls */}
                <div className="flex justify-between items-center mt-8 mb-4">
                    <div className="flex bg-gray-200 dark:bg-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                            aria-label="List View"
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'card' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                            aria-label="Card View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-300 focus:outline-none cursor-pointer rounded px-1 py-0.5"
                        >
                            <option value="date">Date</option>
                            <option value="name">Name</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                            aria-label="Toggle Sort Order"
                        >
                            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Grouped Links */}
                    {sortedGroups.map(group => {
                        const groupLinks = groupedLinks.groupMap.get(group.id);
                        if (!groupLinks || groupLinks.length === 0) return null;

                        return (
                            <div key={group.id} className="space-y-3">
                                <h3 className="font-bold text-zinc-500 dark:text-zinc-400 text-sm pl-1 uppercase tracking-wider flex items-center gap-2">
                                    {/*  Maybe show group icon if available, but for now just name */}
                                    {group.name}
                                </h3>
                                <div className={viewMode === 'card' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                                    {groupLinks.map((link) => (
                                        <LinkItem key={link.id} link={link} viewMode={viewMode} />
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    {/* Ungrouped Links */}
                    {groupedLinks.ungrouped.length > 0 && (
                        <div className={viewMode === 'card' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                            {groupedLinks.ungrouped.map((link) => (
                                <LinkItem key={link.id} link={link} viewMode={viewMode} />
                            ))}
                        </div>
                    )}
                </div>

                <footer className="mt-16 text-center text-xs text-zinc-400">
                    <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
                    <div className="mt-2 flex items-center justify-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                        <span>Powered by</span>
                        <span className="font-bold">Next.js</span>
                        {/* Simple footer for now */}
                    </div>
                </footer>
            </div>
        </main>
    );
}
