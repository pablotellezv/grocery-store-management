"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { CATEGORIES, type Category, type Supplier } from "@/lib/types"
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
  supplier: Supplier | null
}

const EMPTY = {
  name: "",
  contact: "",
  phone: "",
  email: "",
  category: CATEGORIES[0] as Category,
  notes: "",
}

export function SupplierFormDialog({ open, onOpenChange, supplier }: Props) {
  const { addSupplier, updateSupplier } = useStore()
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        contact: supplier.contact,
        phone: supplier.phone,
        email: supplier.email,
        category: supplier.category,
        notes: supplier.notes,
      })
    } else {
      setForm(EMPTY)
    }
  }, [supplier, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim()) {
      toast.error("El nombre y el contacto son obligatorios.")
      return
    }
    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      category: form.category,
      notes: form.notes.trim(),
    }
    if (supplier) {
      updateSupplier({ ...payload, id: supplier.id })
      toast.success("Proveedor actualizado")
    } else {
      addSupplier(payload)
      toast.success("Proveedor agregado")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {supplier ? "Editar proveedor" : "Nuevo proveedor"}
          </DialogTitle>
          <DialogDescription>
            Gestiona la información de contacto y categoría del proveedor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="s-name">Nombre del proveedor</Label>
            <Input
              id="s-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Frutas y Verduras del Bajío"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="s-contact">Persona de contacto</Label>
            <Input
              id="s-contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="Ej. Ramón Aguilar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-phone">Teléfono</Label>
              <Input
                id="s-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="55 1234 5678"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="s-email">Correo electrónico</Label>
              <Input
                id="s-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ventas@proveedor.mx"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="s-cat">Categoría</Label>
            <Select
              value={form.category}
              onValueChange={(v) =>
                setForm({ ...form, category: v as Category })
              }
            >
              <SelectTrigger id="s-cat">
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="s-notes">Notas</Label>
            <Textarea
              id="s-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Condiciones de entrega, días de visita, etc."
              rows={3}
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
              {supplier ? "Guardar cambios" : "Agregar proveedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}