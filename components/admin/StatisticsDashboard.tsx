"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface StatisticsDashboardProps {
    visitStats: any[];
    clickStats: any[];
    linkStats: { linkId: number, title: string, count: number }[];
}

export function StatisticsDashboard({ visitStats, clickStats, linkStats }: StatisticsDashboardProps) {
    // Recharts data format: array of objects
    // visitStats from server action is array of { date: string, count: number } (bigint actually, needs conversion)

    const formatData = (data: any[]) => {
        return data.map(d => ({
            date: new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            count: Number(d.count)
        }));
    };

    const formattedVisits = formatData(visitStats);
    const formattedClicks = formatData(clickStats);
    const formattedLinkStats = linkStats.map(l => ({ ...l, count: Number(l.count) })).sort((a, b) => b.count - a.count);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visit Trend */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100">Daily Visits (Last 30 Days)</h3>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={formattedVisits}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#4F46E5" fillOpacity={1} fill="url(#colorVisits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Click Trend */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100">Total Link Clicks (Last 30 Days)</h3>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={formattedClicks}>
                                <defs>
                                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#10B981" fillOpacity={1} fill="url(#colorClicks)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Link Performance Table / Bar Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-zinc-100">Link Performance</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                        <thead className="bg-gray-50 dark:bg-zinc-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                            {formattedLinkStats.map((stat, idx) => {
                                const total = formattedLinkStats.reduce((sum, s) => sum + s.count, 0);
                                const percentage = total > 0 ? (stat.count / total) * 100 : 0;

                                return (
                                    <tr key={stat.linkId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{idx + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{stat.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <span className="mr-2">{percentage.toFixed(1)}%</span>
                                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
