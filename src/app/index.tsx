import { AppProviders } from '@/app/providers'
import { Router } from '@/app/router'

export function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  )
}