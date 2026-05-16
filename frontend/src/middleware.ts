import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isPublicPage = req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/login");

    if (isPublicPage) {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isPublicPage = req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/login");
        if (isPublicPage) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/absences/:path*",
    "/rattrapages/:path*",
    "/login",
    "/",
  ],
};
