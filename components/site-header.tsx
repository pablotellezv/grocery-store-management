"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingBasket, LayoutDashboard, LogOut, User2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function SiteHeader() {
  const { currentUser, cartCount, logout } = useStore()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Mi Abarrotes
          </span>
          <span className="hidden text-xs font-medium text-primary sm:inline">
            · tu tienda de barrio
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Button
            render={<Link href="/" />}
            variant={pathname === "/" ? "secondary" : "ghost"}
            size="sm"
          >
            Tienda
          </Button>

          {currentUser?.role === "admin" && (
            <Button
              render={<Link href="/admin" />}
              variant={pathname.startsWith("/admin") ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
            >
              <LayoutDashboard className="size-4" />
              <span className="hidden sm:inline">Panel</span>
            </Button>
          )}

          <Button
            render={<Link href="/cart" aria-label="Ver carrito" />}
            variant="ghost"
            size="sm"
            className="relative gap-1.5"
          >
            <ShoppingBasket className="size-5" />
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px] tabular-nums">
                {cartCount}
              </Badge>
            )}
          </Button>

          {currentUser ? (
            <div className="flex items-center gap-2 pl-1">
              <span className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
                <User2 className="size-4" />
                {currentUser.name.split(" ")[0]}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout()
                  router.push("/")
                }}
                className="gap-1.5"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          ) : (
            <Button render={<Link href="/login" />} size="sm" className="ml-1">
              Entrar
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
