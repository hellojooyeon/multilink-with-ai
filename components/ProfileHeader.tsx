import Image from "next/image";
import { Profile } from "@/prisma/app/generated/prisma-client";
import { Icon } from "@/components/Icon";

interface ProfileHeaderProps {
    profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col items-center text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {profile.banner && (
                <div className="relative w-full h-36 mb-6 rounded-2xl overflow-hidden shadow-md -mx-4">
                    <Image
                        src={profile.banner}
                        alt={`${profile.name} banner`}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}
            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg">
                <Image
                    src={profile.image || "/placeholder-avatar.png"}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                {profile.name}
            </h1>

            {profile.bio && (
                <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-xs leading-relaxed">
                    {profile.bio}
                </p>
            )}

            <div className="flex items-center gap-4">
                {profile.instagram && (
                    <a
                        href={profile.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full text-pink-500 hover:scale-110 hover:bg-pink-50 transition-all duration-300"
                        aria-label="Instagram"
                    >
                        <Icon name="Instagram" size={20} />
                    </a>
                )}
                {profile.blog && (
                    <a
                        href={profile.blog}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full text-green-500 hover:scale-110 hover:bg-green-50 transition-all duration-300"
                        aria-label="Blog"
                    >
                        <Icon name="PenTool" size={20} /> {/* Assuming Blog icon or PenTool */}
                    </a>
                )}
                {profile.email && (
                    <a
                        href={profile.email.startsWith('mailto:') ? profile.email : `mailto:${profile.email}`}
                        className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full text-blue-500 hover:scale-110 hover:bg-blue-50 transition-all duration-300"
                        aria-label="Email"
                    >
                        <Icon name="Mail" size={20} />
                    </a>
                )}
            </div>
        </div>
    );
}
