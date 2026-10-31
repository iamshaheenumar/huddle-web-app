import LinkExpired from './LinkExpired'

export default async function LinkExpiredPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams
  return <LinkExpired invite={kind === 'invite'} />
}
