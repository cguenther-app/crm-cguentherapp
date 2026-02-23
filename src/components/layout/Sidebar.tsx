'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Building2,
  Users,
  Package,
  LogOut,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/leads', label: 'Leads', icon: BarChart3 },
  { href: '/organisationen', label: 'Organisationen', icon: Building2 },
  { href: '/kontakte', label: 'Kontakte', icon: Users },
  { href: '/produkte', label: 'Produkte', icon: Package },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-navy border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <Image
          src="/logo.png"
          alt="cguenther.app"
          width={160}
          height={40}
          className="h-8 w-auto"
          priority
        />
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-white/5 dark:hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 space-y-2">
        <Separator />
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted-foreground truncate">
            {user?.email}
          </span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Abmelden</span>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
