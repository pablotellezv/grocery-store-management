"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  TriangleAlert,
  Receipt,
  Wallet,
  Truck,
  Mail,
  Phone,
} from "lucide-react"
import { formatMXN, useStore } from "@/lib/store"
import type { Product, Supplier } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { ProductFormDialog } from "@/components/product-form-dialog"
import { SupplierFormDialog } from "@/components/supplier-form-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const {
    currentUser,
    products,
    suppliers,
    orders,
    deleteProduct,
    deleteSupplier,
    ready,
  } = useStore()

  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const [tab, setTab] = useState<"inventario" | "proveedores" | "pedidos">(
    "inventario"
  )

  const isAdmin = currentUser?.role === "admin"

  function openNewProduct() {
    setEditingProduct(null)
    setProductDialogOpen(true)
  }
  function openEditProduct(p: Product) {
    setEditingProduct(p)
    setProductDialogOpen(true)
  }
  function handleDeleteProduct(p: Product) {
    if (confirm(`¿Eliminar "${p.name}"?`)) {
      deleteProduct(p.id)
      toast.success("Producto eliminado")
    }
  }

  function openNewSupplier() {
    setEditingSupplier(null)
    setSupplierDialogOpen(true)
  }
  function openEditSupplier(s: Supplier) {
    setEditingSupplier(s)
    setSupplierDialogOpen(true)
  }
  function handleDeleteSupplier(s: Supplier) {
    if (confirm(`¿Eliminar al proveedor "${s.name}"?`)) {
      deleteSupplier(s.id)
      toast.success("Proveedor eliminado")
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
    { icon: Truck, label: "Proveedores", value: suppliers.length },
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
          {tab === "inventario" && (
            <Button onClick={openNewProduct} className="gap-1.5">
              <Plus className="size-4" /> Nuevo producto
            </Button>
          )}
          {tab === "proveedores" && (
            <Button onClick={openNewSupplier} className="gap-1.5">
              <Plus className="size-4" /> Nuevo proveedor
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
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
          {(["inventario", "proveedores", "pedidos"] as const).map((t) => (
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

        {/* Inventario */}
        {tab === "inventario" && (
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
                          onClick={() => openEditProduct(p)}
                          aria-label={`Editar ${p.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(p)}
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
        )}

        {/* Proveedores */}
        {tab === "proveedores" && (
          <div className="mt-4 flex flex-col gap-3">
            {suppliers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                Aún no hay proveedores registrados.
              </div>
            ) : (
              suppliers.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    {/* Info principal */}
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                        <Truck className="size-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">
                          {s.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {s.contact}
                        </p>
                        <Badge className="mt-1 bg-secondary text-secondary-foreground">
                          {s.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditSupplier(s)}
                        aria-label={`Editar ${s.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSupplier(s)}
                        aria-label={`Eliminar ${s.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Datos de contacto */}
                  <div className="mt-3 flex flex-wrap gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
                    {s.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        {s.phone}
                      </span>
                    )}
                    {s.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        {s.email}
                      </span>
                    )}
                  </div>

                  {/* Notas */}
                  {s.notes && (
                    <p className="mt-2 rounded-lg bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
                      {s.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Pedidos */}
        {tab === "pedidos" && (
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
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={editingProduct}
      />

      <SupplierFormDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        supplier={editingSupplier}
      />
    </div>
  )
}