import MembersHeaderSkeleton from '../membersHeader/MembersHeaderSkeleton'
import GroupTotalCardSkeleton from '../groupTotalCard/GroupTotalCardSkeleton'
import MemberListSkeleton from '../memberList/MemberListSkeleton'

export default function MembersSkeleton() {
  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <MembersHeaderSkeleton />
      <GroupTotalCardSkeleton />
      <MemberListSkeleton />
    </div>
  )
}
