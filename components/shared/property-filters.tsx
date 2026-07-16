"use client"

import { useEffect, useState } from "react"
import { usePropertyStore } from "@/store/property-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, SlidersHorizontal } from "lucide-react"

// Zonas pre-cargadas en Bolivia
export const BOLIVIA_LOCATIONS: Record<string, string[]> = {
  "Santa Cruz": ["Equipetrol", "Urubó", "Sirari", "Las Palmas", "Zona Norte"],
  "La Paz": ["Sopocachi", "Calacoto", "Obrajes", "Miraflores", "San Miguel"],
  "Cochabamba": ["Queru Queru", "Cala Cala", "América Oeste", "El Prado", "Muyurina"],
}

export function PropertyFilters() {
  const { filters, setFilters, resetFilters } = usePropertyStore()
  const [localMinPrice, setLocalMinPrice] = useState<string>("")
  const [localMaxPrice, setLocalMaxPrice] = useState<string>("")

  // Sincronizar inputs numéricos locales cuando se resetean los filtros
  useEffect(() => {
    setLocalMinPrice(filters.minPrice !== undefined ? String(filters.minPrice) : "")
    setLocalMaxPrice(filters.maxPrice !== undefined ? String(filters.maxPrice) : "")
  }, [filters.minPrice, filters.maxPrice])

  // Obtener zonas disponibles según la ciudad seleccionada
  const availableZones = filters.locationCity && filters.locationCity !== "TODOS"
    ? BOLIVIA_LOCATIONS[filters.locationCity] || []
    : []

  const handleCityChange = (city: string | null) => {
    const cityVal = city || "TODOS"
    // Al cambiar de ciudad, reseteamos la zona seleccionada
    setFilters({ 
      locationCity: cityVal, 
      locationZone: "TODOS" 
    })
  }

  const handlePriceApply = () => {
    const min = localMinPrice !== "" ? Number(localMinPrice) : undefined
    const max = localMaxPrice !== "" ? Number(localMaxPrice) : undefined
    setFilters({ minPrice: min, maxPrice: max })
  }

  return (
    <div className="w-full rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <SlidersHorizontal className="h-5 w-5 text-accent" />
          <span>Filtros de Búsqueda</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            resetFilters()
            setLocalMinPrice("")
            setLocalMaxPrice("")
          }}
          className="text-xs text-foreground/60 hover:text-primary gap-1"
        >
          <X className="h-3 w-3" />
          Limpiar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Ciudad */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground/70 uppercase">Ciudad</span>
          <Select 
            value={filters.locationCity || "TODOS"} 
            onValueChange={handleCityChange}
          >
            <SelectTrigger className="w-full focus:ring-primary border-border">
              <SelectValue placeholder="Seleccione Ciudad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todas las Ciudades</SelectItem>
              <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
              <SelectItem value="La Paz">La Paz</SelectItem>
              <SelectItem value="Cochabamba">Cochabamba</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Zona */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground/70 uppercase">Zona / Barrio</span>
          <Select 
            value={filters.locationZone || "TODOS"} 
            onValueChange={(val) => setFilters({ locationZone: val || "TODOS" })}
            disabled={!filters.locationCity || filters.locationCity === "TODOS"}
          >
            <SelectTrigger className="w-full focus:ring-primary border-border">
              <SelectValue placeholder="Seleccione Zona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todas las Zonas</SelectItem>
              {availableZones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Propiedad */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground/70 uppercase">Tipo de Inmueble</span>
          <Select 
            value={filters.propertyType || "TODOS"} 
            onValueChange={(val) => setFilters({ propertyType: val || "TODOS" })}
          >
            <SelectTrigger className="w-full focus:ring-primary border-border">
              <SelectValue placeholder="Seleccione Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos los Tipos</SelectItem>
              <SelectItem value="Casa">Casa</SelectItem>
              <SelectItem value="Departamento">Departamento</SelectItem>
              <SelectItem value="Terreno">Terreno</SelectItem>
              <SelectItem value="Oficina">Oficina</SelectItem>
              <SelectItem value="Local">Local Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rango de Precios */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground/70 uppercase">Precio Max (USD)</span>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-1/2 border-border"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-1/2 border-border"
            />
            <Button 
              size="icon" 
              onClick={handlePriceApply}
              className="bg-primary hover:bg-primary/95 text-white shrink-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros avanzados adicionales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/40">
        {/* Dormitorios */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <span className="text-xs font-semibold text-foreground/70 uppercase shrink-0">Dormitorios:</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setFilters({ bedrooms: num })}
                className={`h-8 w-8 text-xs font-bold rounded-full transition-all border ${
                  (filters.bedrooms || 0) === num
                    ? "bg-primary border-primary text-white"
                    : "bg-transparent border-border text-foreground hover:bg-muted"
                }`}
              >
                {num === 0 ? "Any" : num === 4 ? "4+" : num}
              </button>
            ))}
          </div>
        </div>

        {/* Baños */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <span className="text-xs font-semibold text-foreground/70 uppercase shrink-0">Baños:</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setFilters({ bathrooms: num })}
                className={`h-8 w-8 text-xs font-bold rounded-full transition-all border ${
                  (filters.bathrooms || 0) === num
                    ? "bg-primary border-primary text-white"
                    : "bg-transparent border-border text-foreground hover:bg-muted"
                }`}
              >
                {num === 0 ? "Any" : num === 4 ? "4+" : num}
              </button>
            ))}
          </div>
        </div>

        {/* Metraje Mínimo */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <span className="text-xs font-semibold text-foreground/70 uppercase shrink-0">Área Mín:</span>
          <div className="flex items-center gap-1.5 w-full max-w-[120px]">
            <Input
              type="number"
              placeholder="m²"
              value={filters.minArea !== undefined ? String(filters.minArea) : ""}
              onChange={(e) => {
                const val = e.target.value !== "" ? Number(e.target.value) : undefined
                setFilters({ minArea: val })
              }}
              className="h-8 border-border text-xs"
            />
            <span className="text-xs text-foreground/60">m²</span>
          </div>
        </div>
      </div>
    </div>
  )
}
