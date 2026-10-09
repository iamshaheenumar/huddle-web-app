// Full-screen form screens: they have their own close/back and a primary action
// pinned to the bottom, so the bottom nav (and its "+" button) is hidden there.
const FULLSCREEN_PATHS = ['/expense/add', '/groups/new']

export const hidesBottomNav = (pathname: string) =>
  FULLSCREEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
