"use client";

import { useState } from "react";
import { Profile, Link as LinkType, Group } from "@/prisma/app/generated/prisma-client";
import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { LinkManager } from "@/components/admin/LinkManager";
import { StatisticsDashboard } from "@/components/admin/StatisticsDashboard";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AdminDashboardClientProps {
    profile: Profile & { socialLinks?: any[] };
    links: LinkType[];
    groups: (Group & { links: LinkType[] })[];
    stats: {
        visitsByDate: any[];
        clicksByDate: any[];
        linkStats: any[];
    };
}

type Tab = 'profile' | 'links' | 'statistics';

export function AdminDashboardClient({ profile, links, groups, stats }: AdminDashboardClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                            Admin Dashboard
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                            Welcome back, {profile.name}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/"
                            target="_blank"
                            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition flex items-center gap-2"
                        >
                            <span>View Site</span>
                            <span className="text-xs">↗</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-zinc-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === 'profile'
                                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-200'}
                            `}
                        >
                            <span className="mr-2">👤</span>
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('links')}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === 'links'
                                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-200'}
                            `}
                        >
                            <span className="mr-2">🔗</span>
                            Links & Groups
                        </button>
                        <button
                            onClick={() => setActiveTab('statistics')}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === 'statistics'
                                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-zinc-400 dark:hover:text-zinc-200'}
                            `}
                        >
                            <span className="mr-2">📊</span>
                            Statistics
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="mt-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-6 flex items-start gap-3">
                                <span className="text-xl">ℹ️</span>
                                <div>
                                    <p className="font-semibold">Edit your public profile</p>
                                    <p>Update your name, bio, profile picture, and banner. You can also manage your social media links here.</p>
                                </div>
                            </div>
                            <ProfileEditor profile={profile} />
                        </div>
                    )}

                    {activeTab === 'links' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg text-sm text-indigo-800 dark:text-indigo-200 mb-6 flex items-start gap-3">
                                <span className="text-xl">ℹ️</span>
                                <div>
                                    <p className="font-semibold">Manage your links</p>
                                    <p>Create new links, organize them into groups, and track individual link performance.</p>
                                </div>
                            </div>
                            <LinkManager links={links} groups={groups} />
                        </div>
                    )}

                    {activeTab === 'statistics' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg text-sm text-emerald-800 dark:text-emerald-200 mb-6 flex items-start gap-3">
                                <span className="text-xl">ℹ️</span>
                                <div>
                                    <p className="font-semibold">Analytics Dashboard</p>
                                    <p>View visitor trends and click-through rates for the last 30 days.</p>
                                </div>
                            </div>
                            <StatisticsDashboard
                                visitStats={stats.visitsByDate}
                                clickStats={stats.clicksByDate}
                                linkStats={stats.linkStats}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
