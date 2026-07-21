"use client"

import { useState } from "react"
import { usePropertyStore } from "@/store/property-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Maximize, MessageCircle, ChevronLeft, ChevronRight, Heart, Phone, Mail } from "lucide-react"

interface PropertyCardProps {
  property: any
}

// Tipo de cambio oficial de Bolivia (simulado para conversión)
const TC_BOB = 6.96

export function PropertyCard({ property }: PropertyCardProps) {
  const { setSelectedProperty } = usePropertyStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  // Formatear precio al estilo de Bolivia (separador de miles con puntos)
  const formatPrice = (price: number, currency: string) => {
    const formatNumber = (num: number) => {
      return new Intl.NumberFormat("de-DE", {
        maximumFractionDigits: 0
      }).format(num)
    }

    if (currency === "USD") {
      const bobPrice = price * TC_BOB
      return { 
        primary: `U$S ${formatNumber(price)}`, 
        secondary: `~ Bs. ${formatNumber(bobPrice)}` 
      }
    } else {
      const usdPrice = price / TC_BOB
      return { 
        primary: `Bs. ${formatNumber(price)}`, 
        secondary: `~ U$S ${formatNumber(usdPrice)}` 
      }
    }
  }

  const prices = formatPrice(property.price, property.currency)

  // Generar link de WhatsApp
  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hola! Estoy interesado en la propiedad "${property.title}" que vi en Bienes Raíces Bolivia.\n` +
      `Código: ${property.id.substring(0, 8)}\n` +
      `Precio: ${property.currency} ${property.price.toLocaleString()}\n` +
      `Ubicación: ${property.locationCity} - ${property.locationZone}\n` +
      `Por favor, me gustaría recibir más información.`
    )
    const cleanPhone = property.contactPhone.replace(/[^0-9]/g, "")
    const phoneWithPrefix = cleanPhone.startsWith("591") ? cleanPhone : `591${cleanPhone}`
    return `https://wa.me/${phoneWithPrefix}?text=${text}`
  }

  // Carrusel handlers
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!property.images || property.images.length === 0) return
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    )
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!property.images || property.images.length === 0) return
    setCurrentImageIndex((prev) => 
      (prev + 1) % property.images.length
    )
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  // Generar información simulada del asesor (determinista basada en el ID de la propiedad)
  const getAgentInfo = (id: string) => {
    const agents = [
      { name: "Paola Claros", company: "Asesora FIRMA PROPIEDADES", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80" },
      { name: "Lic. Arturo Terrazas Ewel", company: "Century 21 Norte", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100&q=80" },
      { name: "María Inés Justiniano", company: "Asesora Remax Corporación", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100&q=80" },
      { name: "Ing. Roberto Siles", company: "Broker Inmobiliaria Urubó", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80" }
    ]
    const charCodeSum = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return agents[charCodeSum % agents.length]
  }

  const agent = getAgentInfo(property.id)

  return (
    <Card 
      className="group overflow-hidden rounded-xl border border-border bg-white shadow-xs transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col md:flex-row h-auto w-full"
      onClick={() => setSelectedProperty(property)}
    >
      {/* Contenedor del Carrusel de Imagen (Izquierda en desktop, arriba en móvil) */}
      <div className="relative w-full md:w-[320px] lg:w-[360px] shrink-0 aspect-video md:aspect-auto overflow-hidden bg-muted">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[currentImageIndex]}
            alt={`${property.title} - Foto ${currentImageIndex + 1}`}
            className="h-full w-full object-cover transition-transform duration-550 group-hover:scale-102"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/40 text-xs font-semibold">
            Sin imagen disponible
          </div>
        )}

        {/* Badge "DESTACADO" si aplica */}
        {property.isFeatured && (
          <div className="absolute top-3 left-3 bg-white/95 text-foreground border border-neutral-200/50 shadow-xs text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 uppercase select-none">
            <span className="text-amber-500 text-xs font-serif leading-none">★</span>
            <span>Destacado</span>
          </div>
        )}

        {/* Botón de Favorito (Corazón) */}
        <button 
          onClick={toggleFavorite}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-foreground/80 hover:text-accent hover:bg-white shadow-xs transition-all cursor-pointer"
        >
          <Heart className={`h-4.5 w-4.5 transition-colors ${isFavorite ? "fill-accent text-accent" : "text-foreground/75"}`} />
        </button>

        {/* Flechas de Navegación del Slider */}
        {property.images && property.images.length > 1 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={handlePrevImage}
              className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={handleNextImage}
              className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {/* Indicador de Número de Foto */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md select-none">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        )}
      </div>

      {/* Contenedor del Contenido (Derecha en desktop, abajo en móvil) */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3 justify-between">
        
        {/* Encabezado: Asesor e Imagen de Perfil */}
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-0.5 leading-none">
            <span className="text-[11px] font-semibold text-foreground/60 block tracking-tight">
              {agent.name}
            </span>
            <span className="text-[10px] font-bold text-foreground/45 uppercase block tracking-wider">
              {agent.company}
            </span>
          </div>
          <img 
            src={agent.avatar}
            alt={agent.name}
            className="h-9 w-9 rounded-full object-cover border border-border/80 shadow-xs shrink-0"
          />
        </div>

        {/* Precio Destacado */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-primary tracking-tight leading-none">
            {prices.primary}
          </span>
          <span className="text-xs font-semibold text-foreground/45">
            {prices.secondary}
          </span>
        </div>

        {/* Subtítulo: Tipo de propiedad y ubicación */}
        <div className="text-[12px] font-bold text-foreground/75 leading-none mt-0.5">
          {property.propertyType} en {property.locationZone}, {property.locationCity}
        </div>

        {/* Título comercial */}
        <h3 className="font-extrabold text-base text-primary leading-tight line-clamp-1 group-hover:text-accent transition-colors">
          {property.title}
        </h3>

        {/* Especificaciones Técnicas */}
        <div className="flex items-center gap-4 text-xs font-bold text-foreground/60 py-0.5">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-foreground/45" />
            <span>{property.bedrooms} Dorms.</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-foreground/45" />
            <span>{property.bathrooms} Baños</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4 text-foreground/45" />
            <span>{property.area} m²</span>
          </div>
        </div>

        {/* Descripción Breve */}
        <p className="text-xs text-foreground/60 leading-relaxed font-normal line-clamp-2 md:line-clamp-3">
          {property.description}
        </p>

        {/* Botonera de Acciones (Fila Inferior) */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/40 mt-1" onClick={(e) => e.stopPropagation()}>
          {/* Botón Contactar (Detalles) */}
          <Button 
            onClick={() => setSelectedProperty(property)}
            className="bg-accent hover:bg-accent/90 text-white font-extrabold text-xs px-4 h-9 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Contactar</span>
          </Button>

          {/* Botón Llamar */}
          <a 
            href={`tel:${property.contactPhone}`} 
            className="shrink-0"
          >
            <Button 
              variant="outline"
              className="border-border text-foreground hover:bg-muted/40 font-bold text-xs px-3 h-9 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-foreground/50" />
              <span>Llamar</span>
            </Button>
          </a>

          {/* Botón WhatsApp */}
          <a 
            href={getWhatsAppLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="shrink-0 ml-auto"
          >
            <Button 
              className="bg-[#25D366] hover:bg-[#22c35e] text-white font-extrabold text-xs px-4.5 h-9 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MessageCircle className="h-4 w-4 fill-white text-[#25D366]" />
              <span>WhatsApp</span>
            </Button>
          </a>
        </div>
      </div>
    </Card>
  )
}
