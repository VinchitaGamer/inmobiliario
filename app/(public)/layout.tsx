import { auth } from "@/auth"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PropertyDetailModal } from "@/components/shared/property-detail-modal"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Obtener la sesión en el servidor
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg-soft/20">
      {/* Navbar con sesión inyectada */}
      <Navbar session={session} />
      
      {/* Contenido principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer corporativo */}
      <Footer />

      {/* Modal flotante global de detalles de propiedad */}
      <PropertyDetailModal />
    </div>
  )
}
