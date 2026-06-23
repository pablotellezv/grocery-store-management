export type Role = "admin" | "cliente"

export type User = {
  id: string
  name: string
  email: string
  password: string
  role: Role
}

export type Category =
  | "Frutas y Verduras"
  | "Lácteos y Huevo"
  | "Despensa"
  | "Bebidas"
  | "Panadería"

export const CATEGORIES: Category[] = [
  "Frutas y Verduras",
  "Lácteos y Huevo",
  "Despensa",
  "Bebidas",
  "Panadería",
]

export type Product = {
  id: string
  name: string
  description: string
  price: number
  unit: string
  stock: number
  category: Category
  image: string
}

export type CartItem = {
  productId: string
  qty: number
}

export type OrderItem = {
  productId: string
  name: string
  price: number
  qty: number
}

export type Order = {
  id: string
  userId: string
  userName: string
  items: OrderItem[]
  total: number
  createdAt: string
}
