"use server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Check authentication
async function checkAuth() {
    const isAdministrator = await isAdmin();
    if (!isAdministrator) {
        throw new Error("Unauthorized");
    }
}

// Profile Actions
export async function getProfile() {
    await checkAuth();
    return await prisma.profile.findFirst({
        include: { socialLinks: { orderBy: { order: 'asc' } } }
    });
}

export async function updateProfile(data: {
    name: string;
    bio?: string;
    image?: string;
    banner?: string;
    instagram?: string;
    blog?: string;
    email?: string;
    socialLinks?: { platform: string; url: string; order: number }[];
}) {
    await checkAuth();

    // Validate bio length
    if (data.bio && data.bio.length > 1500) {
        throw new Error("Bio exceeds 1500 characters");
    }

    const { socialLinks, ...profileData } = data;

    // Use transaction to update profile and social links
    const profile = await prisma.$transaction(async (tx) => {
        // 1. Update Profile
        const updatedProfile = await tx.profile.upsert({
            where: { id: 1 },
            update: profileData,
            create: { ...profileData, name: data.name },
        });

        // 2. Update Social Links if provided
        if (socialLinks) {
            // Delete existing links for this profile
            await tx.socialLink.deleteMany({
                where: { profileId: updatedProfile.id }
            });

            // Create new links
            if (socialLinks.length > 0) {
                await tx.socialLink.createMany({
                    data: socialLinks.map(link => ({
                        ...link,
                        profileId: updatedProfile.id
                    }))
                });
            }
        }

        return updatedProfile;
    });

    revalidatePath("/");
    return profile;
}

export async function getSocialLinks() {
    await checkAuth();
    // Assuming profile ID is 1
    return await prisma.socialLink.findMany({
        where: { profileId: 1 },
        orderBy: { order: 'asc' }
    });
}

// Group Actions
export async function createGroup(data: { name: string; order?: number }) {
    await checkAuth();
    const group = await prisma.group.create({ data });
    revalidatePath("/admin");
    return group;
}

export async function updateGroup(id: number, data: { name?: string; order?: number }) {
    await checkAuth();
    const group = await prisma.group.update({ where: { id }, data });
    revalidatePath("/admin");
    return group;
}

export async function updateGroupLinks(groupId: number, linkIds: number[]) {
    await checkAuth();

    // 1. Remove all links from this group
    await prisma.link.updateMany({
        where: { groupId },
        data: { groupId: null }
    });

    // 2. Add selected links to this group
    if (linkIds.length > 0) {
        await prisma.link.updateMany({
            where: { id: { in: linkIds } },
            data: { groupId }
        });
    }

    revalidatePath("/");
    revalidatePath("/admin");
}

export async function deleteGroup(id: number) {
    await checkAuth();
    // Optional: Set groupId of links in this group to null or delete them
    // For now, let's set them to null
    await prisma.link.updateMany({
        where: { groupId: id },
        data: { groupId: null },
    });
    const group = await prisma.group.delete({ where: { id } });
    revalidatePath("/admin");
    return group;
}

export async function getGroups() {
    await checkAuth();
    return await prisma.group.findMany({
        orderBy: { order: 'asc' },
        include: { links: true }
    });
}


// Link Actions
export async function createLink(data: {
    title: string;
    url: string;
    image?: string;
    icon?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    groupId?: number;
    isActive?: boolean;
}) {
    await checkAuth();
    // Get max order
    const maxOrderLink = await prisma.link.findFirst({
        orderBy: { order: "desc" },
    });
    const order = (maxOrderLink?.order || 0) + 1;

    const link = await prisma.link.create({
        data: { ...data, order },
    });
    revalidatePath("/");
    revalidatePath("/admin");
    return link;
}

export async function updateLink(id: number, data: {
    title?: string;
    url?: string;
    image?: string;
    icon?: string;
    description?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    groupId?: number | null;
    isActive?: boolean;
    order?: number;
}) {
    await checkAuth();
    const link = await prisma.link.update({ where: { id }, data });
    revalidatePath("/");
    revalidatePath("/admin");
    return link;
}

export async function deleteLink(id: number) {
    await checkAuth();
    const link = await prisma.link.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin");
    return link;
}

export async function getLinks() {
    await checkAuth();
    return await prisma.link.findMany({
        orderBy: { order: "asc" },
    });
}

// Statistics Actions
export async function getStatistics(days: number = 30) {
    await checkAuth();

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    // 1. Main Page Visits by Date
    const visitsByDate = await prisma.$queryRaw`
    SELECT DATE_TRUNC('day', "createdAt") as date, CAST(count(*) AS INTEGER) as count
    FROM "Visit"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
  ` as any[];

    // 2. Link Clicks by Date (Total)
    const clicksByDate = await prisma.$queryRaw`
    SELECT DATE_TRUNC('day', "createdAt") as date, CAST(count(*) AS INTEGER) as count
    FROM "LinkClick"
    WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
  ` as any[];

    // 3. Clicks per Link
    const clicksPerLink = await prisma.linkClick.groupBy({
        by: ['linkId'],
        where: {
            createdAt: {
                gte: start,
                lte: end,
            },
        },
        _count: {
            id: true,
        },
    });

    // Get link details for names
    const links = await prisma.link.findMany({
        where: {
            id: {
                in: clicksPerLink.map(c => c.linkId)
            }
        },
        select: { id: true, title: true }
    });

    const linkStats = clicksPerLink.map(stat => ({
        linkId: stat.linkId,
        title: links.find(l => l.id === stat.linkId)?.title || 'Unknown',
        count: stat._count.id
    }));

    return {
        visitsByDate,
        clicksByDate,
        linkStats
    };
}

export async function getLinkStats(linkId: number, granularity: 'hour' | 'day' | 'month' | 'quarter' | 'year' = 'day') {
    await checkAuth();
    const end = new Date();
    const start = new Date();

    let truncUnit = 'day';

    switch (granularity) {
        case 'hour':
            start.setHours(start.getHours() - 24);
            truncUnit = 'hour';
            break;
        case 'day':
            start.setDate(start.getDate() - 30);
            truncUnit = 'day';
            break;
        case 'month':
            start.setMonth(start.getMonth() - 12);
            truncUnit = 'month';
            break;
        case 'quarter':
            start.setMonth(start.getMonth() - 24); // 8 quarters
            truncUnit = 'quarter';
            break;
        case 'year':
            start.setFullYear(start.getFullYear() - 5);
            truncUnit = 'year';
            break;
    }

    // Prisma.sql is needed for safe raw queries with dynamic parts, but we can't use template literals for table/column names or keywords like date part in DATE_TRUNC directly if it expects a literal. 
    // However, DATE_TRUNC first argument is text.

    // We need to construct the SQL carefully. Prisma $queryRaw uses parameter substitution.
    // The DATE_TRUNC unit must be a string literal in the SQL.

    // Since we control truncUnit from a limited set of strings, we can inject it safely or use a parameter if Postgres allows. Postgres DATE_TRUNC('unit', ...) takes text.

    const data = await prisma.$queryRawUnsafe(`
        SELECT DATE_TRUNC('${truncUnit}', "createdAt") as date, CAST(count(*) AS INTEGER) as count
        FROM "LinkClick"
        WHERE "linkId" = $1 AND "createdAt" >= $2 AND "createdAt" <= $3
        GROUP BY DATE_TRUNC('${truncUnit}', "createdAt")
        ORDER BY date ASC
    `, linkId, start, end);

    return data;
}
