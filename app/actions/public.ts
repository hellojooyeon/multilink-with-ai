"use server";

import { prisma } from "@/lib/prisma";

export async function getPublicData() {
    const profile = await prisma.profile.findFirst();

    // Fetch all active links. 
    const links = await prisma.link.findMany({
        where: {
            isActive: true,
        },
        orderBy: { order: 'asc' },
    });

    const groups = await prisma.group.findMany({
        orderBy: { order: 'asc' },
    });

    return { profile, links, groups };
}
