import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("lms_token")?.value;
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname === "/";

  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};

