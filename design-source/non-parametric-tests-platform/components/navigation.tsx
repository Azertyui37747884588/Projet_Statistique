"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Upload, FlaskConical, LineChart, MapPin, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Accueil", icon: BarChart3 },
  { href: "/upload", label: "Téléversement", icon: Upload },
  { href: "/tests", label: "Tests", icon: FlaskConical },
  { href: "/visualisation", label: "Visualisation", icon: LineChart },
  { href: "/prediction", label: "Prédiction", icon: Brain },
  { href: "/cartographie", label: "Cartographie", icon: MapPin },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-foreground">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">StatTest</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
