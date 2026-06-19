import { Suspense } from 'react'
import MembersHeader from '@/features/members/membersHeader/MembersHeader'
import MembersHeaderSkeleton from '@/features/members/membersHeader/MembersHeaderSkeleton'
import GroupTotalCard from '@/features/members/groupTotalCard/GroupTotalCard'
import GroupTotalCardSkeleton from '@/features/members/groupTotalCard/GroupTotalCardSkeleton'
import MemberList from '@/features/members/memberList/MemberList'
import MemberListSkeleton from '@/features/members/memberList/MemberListSkeleton'

export default function MembersPage() {
  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <Suspense fallback={<MembersHeaderSkeleton />}>
        <MembersHeader />
      </Suspense>
      <Suspense fallback={<GroupTotalCardSkeleton />}>
        <GroupTotalCard />
      </Suspense>
      <Suspense fallback={<MemberListSkeleton />}>
        <MemberList />
      </Suspense>
    </div>
  )
}
