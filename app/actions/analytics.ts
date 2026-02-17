"use server";

import { prisma } from "@/lib/prisma";

export async function recordVisit() {
    await prisma.visit.create({
        data: {},
    });
}

export async function recordLinkClick(linkId: number) {
    try {
        await prisma.linkClick.create({
            data: {
                linkId,
            },
        });
    } catch (error) {
        console.error("Failed to record link click:", error);
    }
}
