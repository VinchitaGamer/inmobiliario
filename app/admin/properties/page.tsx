import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getProperties } from "@/app/actions/property"
import { AdminDashboard } from "@/components/shared/admin-dashboard"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Panel de Control Inmobiliario | Bienes Raíces Bolivia",
  description: "Administra todas tus publicaciones de venta, alquiler y anticrético de propiedades en Bolivia.",
}

export default async function AdminPropertiesPage() {
  // 1. Verificación de sesión de administrador en el servidor
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  // 2. Fetch inicial en servidor de todas las propiedades
  const response = await getProperties()
  const properties = response.success ? response.data || [] : []

  return <AdminDashboard initialProperties={properties} />
}
