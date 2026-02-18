import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";

export function middleware(request: NextRequest) {
    const adminSession = request.cookies.get(COOKIE_NAME);
    const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
    const isApiPath = request.nextUrl.pathname.startsWith("/api");
    const isUploadPath = request.nextUrl.pathname.startsWith("/uploads");

    // 관리자 세션이 있는데 admin 경로가 아니면 자동 로그아웃 (API 경로 제외)
    if (adminSession?.value === "true" && !isAdminPath && !isApiPath) {
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
