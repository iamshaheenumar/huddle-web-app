'use client'

import { useQueryClient } from '@tanstack/react-query'
import { revalidateAppData } from '@/lib/actions'

// After a write: refetch client-cached queries and purge the router cache for
// pages that still render on the server.
export function useInvalidateAppData() {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([revalidateAppData(), queryClient.invalidateQueries()])
  }
}
