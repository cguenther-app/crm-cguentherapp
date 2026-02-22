'use client'

import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase'
import { Organization } from '@/types'

export function useOrganisationen() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const records = await pb.collection('organizations').getFullList<Organization>({
        sort: 'name',
      })
      setOrgs(records)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { orgs, isLoading, refresh }
}
