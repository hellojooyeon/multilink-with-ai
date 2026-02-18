"use client";

import { useState } from "react";
import { Link as LinkType, Group } from "@/prisma/app/generated/prisma-client";
import { createLink, updateLink, deleteLink, createGroup, updateGroup, deleteGroup, updateGroupLinks } from "@/app/actions/admin";
import { Icon } from "@/components/Icon";
import { LinkItem } from "@/components/LinkItem";

interface LinkManagerProps {
    links: LinkType[];
    groups: (Group & { links: LinkType[] })[];
}

export function LinkManager({ links, groups }: LinkManagerProps) {
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [editingLink, setEditingLink] = useState<LinkType | null>(null);

    // Group State
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);

    // Simple Group Management
    const handleCreateGroup = async (formData: FormData) => {
        const name = formData.get("name") as string;
        await createGroup({ name });
        setIsCreatingGroup(false);
    };

    const handleUpdateGroup = async (formData: FormData) => {
        if (!editingGroup) return;

        const name = formData.get("name") as string;
        await updateGroup(editingGroup.id, { name });

        // Handle Link associations
        const linkIdStrings = formData.getAll("linkIds") as string[];
        const linkIds = linkIdStrings.map(id => parseInt(id));

        await updateGroupLinks(editingGroup.id, linkIds);
        setEditingGroup(null);
    }

    const handleDeleteGroup = async (id: number) => {
        if (confirm("Are you sure? Links in this group will be ungrouped.")) {
            await deleteGroup(id);
        }
    };

    // Link Management
    const handleSaveLink = async (formData: FormData) => {
        const title = formData.get("title") as string;
        const url = formData.get("url") as string;
        const image = formData.get("image") as string;
        const icon = formData.get("icon") as string;
        const description = formData.get("description") as string;
        const isActive = formData.get("isActive") === "on";
        const startDateStr = formData.get("startDate") as string;
        const endDateStr = formData.get("endDate") as string;
        const groupIdStr = formData.get("groupId") as string;

        const data: any = {
            title,
            url,
            image: image || null,
            icon: icon || null,
            description: description || null,
            isActive,
            groupId: groupIdStr ? parseInt(groupIdStr) : null,
            startDate: startDateStr ? new Date(startDateStr) : null,
            endDate: endDateStr ? new Date(endDateStr) : null,
        };

        if (editingLink) {
            await updateLink(editingLink.id, data);
            setEditingLink(null);
        } else {
            await createLink(data);
            setIsCreatingLink(false);
        }
    };

    const handleDeleteLink = async (id: number) => {
        if (confirm("Delete this link?")) {
            await deleteLink(id);
        }
    };

    // Filter Ungrouped Links (links where groupId is null)
    // Actually, the props might need to be structured better. 
    // `links` prop contains ALL links or just ungrouped?
    // Let's assume `links` contains ALL via `getLinks`, and `groups` via `getGroups`.
    // We should strictly use what's passed.
    // If we want to show "Ungrouped" section, we filter `links` where `groupId` is null.

    const ungroupedLinks = links.filter(l => l.groupId === null);

    return (
        <div className="space-y-8">
            {/* Group Management Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Link Management</h2>
                <div className="space-x-2">
                    <a
                        href="/admin/preview"
                        target="_blank"
                        className="px-3 py-1 text-sm bg-zinc-200 dark:bg-zinc-800 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 inline-block"
                    >
                        Preview Main Page
                    </a>
                    <button
                        onClick={() => setIsCreatingGroup(true)}
                        className="px-3 py-1 text-sm bg-zinc-200 dark:bg-zinc-800 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    >
                        + New Group
                    </button>
                    <button
                        onClick={() => setIsCreatingLink(true)}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        + New Link
                    </button>
                </div>
            </div>

            {/* Create Group Form */}
            {isCreatingGroup && (
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded border border-zinc-200 dark:border-zinc-800">
                    <form action={handleCreateGroup} className="flex gap-2">
                        <input name="name" placeholder="Group Name (e.g. 🎨 Portfolio)" className="flex-1 p-2 rounded border" required />
                        <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded">reate</button>
                        <button type="button" onClick={() => setIsCreatingGroup(false)} className="px-4 py-2 border rounded">Cancel</button>
                    </form>
                </div>
            )}

            {/* Edit Group Modal */}
            {editingGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">Edit Group</h3>
                        <form action={handleUpdateGroup} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Group Name</label>
                                <input name="name" defaultValue={editingGroup.name} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Manage Links</label>
                                <div className="max-h-60 overflow-y-auto border rounded dark:border-zinc-700 p-2 space-y-1">
                                    {links.map(link => (
                                        <div key={link.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded">
                                            <input
                                                type="checkbox"
                                                name="linkIds"
                                                value={link.id}
                                                defaultChecked={link.groupId === editingGroup.id}
                                                id={`link-${link.id}`}
                                            />
                                            <label htmlFor={`link-${link.id}`} className="text-sm cursor-pointer flex-1 truncate">
                                                {link.title} <span className="text-zinc-400 text-xs">({link.url})</span>
                                            </label>
                                        </div>
                                    ))}
                                    {links.length === 0 && <p className="text-sm text-zinc-500 text-center py-2">No links available</p>}
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Select links to include in this group.</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setEditingGroup(null)} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Link Form (Create/Edit) */}
            {(isCreatingLink || editingLink) && (
                <LinkModal
                    link={editingLink}
                    groups={groups}
                    onClose={() => { setIsCreatingLink(false); setEditingLink(null); }}
                    onSave={async (data) => {
                        // Sanitize data for server action
                        const payload = {
                            title: data.title,
                            url: data.url,
                            description: data.description || undefined,
                            image: data.image || undefined,
                            icon: data.icon || undefined,
                            groupId: data.groupId || undefined, // Convert null to undefined
                            isActive: data.isActive,
                            startDate: data.startDate || undefined,
                            endDate: data.endDate || undefined,
                        };

                        if (editingLink) {
                            await updateLink(editingLink.id, payload);
                            setEditingLink(null);
                        } else {
                            await createLink(payload as any); // Type assertion if needed, or strict
                            setIsCreatingLink(false);
                        }
                    }}
                />
            )}

            {/* Groups and Links Display */}
            <div className="space-y-6">
                {groups.map(group => (
                    <div key={group.id} className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-800 overflow-hidden">
                        <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 px-4 flex justify-between items-center border-b border-gray-100 dark:border-zinc-800">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{group.name}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setEditingGroup(group)} className="text-sm text-indigo-600 hover:text-indigo-500">Edit</button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => handleDeleteGroup(group.id)} className="text-red-500 text-xs hover:underline">Delete Group</button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {/* We filter specific links for this group from the main links array to ensure reactivity if we passed full list */}
                            {/* But prop `groups` already has `links`. Let's use `links` prop to filter to be safe if `groups` prop is stale compared to `links` prop, but typically `groups` included links. 
                                Actually, `getGroups` includes links. Let's iterate `groups.links` if that's what we passed.
                                Wait, in `LinkManager` props I defined `groups: (Group & { links: LinkType[] })[]`.
                                But I also passed `links: LinkType[]`. This is redundant but flexible.
                                Let's just use `group.links` but be careful about sync.
                                Better: Use the `links` prop and filter by `groupId`.
                             */}
                            {links.filter(l => l.groupId === group.id).length === 0 && (
                                <div className="p-4 text-center text-sm text-zinc-400">No links in this group</div>
                            )}
                            {links.filter(l => l.groupId === group.id).map(link => (
                                <LinkRow key={link.id} link={link} onEdit={setEditingLink} onDelete={handleDeleteLink} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Ungrouped Links */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-100 dark:border-zinc-800 overflow-hidden">
                    <div className="bg-gray-50 dark:bg-zinc-800/50 p-3 px-4 border-b border-gray-100 dark:border-zinc-800">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-200">Ungrouped</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {ungroupedLinks.length === 0 && (
                            <div className="p-4 text-center text-sm text-zinc-400">No ungrouped links</div>
                        )}
                        {ungroupedLinks.map(link => (
                            <LinkRow key={link.id} link={link} onEdit={setEditingLink} onDelete={handleDeleteLink} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LinkRow({ link, onEdit, onDelete }: { link: LinkType, onEdit: (l: LinkType) => void, onDelete: (id: number) => void }) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden">
                    {link.image ? (
                        <img src={link.image} alt={link.title} className="w-full h-full object-cover" />
                    ) : (
                        link.icon ? <Icon name={link.icon} size={16} /> : <span className="text-xs">🔗</span>
                    )}
                </div>
                <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{link.title}</div>
                    <div className="text-xs text-zinc-500">{link.url}</div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs ${link.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {link.isActive ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => onEdit(link)} className="text-sm text-indigo-600 hover:text-indigo-500">Edit</button>
                <button onClick={() => onDelete(link.id)} className="text-sm text-red-600 hover:text-red-500">Delete</button>
            </div>
        </div>
    );
}



function LinkModal({ link, groups, onClose, onSave }: {
    link: LinkType | null,
    groups: (Group & { links: LinkType[] })[],
    onClose: () => void,
    onSave: (data: any) => Promise<void>
}) {
    // Initialize state with link data or defaults
    const [formData, setFormData] = useState<Partial<LinkType>>({
        title: link?.title || "",
        url: link?.url || "",
        description: link?.description || "",
        image: link?.image || "",
        icon: link?.icon || "",
        groupId: link?.groupId || null,
        isActive: link?.isActive ?? true,
        startDate: link?.startDate || null,
        endDate: link?.endDate || null,
        // Mock required fields for preview
        id: link?.id || 0,
        createdAt: link?.createdAt || new Date(),
        updatedAt: link?.updatedAt || new Date(),
        order: link?.order || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'startDate' || name === 'endDate') {
            setFormData(prev => ({ ...prev, [name]: value ? new Date(value) : null }));
        } else if (name === 'groupId') {
            setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

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
            setFormData(prev => ({ ...prev, image: data.url }));
        } catch (err) {
            alert("Failed to upload image");
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    }

    // Prepare preview data (ensure it matches LinkType fully for the component)
    const previewLink: LinkType = {
        ...formData,
        clicks: [], // Mock relation
    } as LinkType;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-4xl w-full shadow-xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-6">

                {/* Left Column: Form */}
                <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-bold mb-4">{link ? 'Edit Link' : 'New Link'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input name="title" value={formData.title || ""} onChange={handleChange} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">URL</label>
                            <input name="url" value={formData.url || ""} onChange={handleChange} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" value={formData.description || ""} onChange={handleChange} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Image</label>
                                <div className="flex gap-2">
                                    <input
                                        name="image"
                                        value={formData.image || ""}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                    <label className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 p-2 rounded flex items-center justify-center min-w-[40px]">
                                        <span className="text-xs">📂</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Icon</label>
                                <input name="icon" value={formData.icon || ""} onChange={handleChange} placeholder="e.g. Github" className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Group</label>
                            <select name="groupId" value={formData.groupId || ""} onChange={handleChange} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700">
                                <option value="">None</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleChange} id="isActive" />
                            <label htmlFor="isActive">Active</label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t dark:border-zinc-800 mt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Preview */}
                <div className="w-full md:w-[320px] shrink-0 border-l dark:border-zinc-800 pl-6 flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-zinc-500">Live Preview</h3>
                    <div className="flex-1 flex flex-col gap-6 overflow-y-auto">

                        <div>
                            <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase">Card View</p>
                            <div className="max-w-[200px] mx-auto">
                                <LinkItem link={previewLink} viewMode="card" />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase">List View</p>
                            <LinkItem link={previewLink} viewMode="list" />
                        </div>

                        {/* Mobile Preview Context (Optional helpful text) */}
                        <div className="mt-auto p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-lg">
                            ℹ️ This is how your link will appear to visitors. Changes here are <strong>not saved</strong> until you click Save.
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
