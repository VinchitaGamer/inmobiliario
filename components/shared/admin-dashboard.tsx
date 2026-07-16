"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createProperty, updateProperty, deleteProperty } from "@/app/actions/property"
import { BOLIVIA_LOCATIONS } from "@/components/shared/property-filters"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Home, LogOut, Loader2, AlertCircle, Building, MapPin, Sliders, ArrowLeft, ArrowRight } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"

interface AdminDashboardProps {
  initialProperties: any[]
}

interface PropertyFormState {
  title: string
  description: string
  operationType: string
  propertyType: string
  price: string
  currency: string
  locationCity: string
  locationZone: string
  bedrooms: string
  bathrooms: string
  area: string
  imagesText: string
  featuresText: string
  contactPhone: string
  isFeatured: boolean
}

const defaultForm: PropertyFormState = {
  title: "",
  description: "",
  operationType: "VENTA",
  propertyType: "Departamento",
  price: "",
  currency: "USD",
  locationCity: "Santa Cruz",
  locationZone: "Equipetrol",
  bedrooms: "1",
  bathrooms: "1",
  area: "",
  imagesText: "",
  featuresText: "Garaje, Seguridad 24h",
  contactPhone: "+59170000000",
  isFeatured: false,
}

export function AdminDashboard({ initialProperties }: AdminDashboardProps) {
  const router = useRouter()
  const [properties, setProperties] = useState(initialProperties)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PropertyFormState>(defaultForm)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'basics' | 'location' | 'details'>('basics')

  // Sincronizar propiedades si el layout padre se refresca
  if (initialProperties !== properties) {
    setProperties(initialProperties)
  }

  const handleLogout = async () => {
    const res = await logoutAction()
    if (res.success) {
      router.refresh()
      router.push("/")
    }
  }

  const openCreateModal = () => {
    setForm(defaultForm)
    setEditingId(null)
    setError(null)
    setActiveTab('basics')
    setIsFormOpen(true)
  }

  const openEditModal = (prop: any) => {
    setForm({
      title: prop.title,
      description: prop.description,
      operationType: prop.operationType,
      propertyType: prop.propertyType,
      price: String(prop.price),
      currency: prop.currency,
      locationCity: prop.locationCity,
      locationZone: prop.locationZone,
      bedrooms: String(prop.bedrooms),
      bathrooms: String(prop.bathrooms),
      area: String(prop.area),
      imagesText: prop.images.join("\n"),
      featuresText: prop.features.join(", "),
      contactPhone: prop.contactPhone,
      isFeatured: prop.isFeatured,
    })
    setEditingId(prop.id)
    setError(null)
    setActiveTab('basics')
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta publicación?")) return

    const res = await deleteProperty(id)
    if (!res.success) {
      alert(`Error: ${res.error}`)
      return
    }

    router.refresh()
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones básicas del cliente antes de enviar
    if (!form.title || !form.description || !form.price || !form.area || !form.imagesText) {
      setError("Por favor, rellene todos los campos obligatorios")
      return
    }

    // Convertir imágenes y características de texto a arrays estructurados
    const images = form.imagesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http")) // Filtrar solo URLs válidas

    if (images.length === 0) {
      setError("Debe ingresar al menos una URL de imagen válida (debe empezar con http)")
      return
    }

    const features = form.featuresText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const payload = {
      title: form.title,
      description: form.description,
      operationType: form.operationType,
      propertyType: form.propertyType,
      price: Number(form.price),
      currency: form.currency,
      locationCity: form.locationCity,
      locationZone: form.locationZone,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: Number(form.area),
      images,
      features,
      contactPhone: form.contactPhone,
      isFeatured: form.isFeatured,
    }

    startTransition(async () => {
      let result
      if (editingId) {
        result = await updateProperty(editingId, payload)
      } else {
        result = await createProperty(payload)
      }

      if (!result.success) {
        setError(result.error)
        return
      }

      setIsFormOpen(false)
      router.refresh()
    })
  }

  const availableZones = BOLIVIA_LOCATIONS[form.locationCity] || []

  return (
    <div className="min-h-screen bg-brand-bg-soft/10 pb-12">
      {/* Cabecera del Panel */}
      <div className="bg-primary text-white py-6 shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Home className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-bold">Panel Administrativo de Inmuebles</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/")}
              className="text-white hover:bg-white/10"
            >
              Ir al Sitio Público
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-white/20 text-white hover:bg-white/10 flex items-center gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Acciones principales */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">Listado de Publicaciones</h2>
          <Button 
            onClick={openCreateModal}
            className="bg-accent hover:bg-accent/90 text-white flex items-center gap-1 font-semibold"
          >
            <Plus className="h-4 w-4" />
            Nueva Propiedad
          </Button>
        </div>

        {/* Tabla de Publicaciones */}
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[80px]">Imagen</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.length > 0 ? (
                properties.map((prop) => (
                  <TableRow key={prop.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="h-10 w-14 rounded overflow-hidden bg-muted relative">
                        <img
                          src={prop.images[0] || "/placeholder-property.jpg"}
                          alt={prop.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground/90 max-w-xs truncate">{prop.title}</div>
                      <div className="text-xs text-foreground/50">{prop.propertyType} • {prop.area} m²</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        prop.operationType === "VENTA" ? "bg-brand-red text-white" :
                        prop.operationType === "ALQUILER" ? "bg-emerald-600 text-white" :
                        prop.operationType === "ANTICRETICO" ? "bg-amber-600 text-white" : "bg-primary text-white"
                      }>
                        {prop.operationType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground/80">{prop.locationCity}</div>
                      <div className="text-xs text-foreground/50">{prop.locationZone}</div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {prop.currency} {prop.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => openEditModal(prop)}
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleDelete(prop.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-foreground/50">
                    No hay publicaciones registradas. Crea una nueva haciendo clic en "Nueva Propiedad".
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal del Formulario CRUD */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && !isPending && setIsFormOpen(false)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-6">
          <DialogHeader className="pb-4 border-b border-border/60">
            <DialogTitle className="text-xl font-bold text-primary">
              {editingId ? "Editar Publicación" : "Crear Nueva Publicación"}
            </DialogTitle>
            <DialogDescription>
              Complete todos los datos técnicos del inmueble. El guardado es inmediato.
            </DialogDescription>
          </DialogHeader>

          {/* Pestañas de Navegación del Formulario */}
          <div className="flex border-b border-border/80 my-3">
            <button
              type="button"
              onClick={() => setActiveTab('basics')}
              className={`flex-1 pb-2 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 py-1 ${
                activeTab === 'basics'
                  ? "border-accent text-primary"
                  : "border-transparent text-foreground/50 hover:text-foreground/80"
              }`}
            >
              <Building className="h-4 w-4 shrink-0" />
              <span>Básico</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('location')}
              className={`flex-1 pb-2 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 py-1 ${
                activeTab === 'location'
                  ? "border-accent text-primary"
                  : "border-transparent text-foreground/50 hover:text-foreground/80"
              }`}
            >
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Ubicación y Precio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 pb-2 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 py-1 ${
                activeTab === 'details'
                  ? "border-accent text-primary"
                  : "border-transparent text-foreground/50 hover:text-foreground/80"
              }`}
            >
              <Sliders className="h-4 w-4 shrink-0" />
              <span>Detalles y Fotos</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Pestaña 1: Información Básica */}
            {activeTab === 'basics' && (
              <div className="space-y-4 transition-all duration-300">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Título de la Publicación *</label>
                  <Input
                    placeholder="ej: Amplio departamento de 3 dormitorios en Sopocachi"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    disabled={isPending}
                    className="focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Descripción Detallada *</label>
                  <textarea
                    placeholder="Describa el inmueble con todas las comodidades, acabados y puntos de interés cercanos..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    disabled={isPending}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[90px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Tipo de Transacción *</label>
                    <Select
                      value={form.operationType}
                      onValueChange={(val) => setForm({ ...form, operationType: val || "" })}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VENTA">VENTA</SelectItem>
                        <SelectItem value="ALQUILER">ALQUILER</SelectItem>
                        <SelectItem value="ANTICRETICO">ANTICRÉTICO</SelectItem>
                        <SelectItem value="PROYECTO">PROYECTO (Pre-venta)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Tipo de Inmueble *</label>
                    <Select
                      value={form.propertyType}
                      onValueChange={(val) => setForm({ ...form, propertyType: val || "" })}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Departamento">Departamento</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Terreno">Terreno</SelectItem>
                        <SelectItem value="Oficina">Oficina</SelectItem>
                        <SelectItem value="Local">Local Comercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 py-3 px-4 rounded-xl bg-emerald-50/60 border border-emerald-100/80 mt-2">
                  <input
                    id="isFeatured"
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    disabled={isPending}
                    className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="isFeatured" className="text-sm font-bold text-emerald-950 cursor-pointer select-none">
                      Destacar propiedad
                    </label>
                    <span className="text-[11px] sm:text-xs text-emerald-800/80">Se mostrará en la sección de destacados de la página de inicio.</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40 mt-4">
                  <Button
                    type="button"
                    onClick={() => setActiveTab('location')}
                    className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1 font-semibold"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Pestaña 2: Ubicación y Precio */}
            {activeTab === 'location' && (
              <div className="space-y-4 transition-all duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Ciudad *</label>
                    <Select
                      value={form.locationCity}
                      onValueChange={(val) => {
                        const city = val || ""
                        const zones = BOLIVIA_LOCATIONS[city] || []
                        setForm({ 
                          ...form, 
                          locationCity: city,
                          locationZone: zones[0] || "" 
                        })
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                        <SelectItem value="La Paz">La Paz</SelectItem>
                        <SelectItem value="Cochabamba">Cochabamba</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Zona / Barrio *</label>
                    <Select
                      value={form.locationZone}
                      onValueChange={(val) => setForm({ ...form, locationZone: val || "" })}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableZones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Precio *</label>
                    <div className="flex gap-1.5">
                      <Input
                        type="number"
                        placeholder="Monto"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        disabled={isPending}
                        className="flex-1"
                      />
                      <Select
                        value={form.currency}
                        onValueChange={(val) => setForm({ ...form, currency: val || "" })}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-[95px] shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="BOB">BOB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Teléfono WhatsApp *</label>
                    <Input
                      placeholder="ej: +59170000000"
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border/40 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('basics')}
                    className="border-border text-foreground/80 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1 font-semibold"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Pestaña 3: Detalles y Fotos */}
            {activeTab === 'details' && (
              <div className="space-y-4 transition-all duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Superficie (m²) *</label>
                    <Input
                      type="number"
                      placeholder="ej: 120"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Dormitorios</label>
                    <Input
                      type="number"
                      placeholder="ej: 3"
                      value={form.bedrooms}
                      onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                      disabled={isPending}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Baños</label>
                    <Input
                      type="number"
                      placeholder="ej: 2"
                      value={form.bathrooms}
                      onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                    URLs de Imágenes * <span className="text-[11px] text-foreground/50 lowercase tracking-normal">(una por línea)</span>
                  </label>
                  <textarea
                    placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
                    value={form.imagesText}
                    onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
                    disabled={isPending}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-[11px] leading-relaxed min-h-[75px]"
                  />
                  <span className="text-[10px] text-foreground/40 block leading-tight">Pegue URLs directas de imágenes (de stock o Unsplash).</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                    Características <span className="text-[11px] text-foreground/50 lowercase tracking-normal">(separadas por comas)</span>
                  </label>
                  <Input
                    placeholder="ej: Piscina, Churrasquera, Garaje, Gas Domiciliario, Portón Eléctrico"
                    value={form.featuresText}
                    onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                    disabled={isPending}
                  />
                </div>

                <div className="flex justify-between pt-5 border-t border-border/40 mt-5">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('location')}
                      className="border-border text-foreground/80 flex items-center gap-1 font-semibold"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Atrás
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsFormOpen(false)}
                      disabled={isPending}
                      className="text-foreground/50 hover:text-foreground/80"
                    >
                      Cancelar
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 font-bold px-5"
                    disabled={isPending}
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{editingId ? "Guardar Cambios" : "Crear Publicación"}</span>
                  </Button>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
