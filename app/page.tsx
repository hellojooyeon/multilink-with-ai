import { prisma } from "@/lib/prisma";
import { MainPageClient } from "@/components/MainPageClient";

async function getData() {
  const profile = await prisma.profile.findFirst();
  const now = new Date();

  // Fetch all active links. 
  // We do NOT filter by date here anymore, because "Opening Soon" links (future startDate) 
  // should be actively returned but locked in UI.
  // We only filter `isActive: true`.
  const links = await prisma.link.findMany({
    where: {
      isActive: true,
    },
    // We sort by order by default, but client side helps sorting too.
    orderBy: { order: 'asc' },
  });

  const groups = await prisma.group.findMany({
    orderBy: { order: 'asc' },
  });

  return { profile, links, groups };
}

export default async function Home() {
  const { profile, links, groups } = await getData();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <p className="text-zinc-500">프로필을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return <MainPageClient profile={profile} links={links} groups={groups} />;
}
