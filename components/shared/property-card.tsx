"use client"

import Image from "next/image"
import { usePropertyStore } from "@/store/property-store"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Maximize, MessageCircle, MapPin } from "lucide-react"

interface PropertyCardProps {
  property: any
}

// Tipo de cambio oficial de Bolivia (simulado para conversión)
const TC_BOB = 6.96

export function PropertyCard({ property }: PropertyCardProps) {
  const { setSelectedProperty } = usePropertyStore()

  // Formatear precio
  const formatPrice = (price: number, currency: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(price)

    // Mostrar también la conversión aproximada para comodidad del usuario boliviano
    if (currency === "USD") {
      const bobPrice = price * TC_BOB
      const formattedBob = new Intl.NumberFormat("es-BO", {
        style: "currency",
        currency: "BOB",
        maximumFractionDigits: 0
      }).format(bobPrice)
      return { primary: formatted, secondary: `~ ${formattedBob}` }
    } else {
      const usdPrice = price / TC_BOB
      const formattedUsd = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(usdPrice)
      return { primary: formatted, secondary: `~ ${formattedUsd}` }
    }
  }

  const prices = formatPrice(property.price, property.currency)

  // Obtener estilo de badge según la operación
  const getOperationBadge = (type: string) => {
    switch (type) {
      case "VENTA":
        return "bg-brand-red text-white hover:bg-brand-red/90"
      case "ALQUILER":
        return "bg-emerald-600 text-white hover:bg-emerald-600/90"
      case "ANTICRETICO":
        return "bg-amber-600 text-white hover:bg-amber-600/90"
      case "PROYECTO":
        return "bg-primary text-white hover:bg-primary/90"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  // Generar link de WhatsApp
  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hola! Estoy interesado en la propiedad "${property.title}" que vi en Bienes Raíces Bolivia.\n` +
      `Código: ${property.id.substring(0, 8)}\n` +
      `Precio: ${property.currency} ${property.price.toLocaleString()}\n` +
      `Ubicación: ${property.locationCity} - ${property.locationZone}\n` +
      `Por favor, me gustaría recibir más información.`
    )
    // Limpiar número de teléfono (quitar +, espacios, etc.)
    const cleanPhone = property.contactPhone.replace(/[^0-9]/g, "")
    // Si no tiene prefijo del país, añadir 591
    const phoneWithPrefix = cleanPhone.startsWith("591") ? cleanPhone : `591${cleanPhone}`
    return `https://wa.me/${phoneWithPrefix}?text=${text}`
  }

  return (
    <Card 
      className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col h-full"
      onClick={() => setSelectedProperty(property)}
    >
      {/* Contenedor de Imagen */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={property.images[0] || "/placeholder-property.jpg"}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge de tipo de transacción */}
        <Badge className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 uppercase shadow-sm ${getOperationBadge(property.operationType)}`}>
          {property.operationType === "ANTICRETICO" ? "Anticrético" : property.operationType}
        </Badge>
        
        {/* Badge de Proyecto Destacado */}
        {property.isFeatured && (
          <Badge className="absolute top-3 right-3 bg-white/90 text-primary border border-primary/20 hover:bg-white text-xs font-semibold px-2 py-0.5 shadow-sm">
            Destacado
          </Badge>
        )}
      </div>

      {/* Contenido */}
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        {/* Precio */}
        <div className="space-y-0.5">
          <div className="text-xl font-bold text-primary tracking-tight">
            {prices.primary}
          </div>
          <div className="text-xs text-foreground/50 font-medium">
            {prices.secondary}
          </div>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-base text-foreground/90 leading-snug line-clamp-1 group-hover:text-primary transition-colors">
          {property.title}
        </h3>

        {/* Ubicación */}
        <div className="flex items-center gap-1 text-sm text-foreground/60 font-medium">
          <MapPin className="h-4 w-4 shrink-0 text-accent" />
          <span className="line-clamp-1">{property.locationCity}, {property.locationZone}</span>
        </div>

        {/* Ficha técnica resumida */}
        <div className="grid grid-cols-3 gap-2 py-2 mt-auto border-t border-border/40 text-xs text-foreground/70 font-semibold">
          <div className="flex items-center gap-1 justify-center bg-brand-bg-soft/40 py-1 rounded">
            <Bed className="h-3.5 w-3.5 text-primary/80" />
            <span>{property.bedrooms} Dorms</span>
          </div>
          <div className="flex items-center gap-1 justify-center bg-brand-bg-soft/40 py-1 rounded">
            <Bath className="h-3.5 w-3.5 text-primary/80" />
            <span>{property.bathrooms} Baños</span>
          </div>
          <div className="flex items-center gap-1 justify-center bg-brand-bg-soft/40 py-1 rounded">
            <Maximize className="h-3.5 w-3.5 text-primary/80" />
            <span>{property.area} m²</span>
          </div>
        </div>
      </CardContent>

      {/* Acciones */}
      <CardFooter className="p-4 pt-0 border-t border-border/20 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSelectedProperty(property)}
          className="flex-1 text-xs border-primary text-primary hover:bg-primary/5 font-semibold"
        >
          Ver Detalles
        </Button>
        <a 
          href={getWhatsAppLink()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-600/90 text-white p-2 h-9 w-9 rounded-md"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </a>
      </CardFooter>
    </Card>
  )
}
