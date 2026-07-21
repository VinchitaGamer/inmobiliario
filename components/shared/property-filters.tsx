"use client"

import { useEffect, useState } from "react"
import { usePropertyStore } from "@/store/property-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

// Zonas pre-cargadas en Bolivia
export const BOLIVIA_LOCATIONS: Record<string, string[]> = {
  "Santa Cruz": ["Equipetrol", "Urubó", "Sirari", "Las Palmas", "Zona Norte"],
  "La Paz": ["Sopocachi", "Calacoto", "Obrajes", "Miraflores", "San Miguel"],
  "Cochabamba": ["Queru Queru", "Cala Cala", "América Oeste", "El Prado", "Muyurina"],
}

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const { filters, setFilters, resetFilters } = usePropertyStore()
  const [localMinPrice, setLocalMinPrice] = useState<string>("")
  const [localMaxPrice, setLocalMaxPrice] = useState<string>("")
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Sincronizar URL a Zustand al montar y cuando cambie la URL (para soportar navegación directa o refrescos)
  useEffect(() => {
    const city = searchParams.get("locationCity") || "TODOS"
    const zone = searchParams.get("locationZone") || "TODOS"
    const type = searchParams.get("propertyType") || "TODOS"
    const minP = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
    const maxP = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
    const beds = searchParams.get("bedrooms") ? Number(searchParams.get("bedrooms")) : 0
    const baths = searchParams.get("bathrooms") ? Number(searchParams.get("bathrooms")) : 0
    const area = searchParams.get("minArea") ? Number(searchParams.get("minArea")) : undefined
    const op = searchParams.get("operationType") || "TODOS"

    setFilters({
      locationCity: city,
      locationZone: zone,
      propertyType: type,
      minPrice: minP,
      maxPrice: maxP,
      bedrooms: beds,
      bathrooms: baths,
      minArea: area,
      operationType: op
    })
  }, [searchParams, setFilters])

  // Sincronizar inputs numéricos locales cuando cambian en el store
  useEffect(() => {
    setLocalMinPrice(filters.minPrice !== undefined ? String(filters.minPrice) : "")
    setLocalMaxPrice(filters.maxPrice !== undefined ? String(filters.maxPrice) : "")
  }, [filters.minPrice, filters.maxPrice])

  // Obtener zonas disponibles según la ciudad seleccionada
  const availableZones = filters.locationCity && filters.locationCity !== "TODOS"
    ? BOLIVIA_LOCATIONS[filters.locationCity] || []
    : []

  // Helper para actualizar Zustand y URL simultáneamente
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    // 1. Actualizar Zustand
    setFilters(newFilters)

    // 2. Construir nuevos parámetros de búsqueda en la URL
    const params = new URLSearchParams(searchParams.toString())
    
    // Combinar el estado del store con los nuevos cambios
    const merged = { ...filters, ...newFilters }

    Object.entries(merged).forEach(([key, val]) => {
      if (val === "TODOS" || val === undefined || val === "" || val === 0) {
        params.delete(key)
      } else {
        params.set(key, String(val))
      }
    })

    // Empujar la URL para gatillar el Server Component (SEO & fresh data)
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handleCityChange = (city: string | null) => {
    const cityVal = city || "TODOS"
    updateFilters({ 
      locationCity: cityVal, 
      locationZone: "TODOS" 
    })
  }

  const handlePriceApply = () => {
    const min = localMinPrice !== "" ? Number(localMinPrice) : undefined
    const max = localMaxPrice !== "" ? Number(localMaxPrice) : undefined
    updateFilters({ minPrice: min, maxPrice: max })
  }

  const handleRemoveFilter = (key: string, resetValue: any) => {
    if (key === "locationCity") {
      updateFilters({ locationCity: "TODOS", locationZone: "TODOS" })
    } else {
      updateFilters({ [key]: resetValue })
    }
  }

  // Generar lista de filtros activos para los badges
  const activeFilters = []
  if (filters.locationCity && filters.locationCity !== "TODOS") {
    activeFilters.push({ key: "locationCity", label: `Ciudad: ${filters.locationCity}`, value: "TODOS" })
  }
  if (filters.locationZone && filters.locationZone !== "TODOS") {
    activeFilters.push({ key: "locationZone", label: `Zona: ${filters.locationZone}`, value: "TODOS" })
  }
  if (filters.propertyType && filters.propertyType !== "TODOS") {
    activeFilters.push({ key: "propertyType", label: `Tipo: ${filters.propertyType}`, value: "TODOS" })
  }
  if (filters.minPrice !== undefined) {
    activeFilters.push({ key: "minPrice", label: `Mín: U$S ${filters.minPrice.toLocaleString()}`, value: undefined })
  }
  if (filters.maxPrice !== undefined) {
    activeFilters.push({ key: "maxPrice", label: `Máx: U$S ${filters.maxPrice.toLocaleString()}`, value: undefined })
  }
  if (filters.bedrooms && filters.bedrooms > 0) {
    activeFilters.push({ key: "bedrooms", label: `${filters.bedrooms} Dorms`, value: 0 })
  }
  if (filters.bathrooms && filters.bathrooms > 0) {
    activeFilters.push({ key: "bathrooms", label: `${filters.bathrooms} Baños`, value: 0 })
  }
  if (filters.minArea !== undefined) {
    activeFilters.push({ key: "minArea", label: `Área: >${filters.minArea} m²`, value: undefined })
  }

  const activeFiltersCount = activeFilters.length

  return (
    <div className="w-full rounded-xl border border-border bg-white p-4 shadow-sm transition-all duration-300">
      {/* Cabecera del Panel (Control de Apertura/Cierre) */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5 text-primary">
          <div className="bg-primary/5 p-2 rounded-lg text-accent">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-none">Filtros de Búsqueda</h3>
            <p className="text-[11px] text-foreground/50 mt-1 font-medium">
              {activeFiltersCount > 0 
                ? `${activeFiltersCount} filtro${activeFiltersCount > 1 ? "s" : ""} aplicado${activeFiltersCount > 1 ? "s" : ""}` 
                : "Haz clic para desplegar los filtros avanzados"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation()
                resetFilters()
                setLocalMinPrice("")
                setLocalMaxPrice("")
                router.push("/", { scroll: false })
              }}
              className="text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/5 gap-1 h-8 rounded-lg font-bold"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpiar</span>
            </Button>
          )}
          <div className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted text-foreground/60 transition-colors">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Badges de Filtros Activos (solo cuando está cerrado) */}
      {!isOpen && activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/40">
          {activeFilters.map((filter) => (
            <div 
              key={filter.key}
              className="flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-full px-3 py-1 text-xs font-semibold text-primary transition-colors"
            >
              <span>{filter.label}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveFilter(filter.key, filter.value)
                }}
                className="hover:bg-primary/10 rounded-full p-0.5 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3 text-primary/70 hover:text-primary" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulario de Filtros Desplegado */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-border/40 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Ciudad */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Ciudad</span>
              <Select 
                value={filters.locationCity || "TODOS"} 
                onValueChange={handleCityChange}
              >
                <SelectTrigger className="w-full focus:ring-primary border-border h-10 rounded-lg text-sm font-semibold">
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
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Zona / Barrio</span>
              <Select 
                value={filters.locationZone || "TODOS"} 
                onValueChange={(val) => updateFilters({ locationZone: val || "TODOS" })}
                disabled={!filters.locationCity || filters.locationCity === "TODOS"}
              >
                <SelectTrigger className="w-full focus:ring-primary border-border h-10 rounded-lg text-sm font-semibold">
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
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Tipo de Inmueble</span>
              <Select 
                value={filters.propertyType || "TODOS"} 
                onValueChange={(val) => updateFilters({ propertyType: val || "TODOS" })}
              >
                <SelectTrigger className="w-full focus:ring-primary border-border h-10 rounded-lg text-sm font-semibold">
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
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Rango de Precios (USD)</span>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="w-1/2 border-border h-10 rounded-lg text-sm font-semibold"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="w-1/2 border-border h-10 rounded-lg text-sm font-semibold"
                />
                <Button 
                  size="icon" 
                  onClick={handlePriceApply}
                  className="bg-primary hover:bg-primary/95 text-white shrink-0 h-10 w-10 rounded-lg cursor-pointer transition-colors"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros avanzados adicionales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40">
            {/* Dormitorios */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-2">
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider shrink-0">Dormitorios</span>
              <div className="flex gap-1 bg-muted/30 p-1 rounded-full border border-border w-fit">
                {[0, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateFilters({ bedrooms: num })}
                    className={`h-7 w-7 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      (filters.bedrooms || 0) === num
                        ? "bg-primary text-white shadow-xs"
                        : "bg-transparent text-foreground/75 hover:bg-muted"
                    }`}
                  >
                    {num === 0 ? "Any" : num === 4 ? "4+" : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Baños */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-2">
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider shrink-0">Baños</span>
              <div className="flex gap-1 bg-muted/30 p-1 rounded-full border border-border w-fit">
                {[0, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => updateFilters({ bathrooms: num })}
                    className={`h-7 w-7 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      (filters.bathrooms || 0) === num
                        ? "bg-primary text-white shadow-xs"
                        : "bg-transparent text-foreground/75 hover:bg-muted"
                    }`}
                  >
                    {num === 0 ? "Any" : num === 4 ? "4+" : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Metraje Mínimo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-start gap-2">
              <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider shrink-0">Área Mínima</span>
              <div className="flex items-center gap-2 w-full max-w-[140px] bg-white border border-border rounded-lg px-2 py-1 h-9">
                <input
                  type="number"
                  placeholder="m²"
                  value={filters.minArea !== undefined ? String(filters.minArea) : ""}
                  onChange={(e) => {
                    const val = e.target.value !== "" ? Number(e.target.value) : undefined
                    updateFilters({ minArea: val })
                  }}
                  className="w-full text-xs font-semibold text-primary focus:outline-hidden"
                />
                <span className="text-xs text-foreground/45 font-bold">m²</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
