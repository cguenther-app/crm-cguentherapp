'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import pb from '@/lib/pocketbase'
import { login as pbLogin, logout as pbLogout } from '@/lib/auth'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState(pb.authStore.model)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Auth-State initial prüfen
    setUser(pb.authStore.model)
    setIsLoading(false)

    // Auf Auth-Änderungen hören
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser(model)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await pbLogin(email, password)
      router.push('/leads')
      return result
    },
    [router]
  )

  const logout = useCallback(() => {
    pbLogout()
    router.push('/login')
  }, [router])

  return {
    user,
    isLoading,
    isAuthenticated: pb.authStore.isValid,
    login,
    logout,
  }
}
