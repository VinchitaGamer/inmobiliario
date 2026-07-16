"use server"

import { signIn, signOut } from "@/auth"
import { LoginSchema } from "@/lib/schemas/property"
import { AuthError } from "next-auth"

export async function loginAction(values: unknown) {
  const parsed = LoginSchema.safeParse(values)
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message || "Credenciales no válidas",
      code: 400,
    }
  }

  const { username, password } = parsed.data

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    })
    
    return {
      success: true,
      data: { username },
      error: null,
      code: 200,
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { 
        success: false, 
        data: null, 
        error: "Usuario o contraseña incorrectos", 
        code: 401 
      }
    }
    
    // Si es un error de redirección de Next.js, lo dejamos pasar
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error
    }

    return { 
      success: false, 
      data: null, 
      error: "Ocurrió un error inesperado al iniciar sesión", 
      code: 500 
    }
  }
}

export async function logoutAction() {
  try {
    await signOut({ redirect: false })
    return {
      success: true,
      data: null,
      error: null,
      code: 200,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: "No se pudo cerrar la sesión",
      code: 500,
    }
  }
}
