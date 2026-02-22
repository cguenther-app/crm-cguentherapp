'use client'

import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase'
import { Contact } from '@/types'

export function useKontakte(organizationId?: string) {
  const [kontakte, setKontakte] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const records = await pb.collection('contacts').getFullList<Contact>({
        filter: organizationId ? `organization = "${organizationId}"` : '',
        sort: 'last_name,first_name',
        expand: 'organization',
      })
      setKontakte(records)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { kontakte, isLoading, refresh }
}
