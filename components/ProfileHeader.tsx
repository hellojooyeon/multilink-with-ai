import Image from "next/image";
import { Profile } from "@/prisma/app/generated/prisma-client";
import { Icon } from "@/components/Icon";

interface ProfileHeaderProps {
    profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    // Cast profile to include socialLinks as we know they are fetched
    const socialLinks = (profile as any).socialLinks as { platform: string; url: string }[] || [];

    const getIcon = (platform: string) => {
        switch (platform) {
            case 'youtube': return 'Youtube';
            case 'twitter': return 'Twitter';
            case 'instagram': return 'Instagram';
            case 'blog': return 'PenTool'; // or FileText
            case 'custom': return 'Link';
            default: return 'Link';
        }
    };

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'youtube': return 'text-red-600 hover:bg-red-50';
            case 'twitter': return 'text-blue-400 hover:bg-blue-50';
            case 'instagram': return 'text-pink-600 hover:bg-pink-50';
            case 'blog': return 'text-green-600 hover:bg-green-50';
            default: return 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800';
        }
    };

    return (
        <div className="flex flex-col items-center text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {profile.banner && (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden shadow-md -mx-4 group">
                    <Image
                        src={profile.banner}
                        alt={`${profile.name} banner`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                    />
                </div>
            )}
            <div className={`relative w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-white dark:border-zinc-950 shadow-xl z-10 bg-white dark:bg-zinc-800 flex items-center justify-center ${profile.banner ? '-mt-14' : ''}`}>
                {profile.image === "default:star" ? (
                    <div className="w-full h-full bg-yellow-100 flex items-center justify-center">
                        <Icon name="Star" className="text-yellow-500 fill-yellow-500" size={60} />
                    </div>
                ) : (
                    <Image
                        src={profile.image || "/placeholder-avatar.png"}
                        alt={profile.name}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
            </div>

            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                {profile.name}
            </h1>

            {profile.bio && (
                <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-xs leading-relaxed text-sm">
                    {profile.bio}
                </p>
            )}

            <div className="flex items-center gap-4 flex-wrap justify-center">
                {socialLinks.map((link, idx) => (
                    <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 bg-gray-100 dark:bg-zinc-800 rounded-full hover:scale-110 transition-all duration-300 shadow-sm ${getPlatformColor(link.platform)}`}
                        aria-label={link.platform}
                    >
                        <Icon name={getIcon(link.platform) as any} size={20} />
                    </a>
                ))}

                {/* Legacy or separate Email support */}
                {profile.email && (
                    <a
                        href={profile.email.startsWith('mailto:') ? profile.email : `mailto:${profile.email}`}
                        className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full text-blue-500 hover:scale-110 hover:bg-blue-50 transition-all duration-300 shadow-sm"
                        aria-label="Email"
                    >
                        <Icon name="Mail" size={20} />
                    </a>
                )}
            </div>
        </div>
    );
}
