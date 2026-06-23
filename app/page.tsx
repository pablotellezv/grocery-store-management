"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Search, Truck, Clock, Leaf } from "lucide-react"
import { useStore } from "@/lib/store"
import { CATEGORIES, type Category } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Filter = "Todos" | Category

export default function HomePage() {
  const { products, ready } = useStore()
  const [filter, setFilter] = useState<Filter>("Todos")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = filter === "Todos" || p.category === filter
      const matchesQuery =
        query.trim() === "" ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      return matchesCat && matchesQuery
    })
  }, [products, filter, query])

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
            <Image
              src="/hero-abarrotes.png"
              alt="Productos frescos de Mi Abarrotes"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-center gap-4 p-6 sm:p-12">
            <p className="text-sm font-medium uppercase tracking-widest text-background/80">
              Fresco, cerca de ti
            </p>
            <h1 className="max-w-xl text-balance font-serif text-3xl font-semibold leading-tight text-background sm:text-5xl">
              La tienda de la esquina, ahora a un clic
            </h1>
            <p className="max-w-md text-pretty text-background/85">
              Fruta, verdura, lácteos y despensa fresca. Pide en línea y recíbelo
              el mismo día.
            </p>
            <div>
              <Button
                size="lg"
                render={<a href="#productos" />}
                className="bg-background text-foreground hover:bg-background/90"
              >
                Ver productos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Entrega el mismo día", desc: "Pedidos antes de las 4 pm" },
            { icon: Leaf, title: "Siempre fresco", desc: "Fruta y verdura del día" },
            { icon: Clock, title: "Atención de barrio", desc: "Como en la tiendita de siempre" },
          ].map((b) => (
            <div
              key={b.title}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <b.icon className="size-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="productos" className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Nuestros productos
            </h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} producto{filtered.length === 1 ? "" : "s"}{" "}
              disponible{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="my-5 flex flex-wrap gap-2">
          {(["Todos", ...CATEGORIES] as Filter[]).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {!ready ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No encontramos productos. Prueba con otra búsqueda o categoría.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          <p className="font-serif text-lg font-semibold text-foreground">
            Mi Abarrotes
          </p>
          <p className="mt-1">
            Tu tienda de barrio, ahora en línea. Hecho con cariño para la
            colonia.
          </p>
        </div>
      </footer>
    </div>
  )
}
