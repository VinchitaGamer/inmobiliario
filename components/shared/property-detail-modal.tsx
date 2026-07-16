"use client"

import { useState, useEffect } from "react"
import { usePropertyStore } from "@/store/property-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Maximize, MessageCircle, MapPin, Calendar, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

const TC_BOB = 6.96

export function PropertyDetailModal() {
  const { selectedProperty, setSelectedProperty } = usePropertyStore()
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Resetear la imagen activa cuando cambia la propiedad seleccionada
  useEffect(() => {
    setActiveImageIndex(0)
  }, [selectedProperty])

  if (!selectedProperty) return null

  const formatPrice = (price: number, currency: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(price)

    if (currency === "USD") {
      const bobPrice = price * TC_BOB
      return {
        primary: formatted,
        secondary: `${new Intl.NumberFormat("es-BO", {
          style: "currency",
          currency: "BOB",
          maximumFractionDigits: 0
        }).format(bobPrice)} BOB`
      }
    } else {
      const usdPrice = price / TC_BOB
      return {
        primary: formatted,
        secondary: `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0
        }).format(usdPrice)} USD`
      }
    }
  }

  const prices = formatPrice(selectedProperty.price, selectedProperty.currency)

  // Badge del tipo de transacción
  const getOperationBadge = (type: string) => {
    switch (type) {
      case "VENTA":
        return "bg-brand-red text-white"
      case "ALQUILER":
        return "bg-emerald-600 text-white"
      case "ANTICRETICO":
        return "bg-amber-600 text-white"
      case "PROYECTO":
        return "bg-primary text-white"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  // Generar link de WhatsApp
  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hola! Estoy interesado en la propiedad "${selectedProperty.title}" que vi en tu plataforma.\n` +
      `Código: ${selectedProperty.id.substring(0, 8)}\n` +
      `Precio: ${selectedProperty.currency} ${selectedProperty.price.toLocaleString()}\n` +
      `Ubicación: ${selectedProperty.locationCity} - ${selectedProperty.locationZone}\n` +
      `Por favor, me gustaría recibir más detalles.`
    )
    const cleanPhone = selectedProperty.contactPhone.replace(/[^0-9]/g, "")
    const phoneWithPrefix = cleanPhone.startsWith("591") ? cleanPhone : `591${cleanPhone}`
    return `https://wa.me/${phoneWithPrefix}?text=${text}`
  }

  const nextImage = () => {
    if (selectedProperty.images.length <= 1) return
    setActiveImageIndex((prev) => (prev + 1) % selectedProperty.images.length)
  }

  const prevImage = () => {
    if (selectedProperty.images.length <= 1) return
    setActiveImageIndex((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length)
  }

  return (
    <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
      <DialogContent className="max-w-[95vw] lg:max-w-5xl xl:max-w-6xl max-h-[90vh] overflow-y-auto p-0 border-none bg-white rounded-xl shadow-2xl">
        <DialogHeader className="p-6 pb-2 sr-only">
          <DialogTitle>{selectedProperty.title}</DialogTitle>
          <DialogDescription>Detalles técnicos de la propiedad</DialogDescription>
        </DialogHeader>

        {/* Sección de Imagen Principal y Slider */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.2/1] lg:aspect-[2.6/1] bg-black">
          {selectedProperty.images.length > 0 ? (
            <img
              src={selectedProperty.images[activeImageIndex]}
              alt={`${selectedProperty.title} - Imagen ${activeImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              Sin imágenes cargadas
            </div>
          )}

          {/* Flechas de navegación del Slider */}
          {selectedProperty.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 p-2 text-white transition-all shadow-md"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 p-2 text-white transition-all shadow-md"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Indicador de número de imagen */}
          {selectedProperty.images.length > 1 && (
            <span className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
              {activeImageIndex + 1} / {selectedProperty.images.length}
            </span>
          )}

          {/* Transacción Badge flotante */}
          <Badge className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 uppercase shadow-md ${getOperationBadge(selectedProperty.operationType)}`}>
            {selectedProperty.operationType === "ANTICRETICO" ? "Anticrético" : selectedProperty.operationType}
          </Badge>
        </div>

        {/* Cuerpo del Detalle */}
        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Información Principal (2/3 de la pantalla en desktop) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Título y Ubicación */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary tracking-tight leading-tight">
                {selectedProperty.title}
              </h2>
              <div className="flex items-center gap-1.5 text-foreground/75 font-semibold text-xs sm:text-sm">
                <MapPin className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-accent shrink-0" />
                <span>{selectedProperty.locationCity}, {selectedProperty.locationZone}</span>
              </div>
            </div>

            {/* Precio compacto visible SOLO en móviles (debajo del título para mejor conversión) */}
            <div className="md:hidden flex items-center justify-between p-3.5 bg-brand-bg-soft/10 rounded-xl border border-border/80">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-foreground/50 uppercase block">Precio Solicitado</span>
                <div className="text-2xl font-black text-primary tracking-tight">
                  {prices.primary}
                </div>
                {selectedProperty.currency === "USD" && (
                  <div className="text-xs font-semibold text-foreground/60">
                    {prices.secondary}
                  </div>
                )}
              </div>
              <Badge className="bg-primary/10 text-primary border-none font-bold text-xs uppercase px-2.5 py-1">
                {selectedProperty.propertyType}
              </Badge>
            </div>

            {/* Ficha Técnica Principal */}
            <div className="grid grid-cols-3 gap-4 border-y border-border py-4 text-center">
              <div className="space-y-1">
                <div className="flex justify-center text-primary">
                  <Bed className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-primary">{selectedProperty.bedrooms} Dormitorios</div>
                <div className="text-xs text-foreground/50">Habitaciones</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-center text-primary">
                  <Bath className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-primary">{selectedProperty.bathrooms} Baños</div>
                <div className="text-xs text-foreground/50">Servicios sanitarios</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-center text-primary">
                  <Maximize className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-primary">{selectedProperty.area} m²</div>
                <div className="text-xs text-foreground/50">Superficie construida</div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2.5">
              <h3 className="font-bold text-lg text-primary">Descripción de la Propiedad</h3>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {selectedProperty.description}
              </p>
            </div>

            {/* Características Adicionales */}
            {selectedProperty.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-primary">Características</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.features.map((feature: string) => (
                    <div 
                      key={feature} 
                      className="flex items-center gap-1.5 rounded-full border border-border bg-brand-bg-soft/20 px-3.5 py-1 text-xs text-foreground/85 font-semibold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel de Contacto y Precios (1/3 de la pantalla) */}
          <div className="space-y-6 bg-brand-bg-soft/10 p-6 rounded-xl border border-border/80 h-fit">
            
            {/* Precios */}
            <div className="space-y-1 pb-4 border-b border-border/60">
              <span className="text-xs font-semibold text-foreground/50 uppercase">Precio Solicitado</span>
              <div className="text-3xl font-extrabold text-primary tracking-tight">
                {prices.primary}
              </div>
              {selectedProperty.currency === "USD" && (
                <div className="text-sm font-semibold text-foreground/60">
                  {prices.secondary}
                </div>
              )}
            </div>

            {/* Tipo de Inmueble */}
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/30">
              <span className="text-foreground/50">Tipo de Inmueble</span>
              <span className="font-bold text-primary">{selectedProperty.propertyType}</span>
            </div>

            {/* Publicado el */}
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/30">
              <span className="text-foreground/50">Publicado</span>
              <span className="font-bold text-primary flex items-center gap-1">
                <Calendar className="h-4 w-4 text-primary/80" />
                {new Date(selectedProperty.createdAt).toLocaleDateString("es-BO")}
              </span>
            </div>

            {/* Botones de Contacto Directo */}
            <div className="space-y-2 pt-2">
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-600/95 text-white flex items-center justify-center gap-2 font-bold py-5">
                  <MessageCircle className="h-5 w-5" />
                  Contactar por WhatsApp
                </Button>
              </a>
              <Button 
                variant="outline" 
                onClick={() => setSelectedProperty(null)}
                className="w-full border-border text-foreground font-semibold py-5"
              >
                Cerrar Detalle
              </Button>
            </div>

            <p className="text-[10px] text-center text-foreground/50 mt-4 leading-normal">
              Código de propiedad: <span className="font-mono font-bold">{selectedProperty.id}</span>. Al contactar indica que lo viste en Bienes Raíces Bolivia.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
