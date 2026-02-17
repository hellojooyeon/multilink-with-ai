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
export async function updateProfile(data: {
    name: string;
    bio?: string;
    image?: string;
    banner?: string;
    instagram?: string;
    blog?: string;
    email?: string;
}) {
    await checkAuth();

    // Validate bio length
    if (data.bio && data.bio.length > 1500) {
        throw new Error("Bio exceeds 1500 characters");
    }

    const profile = await prisma.profile.upsert({
        where: { id: 1 },
        update: data,
        create: { ...data, name: data.name },
    });

    revalidatePath("/");
    return profile;
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
    variant?: string;
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
    variant?: string;
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
    const visits = await prisma.visit.groupBy({
        by: ['createdAt'],
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

    // Prisma groupBy date returns full datetime, we need to aggregate by day manually or using raw query.
    // SQLite doesn't have easy date truncation in Prisma groupBy yet without raw query.
    // Let's use raw query for easier aggregation by day

    const visitsByDate = await prisma.$queryRaw`
    SELECT date(createdAt) as date, count(*) as count
    FROM Visit
    WHERE createdAt >= ${start} AND createdAt <= ${end}
    GROUP BY date(createdAt)
    ORDER BY date(createdAt) ASC
  ` as any[];

    // 2. Link Clicks by Date (Total)
    const clicksByDate = await prisma.$queryRaw`
    SELECT date(createdAt) as date, count(*) as count
    FROM LinkClick
    WHERE createdAt >= ${start} AND createdAt <= ${end}
    GROUP BY date(createdAt)
    ORDER BY date(createdAt) ASC
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

export async function getLinkDailyStats(linkId: number, days: number = 30) {
    await checkAuth();
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const data = await prisma.$queryRaw`
        SELECT date(createdAt) as date, count(*) as count
        FROM LinkClick
        WHERE linkId = ${linkId} AND createdAt >= ${start} AND createdAt <= ${end}
        GROUP BY date(createdAt)
        ORDER BY date(createdAt) ASC
    `;

    return data;
}
