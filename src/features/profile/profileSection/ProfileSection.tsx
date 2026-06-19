import { getProfile } from '../data'
import ProfileView from '../profileView/ProfileView'

export default async function ProfileSection() {
  const profile = await getProfile()
  return <ProfileView profile={profile} />
}
