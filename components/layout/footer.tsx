import Link from "next/link"
import { Building2 } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-primary text-white border-t border-primary/20">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Logo & Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Building2 className="h-6 w-6 text-accent" />
              <span>BienesRaíces<span className="text-secondary">Bolivia</span></span>
            </div>
            <p className="text-sm text-secondary/80 max-w-xs">
              La plataforma inmobiliaria más moderna de Bolivia. Encuentra casas, departamentos y terrenos en venta, alquiler o anticrético.
            </p>
          </div>

          {/* Col 2: Ciudades Principales */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-4">Ciudades</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Santa Cruz de la Sierra</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">La Paz</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Cochabamba</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Tarija</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Transacciones */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-4">Transacciones</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Propiedades en Venta</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Alquileres</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Anticréticos en Bolivia</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Nuevos Proyectos</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacto */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-secondary mb-4">Administración</h3>
            <p className="text-sm text-white/80 mb-2">
              ¿Eres agente o propietario? Publica tus inmuebles de forma fácil.
            </p>
            <Link 
              href="/login" 
              className="text-sm font-medium text-secondary hover:text-white transition-colors underline underline-offset-4"
            >
              Acceso Administrativo
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary/60">
          <p>&copy; {currentYear} Bienes Raíces Bolivia. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Términos y Condiciones</span>
            <span className="hover:text-white transition-colors cursor-pointer">Políticas de Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
