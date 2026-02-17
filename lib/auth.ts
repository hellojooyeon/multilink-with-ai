"use server";

import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";
const COOKIE_NAME = "admin_session";

export async function isAdmin() {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    return session?.value === "true";
}

export async function login(password: string) {
    if (password === ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 2, // 2시간
        });
        return { success: true };
    }
    return { success: false, error: "Invalid password" };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}
