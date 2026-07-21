import { getProperties, type PropertyFilters as FiltersType } from "@/app/actions/property"
import { PropertyFilters } from "@/components/shared/property-filters"
import { PropertyCard } from "@/components/shared/property-card"
import { AlertCircle, ChevronDown, Map } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Bienes Raíces Bolivia | Venta, Alquiler y Anticrético",
  description: "La plataforma inmobiliaria más moderna de Bolivia. Encuentra casas, departamentos y terrenos en venta, alquiler, anticrético y proyectos en Santa Cruz, La Paz y Cochabamba.",
}

interface PageProps {
  searchParams: Promise<{
    operationType?: string
    propertyType?: string
    locationCity?: string
    locationZone?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    bathrooms?: string
    minArea?: string
  }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams

  // Mapear query params a filtros con tipos correctos
  const filters: FiltersType = {
    operationType: params.operationType || "TODOS",
    propertyType: params.propertyType || "TODOS",
    locationCity: params.locationCity || "TODOS",
    locationZone: params.locationZone || "TODOS",
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    bedrooms: params.bedrooms ? Number(params.bedrooms) : undefined,
    bathrooms: params.bathrooms ? Number(params.bathrooms) : undefined,
    minArea: params.minArea ? Number(params.minArea) : undefined,
  }

  // Fetch de propiedades directamente en el servidor (SEO Friendly y rápido)
  const response = await getProperties(filters)
  const properties = response.success ? response.data || [] : []

  return (
    <div className="flex flex-col min-h-screen">
      {/* Contenedor del Catálogo */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 max-w-5xl">
        
        {/* Barra de Filtros */}
        <div className="mb-6">
          <PropertyFilters />
        </div>

        {/* Sección de Resultados */}
        <div className="space-y-6">
          
          {/* Fila de Migas de Pan (Breadcrumbs) */}
          <div className="text-xs text-foreground/60 flex items-center gap-1.5 font-medium">
            <span>Estás en:</span>
            <a href="/" className="hover:text-primary transition-colors">InfoCasas</a>
            <span>&gt;</span>
            <span className="capitalize">{filters.operationType && filters.operationType !== "TODOS" ? filters.operationType.toLowerCase() : "venta"}</span>
            <span>&gt;</span>
            <span className="capitalize">
              {filters.propertyType && filters.propertyType !== "TODOS" 
                ? `${filters.propertyType}s` 
                : "Casas"}
            </span>
          </div>

          {/* Título, Stats y Botones de Ordenación/Mapa */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between pb-4 border-b border-border/60 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight leading-tight">
                {filters.operationType && filters.operationType !== "TODOS" 
                  ? `${filters.operationType === "VENTA" ? "Venta" : filters.operationType === "ALQUILER" ? "Alquiler" : filters.operationType === "ANTICRETICO" ? "Anticrético" : "Proyecto"} de `
                  : "Venta de "}
                {filters.propertyType && filters.propertyType !== "TODOS" 
                  ? `${filters.propertyType}s` 
                  : "Casas y Departamentos"}
                {filters.locationCity && filters.locationCity !== "TODOS" 
                  ? ` en ${filters.locationCity}` 
                  : " en Bolivia"}
              </h1>
              <p className="text-xs text-foreground/50 mt-1 font-semibold">
                Mostrando 1 - {properties.length} de más de {properties.length * 19} resultados
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start md:self-end">
              {/* Popularidad Dropdown (simulado) */}
              <button className="flex items-center gap-1.5 bg-white border border-border rounded-md px-3.5 py-2 text-xs font-bold text-foreground/80 shadow-xs hover:bg-muted/30 transition-colors cursor-pointer">
                <span>Popularidad</span>
                <ChevronDown className="h-3.5 w-3.5 text-foreground/50" />
              </button>
              
              {/* Ver Mapa Button (simulado) */}
              <button className="flex items-center gap-1.5 bg-white border border-border rounded-md px-3.5 py-2 text-xs font-bold text-foreground/80 shadow-xs hover:bg-muted/30 transition-colors cursor-pointer">
                <Map className="h-3.5 w-3.5 text-accent" />
                <span>Ver Mapa</span>
              </button>
            </div>
          </div>

          {properties.length > 0 ? (
            <div className="flex flex-col gap-6 w-full">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border bg-white text-center">
              <div className="rounded-full bg-amber-50 p-4 text-amber-600 mb-4 border border-amber-100">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-1">No se encontraron resultados</h3>
              <p className="text-sm text-foreground/60 max-w-md">
                Prueba cambiando los filtros de búsqueda, ampliando el rango de precios o seleccionando "Todas las Zonas".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
