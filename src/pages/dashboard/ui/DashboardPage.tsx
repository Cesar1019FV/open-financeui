import { useTranslation } from 'react-i18next'

import { PageHeader } from '@/shared/ui/PageHeader'
import { BalanceHero } from '@/widgets/balance-hero'
import { KpiCards } from '@/widgets/kpi-cards'
import { MonthlyComparisonBar } from '@/widgets/monthly-comparison-bar'
import { CategoryBreakdownPie } from '@/widgets/category-breakdown-pie'
import { UpcomingReminders } from '@/widgets/upcoming-reminders'
import { BudgetAlertsList } from '@/widgets/budget-alerts-list'
import { NetWorthCard } from '@/widgets/net-worth-card'

export function DashboardPage() {
  const { t } = useTranslation(['dashboard'])

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <BalanceHero />
      <KpiCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyComparisonBar />
        </div>
        <CategoryBreakdownPie />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingReminders />
        <BudgetAlertsList />
      </div>
      <NetWorthCard />
    </div>
  )
}