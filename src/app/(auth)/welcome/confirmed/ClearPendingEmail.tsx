'use client'

import { useEffect } from 'react'
import { clearPendingEmail } from '@/features/onboarding/confirmation'

// The address is confirmed, so the device no longer needs to remember it.
export default function ClearPendingEmail() {
  useEffect(() => { clearPendingEmail() }, [])
  return null
}
