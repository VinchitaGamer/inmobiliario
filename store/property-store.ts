import { create } from "zustand"
import { type PropertyFilters } from "@/app/actions/property"

interface PropertyState {
  // Estado de los filtros (estilo Infocasas)
  filters: PropertyFilters
  setFilters: (filters: Partial<PropertyFilters>) => void
  resetFilters: () => void

  // Estado de propiedades
  properties: any[]
  setProperties: (properties: any[]) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void

  // Propiedad seleccionada para el modal flotante
  selectedProperty: any | null
  setSelectedProperty: (property: any | null) => void
}

const initialFilters: PropertyFilters = {
  operationType: "TODOS",
  propertyType: "TODOS",
  locationCity: "TODOS",
  locationZone: "TODOS",
  minPrice: undefined,
  maxPrice: undefined,
  bedrooms: 0,
  bathrooms: 0,
  minArea: undefined,
}

export const usePropertyStore = create<PropertyState>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  properties: [],
  setProperties: (properties) => set({ properties }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  selectedProperty: null,
  setSelectedProperty: (selectedProperty) => set({ selectedProperty }),
}))
