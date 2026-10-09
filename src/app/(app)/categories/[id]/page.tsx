import CategoryScreen from '@/features/categories/categoryScreen/CategoryScreen'

// The shell is the same for every category (the screen reads the id and its data
// on the client), so each path is rendered statically on first visit.
export async function generateStaticParams() {
  return []
}

export default function CategoryDetailPage() {
  return <CategoryScreen />
}
