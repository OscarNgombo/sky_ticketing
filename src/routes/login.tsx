import { createFileRoute, redirect } from '@tanstack/react-router'
import LoginPage from '../shared/components/pages/LoginPage'
import { isLoggedIn } from '../utils/auth'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: typeof search?.returnTo === 'string' ? search.returnTo : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (isLoggedIn()) {
      const target = search.returnTo && search.returnTo.startsWith('/') ? search.returnTo : '/tickets'
      throw redirect({ to: target as any })
    }
  },
  component: () => {
    const { returnTo } = Route.useSearch()
    return <LoginPage returnTo={returnTo} />
  },
})
