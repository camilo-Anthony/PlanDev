import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ["/", "/login", "/register", "/shared"];
    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith("/shared/")
    );

    // API routes públicas
    const publicApiRoutes = ["/api/auth", "/api/shared"];
    const isPublicApiRoute = publicApiRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Si es ruta pública, permitir acceso
    if (isPublicRoute || isPublicApiRoute) {
        return NextResponse.next();
    }

    // Si no está logueado, redirigir a login
    if (!isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
