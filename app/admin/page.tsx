"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  TriangleAlert,
  Receipt,
  Wallet,
} from "lucide-react"
import { formatMXN, useStore } from "@/lib/store"
import type { Product } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { ProductFormDialog } from "@/components/product-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const { currentUser, products, orders, deleteProduct, ready } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [tab, setTab] = useState<"inventario" | "pedidos">("inventario")

  const isAdmin = currentUser?.role === "admin"

  function openNew() {
    setEditing(null)
    setDialogOpen(true)
  }
  function openEdit(p: Product) {
    setEditing(p)
    setDialogOpen(true)
  }
  function handleDelete(p: Product) {
    if (confirm(`¿Eliminar "${p.name}"?`)) {
      deleteProduct(p.id)
      toast.success("Producto eliminado")
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-16 text-muted-foreground">
          Cargando...
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
          <TriangleAlert className="size-10 text-accent" />
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Acceso restringido
          </h1>
          <p className="text-muted-foreground">
            Esta sección es solo para administradores. Inicia sesión con una
            cuenta de administrador.
          </p>
          <Button render={<Link href="/login" />}>Iniciar sesión</Button>
        </main>
      </div>
    )
  }

  const totalStock = products.reduce((s, p) => s + p.stock, 0)
  const lowStock = products.filter((p) => p.stock <= 10)
  const revenue = orders.reduce((s, o) => s + o.total, 0)

  const stats = [
    { icon: Package, label: "Productos", value: products.length },
    { icon: TriangleAlert, label: "Bajo inventario", value: lowStock.length },
    { icon: Receipt, label: "Pedidos", value: orders.length },
    { icon: Wallet, label: "Ventas", value: formatMXN(revenue) },
  ]

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              Panel de administración
            </h1>
            <p className="text-muted-foreground">
              Hola {currentUser?.name}, administra tu tienda.
            </p>
          </div>
          <Button onClick={openNew} className="gap-1.5">
            <Plus className="size-4" /> Nuevo producto
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <s.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 border-b border-border">
          {(["inventario", "pedidos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "inventario" ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Producto</th>
                  <th className="hidden p-3 font-medium sm:table-cell">
                    Categoría
                  </th>
                  <th className="p-3 font-medium">Precio</th>
                  <th className="p-3 font-medium">Stock</th>
                  <th className="p-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-border bg-card hover:bg-secondary/20"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                          <Image
                            src={p.image || "/placeholder.svg"}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium text-foreground">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden p-3 text-muted-foreground sm:table-cell">
                      {p.category}
                    </td>
                    <td className="p-3 text-foreground">
                      {formatMXN(p.price)}
                    </td>
                    <td className="p-3">
                      {p.stock <= 0 ? (
                        <Badge variant="destructive">Agotado</Badge>
                      ) : p.stock <= 10 ? (
                        <Badge className="bg-accent text-accent-foreground">
                          {p.stock}
                        </Badge>
                      ) : (
                        <span className="text-foreground">{p.stock}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                          aria-label={`Editar ${p.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(p)}
                          aria-label={`Eliminar ${p.name}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                Aún no hay pedidos.
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">
                        {o.id}
                      </p>
                      <p className="font-medium text-foreground">
                        {o.userName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatMXN(o.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                    {o.items.map((it) => (
                      <li
                        key={it.productId}
                        className="rounded-full bg-secondary/60 px-3 py-1 text-xs text-secondary-foreground"
                      >
                        {it.qty} × {it.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
      />
    </div>
  )
}
