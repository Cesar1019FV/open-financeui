import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { DashboardLayout } from '@/app/layouts'
import { PageSkeleton } from '@/widgets/page-skeleton'

const DashboardPage = lazy(() => import('@/pages/dashboard/ui/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const IncomePage = lazy(() => import('@/pages/income/ui/IncomePage').then((m) => ({ default: m.IncomePage })))
const ExpensesPage = lazy(() => import('@/pages/expenses/ui/ExpensesPage').then((m) => ({ default: m.ExpensesPage })))
const BalancePage = lazy(() => import('@/pages/balance/ui/BalancePage').then((m) => ({ default: m.BalancePage })))
const DebtsPage = lazy(() => import('@/pages/debts/ui/DebtsPage').then((m) => ({ default: m.DebtsPage })))
const LoansPage = lazy(() => import('@/pages/loans/ui/LoansPage').then((m) => ({ default: m.LoansPage })))
const SavingsPage = lazy(() => import('@/pages/savings/ui/SavingsPage').then((m) => ({ default: m.SavingsPage })))
const InvestmentsPage = lazy(() => import('@/pages/investments/ui/InvestmentsPage').then((m) => ({ default: m.InvestmentsPage })))
const HistoryPage = lazy(() => import('@/pages/history/ui/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const SettingsPage = lazy(() => import('@/pages/settings/ui/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const NotFoundPage = lazy(() => import('@/pages/not-found/ui/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function PageFallback() {
  return <PageSkeleton />
}

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
)

const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'income', element: withSuspense(<IncomePage />) },
      { path: 'expenses', element: withSuspense(<ExpensesPage />) },
      { path: 'balance', element: withSuspense(<BalancePage />) },
      { path: 'debts', element: withSuspense(<DebtsPage />) },
      { path: 'loans', element: withSuspense(<LoansPage />) },
      { path: 'savings', element: withSuspense(<SavingsPage />) },
      { path: 'investments', element: withSuspense(<InvestmentsPage />) },
      { path: 'history', element: withSuspense(<HistoryPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}