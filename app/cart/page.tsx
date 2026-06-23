"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingBasket, PartyPopper } from "lucide-react"
import { formatMXN, useStore } from "@/lib/store"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import type { Order } from "@/lib/types"

export default function CartPage() {
  const { cart, products, setQty, removeFromCart, checkout, currentUser } =
    useStore()
  const router = useRouter()
  const [placed, setPlaced] = useState<Order | null>(null)

  const lines = cart
    .map((ci) => {
      const product = products.find((p) => p.id === ci.productId)
      return product ? { product, qty: ci.qty } : null
    })
    .filter(Boolean) as { product: (typeof products)[number]; qty: number }[]

  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0)

  function handleCheckout() {
    if (!currentUser) {
      router.push("/login")
      return
    }
    const order = checkout()
    if (order) setPlaced(order)
  }

  if (placed) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PartyPopper className="size-8" />
          </span>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            ¡Pedido confirmado!
          </h1>
          <p className="text-muted-foreground">
            Gracias por tu compra, {placed.userName.split(" ")[0]}. Tu pedido{" "}
            <span className="font-mono text-foreground">{placed.id}</span> por{" "}
            <span className="font-semibold text-foreground">
              {formatMXN(placed.total)}
            </span>{" "}
            está en camino.
          </p>
          <Button render={<Link href="/" />} size="lg" className="mt-2">
            Seguir comprando
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-6 font-serif text-3xl font-semibold text-foreground">
          Tu carrito
        </h1>

        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
            <ShoppingBasket className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Tu carrito está vacío.</p>
            <Button render={<Link href="/" />}>Ir a la tienda</Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-3">
              {lines.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3"
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatMXN(product.price)} / {product.unit}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          aria-label="Quitar uno"
                          onClick={() => setQty(product.id, qty - 1)}
                          className="flex size-8 items-center justify-center rounded-full text-foreground hover:bg-secondary"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {qty}
                        </span>
                        <button
                          aria-label="Agregar uno"
                          onClick={() => setQty(product.id, qty + 1)}
                          disabled={qty >= product.stock}
                          className="flex size-8 items-center justify-center rounded-full text-foreground hover:bg-secondary disabled:opacity-40"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <button
                        aria-label="Eliminar del carrito"
                        onClick={() => removeFromCart(product.id)}
                        className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 font-semibold text-foreground">
                    {formatMXN(product.price * qty)}
                  </p>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-20">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                Resumen
              </h2>
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMXN(total)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>Envío</span>
                <span className="text-primary">Gratis</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatMXN(total)}</span>
              </div>
              <Button onClick={handleCheckout} size="lg" className="mt-5 w-full">
                {currentUser ? "Confirmar pedido" : "Inicia sesión para comprar"}
              </Button>
              {!currentUser && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Necesitas una cuenta para finalizar tu compra.
                </p>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
