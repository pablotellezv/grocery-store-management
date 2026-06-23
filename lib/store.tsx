"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { CartItem, Order, Product, Role, Supplier, User } from "./types"
import { SEED_PRODUCTS, SEED_SUPPLIERS, SEED_USERS } from "./seed"

const KEYS = {
  users: "ma_users",
  products: "ma_products",
  suppliers: "ma_suppliers",
  cart: "ma_cart",
  orders: "ma_orders",
  session: "ma_session",
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

type RegisterResult = { ok: boolean; error?: string }

type StoreValue = {
  ready: boolean
  currentUser: User | null
  products: Product[]
  suppliers: Supplier[]
  cart: CartItem[]
  orders: Order[]
  cartCount: number
  // auth
  login: (email: string, password: string) => RegisterResult
  register: (name: string, email: string, password: string) => RegisterResult
  logout: () => void
  // cart
  addToCart: (productId: string, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  checkout: () => Order | null
  // products (admin)
  addProduct: (p: Omit<Product, "id">) => void
  updateProduct: (p: Product) => void
  deleteProduct: (id: string) => void
  // suppliers (admin)
  addSupplier: (s: Omit<Supplier, "id">) => void
  updateSupplier: (s: Supplier) => void
  deleteSupplier: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // hydrate from localStorage
  useEffect(() => {
    const u = load<User[]>(KEYS.users, [])
    const p = load<Product[]>(KEYS.products, [])
    const s = load<Supplier[]>(KEYS.suppliers, [])
    const seededUsers = u.length ? u : SEED_USERS
    const seededProducts = p.length ? p : SEED_PRODUCTS
    const seededSuppliers = s.length ? s : SEED_SUPPLIERS
    setUsers(seededUsers)
    setProducts(seededProducts)
    setSuppliers(seededSuppliers)
    setCart(load<CartItem[]>(KEYS.cart, []))
    setOrders(load<Order[]>(KEYS.orders, []))
    const sessionId = load<string | null>(KEYS.session, null)
    if (sessionId) {
      setCurrentUser(seededUsers.find((x) => x.id === sessionId) ?? null)
    }
    if (!u.length) save(KEYS.users, seededUsers)
    if (!p.length) save(KEYS.products, seededProducts)
    if (!s.length) save(KEYS.suppliers, seededSuppliers)
    setReady(true)
  }, [])

  // persistence
  useEffect(() => {
    if (ready) save(KEYS.users, users)
  }, [users, ready])
  useEffect(() => {
    if (ready) save(KEYS.products, products)
  }, [products, ready])
  useEffect(() => {
    if (ready) save(KEYS.suppliers, suppliers)
  }, [suppliers, ready])
  useEffect(() => {
    if (ready) save(KEYS.cart, cart)
  }, [cart, ready])
  useEffect(() => {
    if (ready) save(KEYS.orders, orders)
  }, [orders, ready])

  const login = useCallback(
    (email: string, password: string): RegisterResult => {
      const found = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      )
      if (!found) return { ok: false, error: "No existe una cuenta con ese correo." }
      if (found.password !== password)
        return { ok: false, error: "Contraseña incorrecta." }
      setCurrentUser(found)
      save(KEYS.session, found.id)
      return { ok: true }
    },
    [users],
  )

  const register = useCallback(
    (name: string, email: string, password: string): RegisterResult => {
      const exists = users.some(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      )
      if (exists) return { ok: false, error: "Ese correo ya está registrado." }
      const newUser: User = {
        id: uid("u"),
        name: name.trim(),
        email: email.trim(),
        password,
        role: "cliente" as Role,
      }
      setUsers((prev) => [...prev, newUser])
      setCurrentUser(newUser)
      save(KEYS.session, newUser.id)
      return { ok: true }
    },
    [users],
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    save(KEYS.session, null)
  }, [])

  const addToCart = useCallback((productId: string, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty + qty } : i,
        )
      }
      return [...prev, { productId, qty }]
    })
  }, [])

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
    )
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const checkout = useCallback((): Order | null => {
    if (!currentUser || cart.length === 0) return null
    const items = cart
      .map((ci) => {
        const p = products.find((x) => x.id === ci.productId)
        if (!p) return null
        return {
          productId: p.id,
          name: p.name,
          price: p.price,
          qty: ci.qty,
        }
      })
      .filter(Boolean) as Order["items"]
    const total = items.reduce((s, i) => s + i.price * i.qty, 0)
    const order: Order = {
      id: uid("o"),
      userId: currentUser.id,
      userName: currentUser.name,
      items,
      total,
      createdAt: new Date().toISOString(),
    }
    // reduce stock
    setProducts((prev) =>
      prev.map((p) => {
        const sold = items.find((i) => i.productId === p.id)
        return sold ? { ...p, stock: Math.max(0, p.stock - sold.qty) } : p
      }),
    )
    setOrders((prev) => [order, ...prev])
    setCart([])
    return order
  }, [currentUser, cart, products])

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setProducts((prev) => [{ ...p, id: uid("p") }, ...prev])
  }, [])

  const updateProduct = useCallback((p: Product) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)))
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const cartCount = useMemo(
    () => cart.reduce((s, i) => s + i.qty, 0),
    [cart],
  )

  const value: StoreValue = {
    ready,
    currentUser,
    products,
    cart,
    orders,
    cartCount,
    login,
    register,
    logout,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    checkout,
    addProduct,
    updateProduct,
    deleteProduct,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export function formatMXN(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n)
}
