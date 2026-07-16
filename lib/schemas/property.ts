import { z } from "zod"

export const PropertySchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  operationType: z.enum(["VENTA", "ALQUILER", "ANTICRETICO", "PROYECTO"]),
  propertyType: z.string().min(1, "El tipo de propiedad es requerido"),
  price: z.number().positive("El precio debe ser un número positivo"),
  currency: z.enum(["USD", "BOB"]),
  locationCity: z.string().min(1, "La ciudad es requerida"),
  locationZone: z.string().min(1, "La zona es requerida"),
  bedrooms: z.number().int().nonnegative("La cantidad de dormitorios debe ser un número entero no negativo").default(0),
  bathrooms: z.number().int().nonnegative("La cantidad de baños debe ser un número entero no negativo").default(0),
  area: z.number().positive("El metraje debe ser un número positivo"),
  images: z.array(z.string().url("Debe ser una URL válida")).min(1, "Debe agregar al menos una imagen"),
  features: z.array(z.string()).default([]),
  contactPhone: z.string().min(8, "El teléfono de contacto debe tener al menos 8 caracteres"),
  isFeatured: z.boolean().default(false),
})

export const LoginSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
})

export type PropertyInput = z.infer<typeof PropertySchema>
export type LoginInput = z.infer<typeof LoginSchema>
