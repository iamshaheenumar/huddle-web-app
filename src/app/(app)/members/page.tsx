import MembersHeader from '@/features/members/membersHeader/MembersHeader'
import GroupTotalCard from '@/features/members/groupTotalCard/GroupTotalCard'
import MemberList from '@/features/members/memberList/MemberList'

// Static shell: each section reads the client query cache and shows its own
// skeleton only until it has data.
export default function MembersPage() {
  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#F6F3EE' }}>
      <MembersHeader />
      <GroupTotalCard />
      <MemberList />
    </div>
  )
}
