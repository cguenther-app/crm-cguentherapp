'use client'

import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase'
import { Offer, OfferPosition } from '@/types'

/** PocketBase stores positions as text; parse it back to OfferPosition[] */
function parsePositions(raw: unknown): OfferPosition[] {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw.length > 0) {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

function hydrateOffer(record: Offer): Offer {
  return { ...record, positions: parsePositions(record.positions) }
}

export function useAngebote() {
  const [angebote, setAngebote] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const records = await pb.collection('offers').getFullList<Offer>({
        sort: '-date',
        expand: 'organization,contact',
      })
      setAngebote(records.map(hydrateOffer))
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

  return { angebote, isLoading, error, refresh }
}

export { parsePositions, hydrateOffer }
