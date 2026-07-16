import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith("/admin")
  const isLoginRoute = pathname.startsWith("/login")

  // Si intenta entrar al admin y no está autenticado, redirigir a /login
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Si ya está autenticado e intenta entrar a /login, redirigir al panel admin
  if (isLoginRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/properties", req.url))
  }

  return NextResponse.next()
})

export const config = {
  // matcher que excluye archivos estáticos, api/auth y recursos
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
