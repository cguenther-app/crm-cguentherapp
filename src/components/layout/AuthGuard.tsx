'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import pb from '@/lib/pocketbase'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/login')
    }
  }, [router])

  if (!pb.authStore.isValid) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
