"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/admin";
import { Profile } from "@/prisma/app/generated/prisma-client";

interface ProfileEditorProps {
    profile: Profile;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
    const [isLoading, setIsLoading] = useState(false);

    // We'll manage form state via uncontrolled inputs for simplicity or controlled if needed for validation
    // For 1:1 image, we might need a client-side cropper or just strict CSS. 
    // For now, let's just use simple inputs and maybe a preview.

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            const data: any = {
                name: formData.get("name") as string,
                bio: formData.get("bio") as string,
                banner: formData.get("banner") as string,
                instagram: formData.get("instagram") as string,
                blog: formData.get("blog") as string,
                email: formData.get("email") as string,
            };

            // Handle Image Upload (Mock for now, or use a real storage solution if available)
            // Since we don't have a real storage bucket, we might use base64 or external URL.
            // Let's assume the user pastes a URL for now as per the "manage" requirement not specifying file upload storage.
            // Oh, the requirement says "1:1 비율의 사진을 등록해야함", "만약에 프로필 사진 등록을 하지 않으면 기본 이미지로 대체함".
            // Let's just allow URL input for simplicity unless we want to implement base64.
            // Let's implement base64 for small images or just URL.
            // Given the environment, URL input is safest.

            const imageUrl = formData.get("image") as string;
            data.image = imageUrl || "";

            await updateProfile(data);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const [imagePreview, setImagePreview] = useState(profile.image || "");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setImagePreview(data.url);
        } catch (err) {
            alert("Failed to upload image");
            console.error(err);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Profile Settings</h2>
            <form action={handleSubmit} className="space-y-4">
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
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Profile Image</label>
                    <div className="mt-1 flex items-center space-x-4">
                        <img
                            src={imagePreview || "https://github.com/shadcn.png"}
                            alt="Profile Preview"
                            className="h-12 w-12 rounded-full object-cover bg-gray-100 border border-zinc-200 dark:border-zinc-700"
                        />
                        <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                                <input
                                    name="image"
                                    value={imagePreview}
                                    onChange={(e) => setImagePreview(e.target.value)}
                                    placeholder="https://..."
                                    className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 p-2"
                                />
                                <label className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-2 rounded-md flex items-center justify-center">
                                    <span className="text-sm">Upload</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload a square image (1:1 ratio) or paste a URL.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Banner Image URL</label>
                    <input
                        name="banner"
                        defaultValue={profile.banner || ""}
                        placeholder="https://..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 p-2"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Instagram URL</label>
                        <input
                            name="instagram"
                            defaultValue={profile.instagram || ""}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Blog URL</label>
                        <input
                            name="blog"
                            defaultValue={profile.blog || ""}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email (mailto:)</label>
                        <input
                            name="email"
                            defaultValue={profile.email || ""}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 p-2"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}
