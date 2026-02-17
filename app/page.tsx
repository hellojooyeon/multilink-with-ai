import { prisma } from "@/lib/prisma";
import { ProfileHeader } from "@/components/ProfileHeader";
import { LinkItem } from "@/components/LinkItem";
import { ShareButton } from "@/components/ShareButton";

async function getData() {
  const profile = await prisma.profile.findFirst();
  const links = await prisma.link.findMany({
    orderBy: { order: 'asc' },
  });

  return { profile, links };
}

export default async function Home() {
  const { profile, links } = await getData();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <p className="text-zinc-500">프로필을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-12 px-4 selection:bg-black/10 dark:selection:bg-white/20">
      <div className="max-w-md mx-auto w-full">
        {/* Share Button (Top Right) */}
        <div className="flex justify-end mb-4">
          <ShareButton />
        </div>

        <ProfileHeader profile={profile} />

        <div className="space-y-4 mt-8">
          {links.map((link) => (
            <LinkItem key={link.id} link={link} />
          ))}
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
            <span>Powered by</span>
            <span className="font-bold">Next.js</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
