import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

const LoginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { username, password } = parsed.data
        const adminUser = process.env.ADMIN_USER || "admin"
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

        if (username === adminUser && password === adminPassword) {
          return { 
            id: "admin-id", 
            name: "Administrador", 
            email: "admin@bienesraices.bo", 
            role: "ADMIN" 
          }
        }

        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { 
    signIn: "/login" 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string
      }
      return session
    }
  }
})
