
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLinks, getGroups, getStatistics } from "@/app/actions/admin";
import { ProfileEditor } from "@/components/admin/ProfileEditor";
import { LinkManager } from "@/components/admin/LinkManager";
import { StatisticsDashboard } from "@/components/admin/StatisticsDashboard";

export default async function AdminPage() {
    const isAdministrator = await isAdmin();

    if (!isAdministrator) {
        redirect("/admin/login");
    }

    // Fetch all data in parallel
    const [profile, links, groups, stats] = await Promise.all([
        prisma.profile.findFirst(),
        getLinks(),
        getGroups(),
        getStatistics(30)
    ]);

    // Handle case where profile doesn't exist yet (though seed should have created it)
    if (!profile) {
        // fallback or create default if needed, for now just show error or empty
        return <div>Profile not found. Please run seed or check database.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex justify-between items-center">
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
                        <form
                            action={async () => {
                                "use server";
                                await logout();
                                redirect("/");
                            }}
                        >
                            <button
                                type="submit"
                                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition font-medium"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                </div>

                {/* Statistics Section */}
                <section>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                        <span>📊</span> Statistics
                    </h2>
                    <StatisticsDashboard
                        visitStats={stats.visitsByDate}
                        clickStats={stats.clicksByDate}
                        linkStats={stats.linkStats}
                    />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Link Management (Wider) */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                <span>🔗</span> Links & Groups
                            </h2>
                            <LinkManager links={links} groups={groups} />
                        </section>
                    </div>

                    {/* Right Column: Profile (Narrower) */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                <span>👤</span> Profile
                            </h2>
                            <ProfileEditor profile={profile} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
