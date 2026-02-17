import { prisma } from "@/lib/prisma";
import { ProfileHeader } from "@/components/ProfileHeader";
import { LinkItem } from "@/components/LinkItem";
import { ShareButton } from "@/components/ShareButton";
import { VisitTracker } from "@/components/VisitTracker";
import { Settings } from "lucide-react";

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
      <VisitTracker />
      <div className="max-w-md mx-auto w-full">
        {/* Share Button (Top Right) */}
        <div className="flex justify-end gap-2 mb-4">
          <a
            href="/admin"
            className="flex items-center justify-center p-2 bg-white dark:bg-zinc-800 rounded-full shadow-sm hover:shadow transition-all text-zinc-600 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700"
            aria-label="Admin Dashboard"
          >
            <Settings size={20} />
          </a>
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
