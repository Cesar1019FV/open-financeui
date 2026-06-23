import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/shared/ui/Card'
import { Icon } from '@/shared/ui/Icon'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { selectMonthlySummary } from '@/entities/account-summary'
import { formatYearMonth } from '@/entities/transaction'
import { budgetPercentUsed } from '@/entities/budget'

export function BalanceHero() {
  const { t } = useTranslation(['dashboard'])
  const { currency, format } = useCurrency()
  const transactions = useFinanceStore((s) => s.transactions)
  const budgets = useFinanceStore((s) => s.budgets)

  const yearMonth = formatYearMonth(new Date())
  const summary = selectMonthlySummary({ transactions, debts: [], loans: [], savingsGoals: [], investments: [] }, yearMonth, currency)

  let budgetUsedPct = 0
  let hasBudget = false
  const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.amount, 0)
  for (const b of budgets) {
    if (b.period === 'monthly' && totalBudgetAmount > 0) {
      hasBudget = true
      budgetUsedPct += budgetPercentUsed(b, transactions, currency, yearMonth) * (b.amount / totalBudgetAmount)
    }
  }
  budgetUsedPct = Math.min(1, hasBudget ? budgetUsedPct : 0)

  const displayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const node = displayRef.current
    if (!node) return
    if (prefersReduced) {
      node.textContent = format(summary.net, currency)
      return
    }
    const duration = 800
    const start = performance.now()
    let frame = 0
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      node.textContent = format(summary.net * eased, currency)
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [summary.net, currency, format])

  const delta = summary.vsPrevious.netDelta
  const deltaIntent: 'positive' | 'negative' = delta >= 0 ? 'positive' : 'negative'

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - budgetUsedPct)

  return (
    <Card padded className="flex flex-col lg:flex-row gap-6 items-center lg:items-stretch">
      <div className="flex-1 flex flex-col justify-center gap-2">
        <span className="text-sm text-ink-muted">{t('hero.netBalance')}</span>
        <div
          ref={displayRef}
          className={`font-mono text-5xl sm:text-6xl font-semibold tabular ${summary.net >= 0 ? 'text-ink' : 'text-negative'}`}
        >
          {format(0, currency)}
        </div>
        {delta !== 0 && (
          <div className={`inline-flex items-center gap-1 text-sm ${deltaIntent === 'positive' ? 'text-positive' : 'text-negative'}`}>
            <Icon name={deltaIntent === 'positive' ? 'arrow-up' : 'arrow-down'} size={14} />
            <span className="font-mono tabular">{format(Math.abs(delta), currency)}</span>
            <span className="text-ink-muted">{t('hero.vsLastMonth')}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center shrink-0">
        {hasBudget ? (
          <div className="relative w-32 h-32 sm:w-36 sm:h-36">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" role="img" aria-label={`${Math.round(budgetUsedPct * 100)}% ${t('hero.budgetProgress')}`}>
              <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={budgetUsedPct >= 1 ? 'var(--color-negative)' : budgetUsedPct >= 0.8 ? 'var(--color-warning)' : 'var(--color-brand-500)'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ ['--ring-circumference' as string]: circumference }}
                className="motion-safe:animate-[ringDraw_1s_var(--ease-fluid)_forwards]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-semibold tabular text-ink">{Math.round(budgetUsedPct * 100)}%</span>
              <span className="text-xs text-ink-muted">{t('hero.budgetProgress')}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-40 text-sm text-ink-muted">
            <Icon name="alert" size={24} className="mb-2 text-warning" />
            <span>{t('hero.noBudget')}</span>
          </div>
        )}
      </div>
    </Card>
  )
}