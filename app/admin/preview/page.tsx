import { getPublicData } from "@/app/actions/public";
import { MainPageClient } from "@/components/MainPageClient";

export default async function AdminPreviewPage() {
    const { profile, links, groups } = await getPublicData();

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <p className="text-zinc-500">프로필을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <>
            {/* Preview Banner / Exit Button */}
            <div className="fixed top-4 right-4 z-50">
                <a
                    href="/admin"
                    className="bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black transition backdrop-blur-sm border border-white/20 shadow-lg"
                >
                    Exit Preview
                </a>
            </div>
            <MainPageClient profile={profile} links={links} groups={groups} />
        </>
    );
}
