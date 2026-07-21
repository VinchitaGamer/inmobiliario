"use server"

import db from "@/lib/db"
import { auth } from "@/auth"
import { PropertySchema } from "@/lib/schemas/property"
import { revalidatePath } from "next/cache"

export interface PropertyFilters {
  operationType?: string
  propertyType?: string
  locationCity?: string
  locationZone?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minArea?: number
}

// Contrato de Respuesta Bilateral
interface ActionResponse<T> {
  success: boolean
  data: T | null
  error: string | null
  code: number
}

/**
 * Obtener lista de propiedades con filtros aplicados.
 */
export async function getProperties(filters?: PropertyFilters): Promise<ActionResponse<any[]>> {
  try {
    const where: any = {}

    if (filters) {
      if (filters.operationType && filters.operationType !== "TODOS") {
        where.operationType = filters.operationType
      }
      if (filters.propertyType && filters.propertyType !== "TODOS") {
        where.propertyType = filters.propertyType
      }
      if (filters.locationCity && filters.locationCity !== "TODOS") {
        where.locationCity = filters.locationCity
      }
      if (filters.locationZone && filters.locationZone !== "TODOS") {
        where.locationZone = filters.locationZone
      }
      if (filters.bedrooms !== undefined && filters.bedrooms > 0) {
        where.bedrooms = filters.bedrooms >= 4 ? { gte: 4 } : filters.bedrooms
      }
      if (filters.bathrooms !== undefined && filters.bathrooms > 0) {
        where.bathrooms = filters.bathrooms >= 4 ? { gte: 4 } : filters.bathrooms
      }
      
      // Filtros de rangos
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {}
        if (filters.minPrice !== undefined) where.price.gte = filters.minPrice
        if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice
      }
      
      if (filters.minArea !== undefined) {
        where.area = { gte: filters.minArea }
      }
    }

    const properties = await db.property.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      }
    })

    return {
      success: true,
      data: properties,
      error: null,
      code: 200
    }
  } catch (error) {
    console.error("Error al obtener las propiedades de la base de datos:", error)
    return {
      success: false,
      data: null,
      error: "Error al obtener las propiedades de la base de datos",
      code: 500
    }
  }
}

/**
 * Obtener una propiedad específica por ID.
 */
export async function getPropertyById(id: string): Promise<ActionResponse<any>> {
  if (!id) {
    return {
      success: false,
      data: null,
      error: "ID de propiedad no válido",
      code: 400
    }
  }

  try {
    const property = await db.property.findUnique({
      where: { id }
    })

    if (!property) {
      return {
        success: false,
        data: null,
        error: "Propiedad no encontrada",
        code: 404
      }
    }

    return {
      success: true,
      data: property,
      error: null,
      code: 200
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: "Error al obtener los detalles de la propiedad",
      code: 500
    }
  }
}

/**
 * Crear una nueva propiedad.
 * Protegido por sesión y rol de ADMIN.
 */
export async function createProperty(values: unknown): Promise<ActionResponse<any>> {
  // 1. Verificar autenticación y rol
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return {
      success: false,
      data: null,
      error: "No autorizado. Inicie sesión como administrador.",
      code: 403
    }
  }

  // 2. Validar con Zod
  const parsed = PropertySchema.safeParse(values)
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message || "Datos no válidos",
      code: 400
    }
  }

  try {
    const property = await db.property.create({
      data: parsed.data
    })

    revalidatePath("/")
    revalidatePath("/admin/properties")

    return {
      success: true,
      data: property,
      error: null,
      code: 201
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: "Error al crear la propiedad en la base de datos",
      code: 500
    }
  }
}

/**
 * Actualizar una propiedad existente.
 * Protegido por sesión y rol de ADMIN.
 */
export async function updateProperty(id: string, values: unknown): Promise<ActionResponse<any>> {
  // 1. Verificar autenticación y rol
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return {
      success: false,
      data: null,
      error: "No autorizado. Inicie sesión como administrador.",
      code: 403
    }
  }

  if (!id) {
    return {
      success: false,
      data: null,
      error: "ID de propiedad requerido",
      code: 400
    }
  }

  // 2. Validar con Zod
  const parsed = PropertySchema.safeParse(values)
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message || "Datos no válidos",
      code: 400
    }
  }

  try {
    // Verificar si existe la propiedad
    const existing = await db.property.findUnique({ where: { id } })
    if (!existing) {
      return {
        success: false,
        data: null,
        error: "La propiedad que intenta editar no existe",
        code: 404
      }
    }

    const property = await db.property.update({
      where: { id },
      data: parsed.data
    })

    revalidatePath("/")
    revalidatePath("/admin/properties")

    return {
      success: true,
      data: property,
      error: null,
      code: 200
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: "Error al actualizar la propiedad en la base de datos",
      code: 500
    }
  }
}

/**
 * Eliminar una propiedad.
 * Protegido por sesión y rol de ADMIN.
 */
export async function deleteProperty(id: string): Promise<ActionResponse<any>> {
  // 1. Verificar autenticación y rol
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return {
      success: false,
      data: null,
      error: "No autorizado. Inicie sesión como administrador.",
      code: 403
    }
  }

  if (!id) {
    return {
      success: false,
      data: null,
      error: "ID de propiedad requerido",
      code: 400
    }
  }

  try {
    // Verificar si existe la propiedad
    const existing = await db.property.findUnique({ where: { id } })
    if (!existing) {
      return {
        success: false,
        data: null,
        error: "La propiedad que intenta eliminar no existe",
        code: 404
      }
    }

    await db.property.delete({
      where: { id }
    })

    revalidatePath("/")
    revalidatePath("/admin/properties")

    return {
      success: true,
      data: null,
      error: null,
      code: 200
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: "Error al eliminar la propiedad de la base de datos",
      code: 500
    }
  }
}
