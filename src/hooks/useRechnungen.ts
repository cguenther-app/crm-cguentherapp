'use client'

import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase'
import { Invoice, OfferPosition } from '@/types'

/** PocketBase stores positions as text; parse it back to OfferPosition[] */
function parsePositions(raw: unknown): OfferPosition[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw.length > 0) {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

function hydrateInvoice(record: Invoice): Invoice {
  return { ...record, positions: parsePositions(record.positions) }
}

export function useRechnungen() {
  const [rechnungen, setRechnungen] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const records = await pb.collection('invoices').getFullList<Invoice>({
        sort: '-date',
        expand: 'organization,contact,offer',
      })
      setRechnungen(records.map(hydrateInvoice))
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

  return { rechnungen, isLoading, error, refresh }
}

export { parsePositions, hydrateInvoice }
