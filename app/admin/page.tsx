
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth";

export default async function AdminPage() {
    const isAdministrator = await isAdmin();

    if (!isAdministrator) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        Admin Dashboard
                    </h1>
                    <div className="flex gap-4">
                        <form
                            action={async () => {
                                "use server";
                                await logout();
                                redirect("/");
                            }}
                        >
                            <button
                                type="submit"
                                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
                            >
                                View Site & Logout
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Welcome to the admin dashboard. Statistics and link management features will be added here.
                    </p>
                </div>
            </div>
        </div>
    );
}
