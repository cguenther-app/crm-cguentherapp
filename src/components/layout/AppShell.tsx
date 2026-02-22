'use client'

import { AuthGuard } from './AuthGuard'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:pl-60">
          <div className="p-4 md:p-6 pb-20 md:pb-6">{children}</div>
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
