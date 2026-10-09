'use client'

import { useSyncExternalStore } from 'react'
import { onlineManager } from '@tanstack/react-query'

// Whether the query layer considers the device online; queries and queued
// writes pause while this is false.
export function useOnline() {
  return useSyncExternalStore(
    cb => onlineManager.subscribe(cb),
    () => onlineManager.isOnline(),
    () => true,
  )
}
