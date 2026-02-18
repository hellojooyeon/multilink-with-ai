"use client";

import { useState, ChangeEvent } from "react";
import { updateProfile } from "@/app/actions/admin";
import { Profile } from "@/prisma/app/generated/prisma-client";
import { Plus, Trash2, Upload, Star } from "lucide-react";

// Extended Profile type to include socialLinks for local state
interface SocialLink {
    platform: string;
    url: string;
    order: number;
}

interface ExtendedProfile extends Profile {
    socialLinks?: SocialLink[];
}

interface ProfileEditorProps {
    profile: ExtendedProfile;
}

const SOCIAL_PLATFORMS = [
    { value: "youtube", label: "YouTube" },
    { value: "twitter", label: "Twitter" },
    { value: "instagram", label: "Instagram" },
    { value: "blog", label: "Blog" },
    { value: "custom", label: "Custom" },
];

export function ProfileEditor({ profile }: ProfileEditorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(profile.image || "");
    const [bannerPreview, setBannerPreview] = useState(profile.banner || "");

    // Initialize social links from profile or default to empty array
    // Mapped from profile.socialLinks if available, or fallback to legacy columns for initial migration
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
        if (profile.socialLinks && profile.socialLinks.length > 0) {
            return profile.socialLinks.map(l => ({ platform: l.platform, url: l.url, order: l.order }));
        }
        // Fallback for migration: populate from legacy columns if explicit socialLinks are empty
        const legacyLinks: SocialLink[] = [];
        if (profile.instagram) legacyLinks.push({ platform: 'instagram', url: profile.instagram, order: 0 });
        if (profile.blog) legacyLinks.push({ platform: 'blog', url: profile.blog, order: 1 });
        return legacyLinks;
    });

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            if (type === 'image') setImagePreview(data.url);
            else setBannerPreview(data.url);
        } catch (err) {
            alert(`Failed to upload ${type}`);
            console.error(err);
        }
    };

    const addSocialLink = () => {
        // Find first unused platform
        const usedPlatforms = socialLinks.map(l => l.platform);
        const availablePlatform = SOCIAL_PLATFORMS.find(p => p.value !== 'custom' && !usedPlatforms.includes(p.value))?.value || 'custom';

        setSocialLinks([...socialLinks, { platform: availablePlatform, url: "", order: socialLinks.length }]);
    };

    const removeSocialLink = (index: number) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
        const newLinks = [...socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setSocialLinks(newLinks);
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const data: any = {
                name: formData.get("name") as string,
                bio: formData.get("bio") as string,
                image: imagePreview,
                banner: bannerPreview,
                email: formData.get("email") as string,
                socialLinks: socialLinks, // Pass the array of social links
            };

            await updateProfile(data);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Profile Settings</h2>
            <form action={handleSubmit} className="space-y-8">
                {/* Images Section */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Profile Image</label>
                        <div className="flex items-center gap-4">
                            {imagePreview === "default:star" ? (
                                <div className="h-20 w-20 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center">
                                    <Star className="text-yellow-500 fill-yellow-500" size={40} />
                                </div>
                            ) : (
                                <img
                                    src={imagePreview || "https://github.com/shadcn.png"}
                                    alt="Profile Preview"
                                    className="h-20 w-20 rounded-full object-cover bg-gray-100 border border-zinc-200 dark:border-zinc-700"
                                />
                            )}
                            <div className="flex-1 space-y-2">
                                <div className="flex gap-2">
                                    <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                                        <Upload size={16} className="mr-2" />
                                        Upload Image
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'image')} />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setImagePreview("default:star")}
                                        className="inline-flex items-center justify-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Remove
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">Recommended: Square image (1:1), max 5MB. 'Remove' sets default Star icon.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Banner Image</label>
                        <div className="space-y-3">
                            {bannerPreview && (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                    <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700">
                                    <Upload size={16} className="mr-2" />
                                    {bannerPreview ? "Change Banner" : "Upload Banner"}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} />
                                </label>
                                {bannerPreview && (
                                    <button
                                        type="button"
                                        onClick={() => setBannerPreview("")}
                                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                        <input
                            name="name"
                            defaultValue={profile.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio (Max 1500 chars)</label>
                        <textarea
                            name="bio"
                            defaultValue={profile.bio || ""}
                            maxLength={1500}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email (Contact)</label>
                        <input
                            name="email"
                            defaultValue={profile.email || ""}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 p-2"
                        />
                    </div>
                </div>

                {/* Social Links Manager */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-lg font-medium text-zinc-900 dark:text-white">Social Links</label>
                        <button
                            type="button"
                            onClick={addSocialLink}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus size={16} className="mr-1" />
                            Add Link
                        </button>
                    </div>

                    <div className="space-y-3">
                        {socialLinks.length === 0 && (
                            <p className="text-sm text-zinc-500 italic text-center py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                No social links added yet.
                            </p>
                        )}
                        {socialLinks.map((link, index) => (
                            <div key={index} className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                                <select
                                    value={link.platform}
                                    onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-600 p-2"
                                >
                                    {SOCIAL_PLATFORMS.map(p => {
                                        // Disable if platform is used by another link (not the current one),
                                        // unless it's 'custom' which can be duplicated.
                                        const isUsed = socialLinks.some((l, i) => i !== index && l.platform === p.value);
                                        const isDisabled = isUsed && p.value !== 'custom';

                                        return (
                                            <option key={p.value} value={p.value} disabled={isDisabled}>
                                                {p.label} {isDisabled ? '(Used)' : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                                <input
                                    type="text"
                                    value={link.url}
                                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                                    placeholder="https://..."
                                    className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-600 p-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSocialLink(index)}
                                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isLoading ? "Saving Changes..." : "Save Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}
