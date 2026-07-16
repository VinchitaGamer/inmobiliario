"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { usePropertyStore } from "@/store/property-store"
import { Button } from "@/components/ui/button"
import { Building2, User, LayoutDashboard, LogOut } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"

interface NavbarProps {
  session: any | null
}

export function Navbar({ session }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { setFilters, resetFilters } = usePropertyStore()

  const handleNavClick = (operationType: string) => {
    resetFilters()
    setFilters({ operationType })
    if (pathname !== "/") {
      router.push("/")
    }
  }

  const handleLogout = async () => {
    const res = await logoutAction()
    if (res.success) {
      router.refresh()
      router.push("/")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link 
          href="/" 
          onClick={() => { resetFilters(); if (pathname !== "/") router.push("/") }}
          className="flex items-center gap-2 font-bold text-xl text-primary transition-colors hover:opacity-90"
        >
          <Building2 className="h-6 w-6 text-accent" />
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            BienesRaíces<span className="text-accent">Bolivia</span>
          </span>
        </Link>

        {/* Clasificación Estilo Infocasas */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleNavClick("VENTA")}
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary hover:border-b-2 hover:border-primary py-1"
          >
            Venta
          </button>
          <button
            onClick={() => handleNavClick("ALQUILER")}
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary hover:border-b-2 hover:border-primary py-1"
          >
            Alquiler
          </button>
          <button
            onClick={() => handleNavClick("ANTICRETICO")}
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary hover:border-b-2 hover:border-primary py-1"
          >
            Anticrético
          </button>
          <button
            onClick={() => handleNavClick("PROYECTO")}
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-accent hover:border-b-2 hover:border-accent py-1"
          >
            Proyectos
          </button>
        </nav>

        {/* Botón de Cuenta / Panel Admin */}
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-2">
              <Link href="/admin/properties">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Panel Admin</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-primary border-primary hover:bg-primary/5">
                <User className="h-4 w-4" />
                <span>Ingresar</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
