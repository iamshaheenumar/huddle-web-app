import CheckEmail from './CheckEmail'

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return <CheckEmail next={next} />
}
