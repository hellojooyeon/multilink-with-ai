import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";

export function middleware(request: NextRequest) {
    const adminSession = request.cookies.get(COOKIE_NAME);
    const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

    // 관리자 세션이 있는데 admin 경로가 아니면 자동 로그아웃
    if (adminSession?.value === "true" && !isAdminPath) {
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
