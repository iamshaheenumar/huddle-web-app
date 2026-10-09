'use client'

import { useProfile } from '@/features/common/queries'
import ProfileView from '../profileView/ProfileView'
import ProfileSkeleton from '../profileSkeleton/ProfileSkeleton'

export default function ProfileSection() {
  const { data: profile } = useProfile()
  if (profile === undefined) return <ProfileSkeleton />
  return <ProfileView key={profile?.id} profile={profile} />
}
