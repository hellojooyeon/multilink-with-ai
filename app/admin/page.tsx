
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile, getLinks, getGroups, getStatistics } from "@/app/actions/admin";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
    const isAdministrator = await isAdmin();

    if (!isAdministrator) {
        redirect("/admin/login");
    }

    // Fetch all data in parallel
    const [profile, links, groups, stats] = await Promise.all([
        getProfile(),
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
        <AdminDashboardClient
            profile={profile}
            links={links}
            groups={groups}
            stats={stats}
        />
    );
}
