import { Suspense } from 'react'
import ProfileSection from '@/features/profile/profileSection/ProfileSection'
import ProfileSkeleton from '@/features/profile/profileSkeleton/ProfileSkeleton'

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileSection />
    </Suspense>
  )
}
