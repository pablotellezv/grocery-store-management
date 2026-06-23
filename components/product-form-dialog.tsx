"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { CATEGORIES, type Category, type Product } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

const EMPTY = {
  name: "",
  description: "",
  price: "",
  unit: "kg",
  stock: "",
  category: CATEGORIES[0] as Category,
  image: "/products/manzanas.png",
}

export function ProductFormDialog({ open, onOpenChange, product }: Props) {
  const { addProduct, updateProduct } = useStore()
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        unit: product.unit,
        stock: String(product.stock),
        category: product.category,
        image: product.image,
      })
    } else {
      setForm(EMPTY)
    }
  }, [product, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = Number.parseFloat(form.price)
    const stock = Number.parseInt(form.stock, 10)
    if (!form.name.trim() || Number.isNaN(price) || Number.isNaN(stock)) {
      toast.error("Completa nombre, precio y existencias correctamente.")
      return
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      unit: form.unit.trim() || "pza",
      stock,
      category: form.category,
      image: form.image || "/placeholder.svg",
    }
    if (product) {
      updateProduct({ ...payload, id: product.id })
      toast.success("Producto actualizado")
    } else {
      addProduct(payload)
      toast.success("Producto agregado")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {product ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
          <DialogDescription>
            Gestiona la información y existencias del producto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="p-name">Nombre</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Manzanas Rojas"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="p-desc">Descripción</Label>
            <Textarea
              id="p-desc"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Breve descripción del producto"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-price">Precio (MXN)</Label>
              <Input
                id="p-price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-unit">Unidad</Label>
              <Input
                id="p-unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="kg, pza, litro..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-stock">Existencias</Label>
              <Input
                id="p-stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="p-cat">Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({ ...form, category: v as Category })
                }
              >
                <SelectTrigger id="p-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="p-image">Ruta de imagen</Label>
            <Input
              id="p-image"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="/products/manzanas.png"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {product ? "Guardar cambios" : "Agregar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
