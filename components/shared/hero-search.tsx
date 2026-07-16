"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { usePropertyStore } from "@/store/property-store"
import { cn } from "@/lib/utils"

interface HeroSearchProps {
  activeOperation: string
}

export function HeroSearch({ activeOperation }: HeroSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setFilters } = usePropertyStore()

  const tabs = [
    { id: "TODOS", label: "Todos" },
    { id: "VENTA", label: "Venta" },
    { id: "ALQUILER", label: "Alquiler" },
    { id: "ANTICRETICO", label: "Anticrético" },
    { id: "PROYECTO", label: "Proyectos" },
  ]

  const handleTabChange = (tabId: string) => {
    // 1. Sincronizar store local
    setFilters({ operationType: tabId })
    
    // 2. Sincronizar URL para forzar fetch en el servidor
    const params = new URLSearchParams(searchParams.toString())
    if (tabId === "TODOS") {
      params.delete("operationType")
    } else {
      params.set("operationType", tabId)
    }
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#053671] via-[#053671]/95 to-[#B8CDE2]/40 py-10 md:py-14 text-white">
      {/* Círculos decorativos de gradiente */}
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container mx-auto px-4 text-center relative z-10 sm:px-6 lg:px-8 space-y-4">
        {/* Pestañas de Operación Estilo Infocasas */}
        <div className="flex justify-center">
          <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/15 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "px-4 py-2 text-xs md:text-sm font-bold rounded-full transition-all duration-200 cursor-pointer",
                  activeOperation === tab.id
                    ? "bg-accent text-white shadow-md scale-105"
                    : "text-white/90 hover:text-white hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
