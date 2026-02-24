'use client'

import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase'
import { AccountingEntry } from '@/types'

export function useBuchhaltung() {
  const [entries, setEntries] = useState<AccountingEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const records = await pb.collection('accounting_entries').getFullList<AccountingEntry>({
        sort: '-date',
        expand: 'invoice',
      })
      setEntries(records)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { entries, isLoading, error, refresh }
}
