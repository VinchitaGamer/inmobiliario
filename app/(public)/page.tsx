import { getProperties, type PropertyFilters as FiltersType } from "@/app/actions/property"
import { PropertyFilters } from "@/components/shared/property-filters"
import { PropertyCard } from "@/components/shared/property-card"
import { Building2, AlertCircle } from "lucide-react"

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
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1">
        
        {/* Barra de Filtros */}
        <div className="mb-8">
          <PropertyFilters />
        </div>

        {/* Sección de Resultados */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              <span>
                {filters.operationType && filters.operationType !== "TODOS" 
                  ? `Inmuebles en ${filters.operationType.toLowerCase()}` 
                  : "Todos los inmuebles disponibles"}
              </span>
              <span className="text-sm font-semibold text-foreground/50 bg-muted px-2 py-0.5 rounded-full">
                {properties.length}
              </span>
            </h2>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
