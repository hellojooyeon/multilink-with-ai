import { MainPageClient } from "@/components/MainPageClient";
import { getPublicData } from "@/app/actions/public";
export const dynamic = 'force-dynamic'; // 항상 최신 데이터를 가져옴
export default async function Home() {
  const { profile, links, groups } = await getPublicData();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <p className="text-zinc-500">프로필을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return <MainPageClient profile={profile} links={links} groups={groups} />;
}
