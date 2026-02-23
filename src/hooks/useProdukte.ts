'use client'

import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase'
import { Product } from '@/types'

export function useProdukte() {
  const [produkte, setProdukte] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const records = await pb.collection('products').getFullList<Product>({
        sort: 'category,article_number',
      })
      setProdukte(records)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { produkte, isLoading, refresh }
}
