"use client"

import Image from "next/image"
import { Plus, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { formatMXN, useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore()
  const [added, setAdded] = useState(false)
  const soldOut = product.stock <= 0

  function handleAdd() {
    addToCart(product.id, 1)
    setAdded(true)
    toast.success(`${product.name} agregado al carrito`)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Badge variant="destructive">Agotado</Badge>
          </div>
        )}
        {!soldOut && product.stock <= 10 && (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
            ¡Últimas {product.stock}!
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.category}
        </span>
        <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="leading-tight">
            <span className="text-xl font-semibold text-foreground">
              {formatMXN(product.price)}
            </span>
            <span className="text-sm text-muted-foreground"> / {product.unit}</span>
          </div>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={soldOut}
            className="gap-1.5"
          >
            {added ? (
              <>
                <Check className="size-4" /> Listo
              </>
            ) : (
              <>
                <Plus className="size-4" /> Agregar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
