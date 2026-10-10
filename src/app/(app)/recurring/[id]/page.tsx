import RecurringEditScreen from '@/features/recurring/recurringEdit/RecurringEditScreen'

// The shell is the same for every recurring payment (the screen reads the id
// and its data on the client), so each path is rendered statically on first visit.
export async function generateStaticParams() {
  return []
}

export default function RecurringEditPage() {
  return <RecurringEditScreen />
}
