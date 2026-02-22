'use client'

import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase'
import { Note } from '@/types'

interface Options {
  organizationId?: string
  contactId?: string
}

export function useNotizen({ organizationId, contactId }: Options) {
  const [notizen, setNotizen] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const filters: string[] = []
      if (organizationId) filters.push(`organization = "${organizationId}"`)
      if (contactId) filters.push(`contact = "${contactId}"`)

      const records = await pb.collection('notes').getFullList<Note>({
        filter: filters.join(' || '),
        sort: '-noted_at',
      })
      setNotizen(records)
    } finally {
      setIsLoading(false)
    }
  }, [organizationId, contactId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { notizen, isLoading, refresh }
}
