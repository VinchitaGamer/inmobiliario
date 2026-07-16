"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, KeyRound, User, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username || !password) {
      setError("Por favor, complete todos los campos")
      return
    }

    startTransition(async () => {
      const result = await loginAction({ username, password })
      
      if (!result.success) {
        setError(result.error)
        return
      }

      // Login exitoso, refrescar y redirigir
      router.refresh()
      router.push("/admin/properties")
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem-200px)] items-center justify-center bg-brand-bg-soft/30 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg border-border bg-white">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">
            Ingreso al Panel Administrativo
          </CardTitle>
          <CardDescription>
            Ingrese sus credenciales de administrador para gestionar las publicaciones
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                Usuario de administrador
              </label>
              <Input
                id="username"
                type="text"
                placeholder="ej: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isPending}
                className="focus-visible:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-primary" />
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          
          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-white"
              disabled={isPending}
            >
              {isPending ? "Iniciando sesión..." : "Ingresar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
