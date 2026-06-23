import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'

import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { IconButton } from '@/shared/ui/IconButton'
import { Modal } from '@/shared/ui/Modal'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useCurrency } from '@/app/providers/useCurrency'
import { useFinanceStore } from '@/shared/api'
import { goalProgress, isGoalComplete, monthsRemaining, suggestedMonthly, goalCurrentInCurrency, goalTargetInCurrency } from '@/entities/savings-goal'
import type { SavingsGoal } from '@/entities/savings-goal'
import { SavingsGoalForm, ContributionDialog, DeleteGoalDialog } from '@/features/savings-goal-manage'

export function SavingsGoalsGrid() {
  const { t } = useTranslation(['savings', 'common'])
  const { currency, format: formatMoney } = useCurrency()
  const goals = useFinanceStore((s) => s.savingsGoals)

  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [contributing, setContributing] = useState<SavingsGoal | null>(null)
  const [deleting, setDeleting] = useState<SavingsGoal | null>(null)

  if (goals.length === 0) {
    return (
      <Card padded>
        <EmptyState title={t('empty.title')} description={t('empty.description')} />
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => {
        const progress = goalProgress(goal)
        const complete = isGoalComplete(goal)
        const current = goalCurrentInCurrency(goal, currency)
        const target = goalTargetInCurrency(goal, currency)
        const months = monthsRemaining(goal)
        const suggested = suggestedMonthly(goal)

        const radius = 38
        const circumference = 2 * Math.PI * radius
        const dashOffset = circumference * (1 - progress)

        return (
          <Card key={goal.id} padded className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink truncate">{goal.name}</h3>
                {goal.targetDate && (
                  <p className="text-xs text-ink-muted">{format(parseISO(goal.targetDate), 'MMM yyyy', { locale: undefined })}</p>
                )}
              </div>
              {complete && <Badge variant="positive">{t('common:status.completed')}</Badge>}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90" role="img" aria-label={`${Math.round(progress * 100)}%`}>
                  <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="7" />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    stroke={complete ? 'var(--color-positive)' : 'var(--color-brand-500)'}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-sm font-semibold tabular text-ink">{Math.round(progress * 100)}%</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-ink-muted">{t('common:units.total')}</span>
                  <span className="font-mono text-sm font-semibold tabular text-ink">{formatMoney(target, currency)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-ink-muted">{t('common:units.paid')}</span>
                  <span className="font-mono text-sm font-semibold tabular text-positive">{formatMoney(current, currency)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-ink-muted">{t('fields.suggestedMonthly')}</span>
                  <span className="font-mono text-xs tabular text-ink-muted">{formatMoney(suggested, currency)}</span>
                </div>
              </div>
            </div>

            {goal.targetDate && !complete && Number.isFinite(months) && months > 0 && (
              <p className="text-xs text-ink-muted">{t('fields.monthsRemaining', { n: months })}</p>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-line">
              {!complete && (
                <Button size="sm" variant="secondary" onClick={() => setContributing(goal)}>{t('common:actions.contribute')}</Button>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <IconButton icon="edit" aria-label={t('common:actions.edit')} size={16} onClick={() => setEditing(goal)} />
                <IconButton icon="trash" aria-label={t('common:actions.delete')} size={16} onClick={() => setDeleting(goal)} />
              </div>
            </div>
          </Card>
        )
      })}

      {editing && (
        <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={t('form.editTitle')}>
          <SavingsGoalForm initial={editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
      <ContributionDialog goal={contributing} onClose={() => setContributing(null)} />
      <DeleteGoalDialog goal={deleting} onClose={() => setDeleting(null)} />
    </div>
  )
}