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
import { Plus, Edit, Trash2, Home, LogOut, Loader2, AlertCircle } from "lucide-react"
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
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              {editingId ? "Editar Publicación" : "Crear Nueva Publicación"}
            </DialogTitle>
            <DialogDescription>
              Complete todos los datos técnicos del inmueble. El guardado es inmediato.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Fila 1: Título */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Título de la Publicación *</label>
              <Input
                placeholder="ej: Amplio departamento de 3 dormitorios en Sopocachi"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={isPending}
              />
            </div>

            {/* Fila 2: Descripción */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Descripción Detallada *</label>
              <textarea
                placeholder="Describa el inmueble con todas las comodidades y acabados..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={isPending}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Operación */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Tipo de Transacción *</label>
                <Select
                  value={form.operationType}
                  onValueChange={(val) => setForm({ ...form, operationType: val || "" })}
                  disabled={isPending}
                >
                  <SelectTrigger>
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

              {/* Tipo de Inmueble */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Tipo de Inmueble *</label>
                <Select
                  value={form.propertyType}
                  onValueChange={(val) => setForm({ ...form, propertyType: val || "" })}
                  disabled={isPending}
                >
                  <SelectTrigger>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ciudad */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Ciudad *</label>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                    <SelectItem value="La Paz">La Paz</SelectItem>
                    <SelectItem value="Cochabamba">Cochabamba</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Zona */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Zona / Barrio *</label>
                <Select
                  value={form.locationZone}
                  onValueChange={(val) => setForm({ ...form, locationZone: val || "" })}
                  disabled={isPending}
                >
                  <SelectTrigger>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Precio */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Precio *</label>
                <div className="flex gap-1.5">
                  <Input
                    type="number"
                    placeholder="Monto"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    disabled={isPending}
                  />
                  <Select
                    value={form.currency}
                    onValueChange={(val) => setForm({ ...form, currency: val || "" })}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="BOB">BOB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Metraje */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Superficie (m²) *</label>
                <Input
                  type="number"
                  placeholder="Área construida"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  disabled={isPending}
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Teléfono WhatsApp *</label>
                <Input
                  placeholder="ej: +59170000000"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dormitorios */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Dormitorios</label>
                <Input
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                  disabled={isPending}
                />
              </div>

              {/* Baños */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Baños</label>
                <Input
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Fila: URLs de imágenes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">
                URLs de Imágenes * <span className="text-xs text-foreground/50">(Una por línea)</span>
              </label>
              <textarea
                placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
                value={form.imagesText}
                onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
                disabled={isPending}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
              />
            </div>

            {/* Fila: Características */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">
                Características adicionales <span className="text-xs text-foreground/50">(Separadas por comas)</span>
              </label>
              <Input
                placeholder="Piscina, Churrasquera, Garaje, Gas Domiciliario"
                value={form.featuresText}
                onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                disabled={isPending}
              />
            </div>

            {/* Fila: Destacada */}
            <div className="flex items-center gap-2 py-1">
              <input
                id="isFeatured"
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                disabled={isPending}
                className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-foreground/80 cursor-pointer select-none">
                Marcar como propiedad destacada en la página de inicio
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-border/40 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isPending}
                className="border-border text-foreground"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1"
                disabled={isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Guardar Cambios" : "Crear Publicación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
