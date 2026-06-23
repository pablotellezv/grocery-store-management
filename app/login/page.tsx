"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const { login } = useStore()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const res = login(email, password)
    if (!res.ok) {
      setError(res.error ?? "No se pudo iniciar sesión.")
      return
    }
    toast.success("¡Bienvenido de vuelta!")
    router.push("/")
  }

  function quickLogin(demoEmail: string, demoPass: string) {
    setEmail(demoEmail)
    setPassword(demoPass)
    const res = login(demoEmail, demoPass)
    if (res.ok) {
      toast.success("Sesión iniciada")
      router.push(demoEmail.includes("admin") ? "/admin" : "/")
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Inicia sesión
          </h1>
          <p className="mt-1 text-muted-foreground">
            Entra a tu cuenta de Mi Abarrotes
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
          <Button type="submit" size="lg">
            Entrar
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate
            </Link>
          </p>
        </form>

        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-4">
          <p className="mb-3 text-sm font-medium text-foreground">
            Cuentas de demostración
          </p>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => quickLogin("admin@miabarrotes.mx", "admin123")}
            >
              Entrar como Administrador
            </Button>
            <Button
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => quickLogin("cliente@miabarrotes.mx", "cliente123")}
            >
              Entrar como Cliente
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
