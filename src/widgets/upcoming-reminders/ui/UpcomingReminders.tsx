import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'

import { Card } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { useFinanceStore } from '@/shared/api'
import { useToast } from '@/app/providers/useToast'
import { isOverdue, daysUntil, isUpcoming } from '@/entities/reminder'

export function UpcomingReminders() {
  const { t, i18n } = useTranslation(['dashboard', 'common'])
  const reminders = useFinanceStore((s) => s.reminders)
  const markDone = useFinanceStore((s) => s.markReminderDone)
  const { toast } = useToast()

  const upcoming = reminders
    .filter((r) => !r.done && (isOverdue(r) || isUpcoming(r, new Date(), 30)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 5)

  const handleMarkDone = (id: string) => {
    markDone(id)
    toast(t('common:toast.saved'))
  }

  return (
    <Card padded className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-ink">{t('sections.upcomingReminders')}</h2>
      {upcoming.length === 0 ? (
        <p className="text-sm text-ink-muted py-6 text-center">{t('common:noResults')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {upcoming.map((r) => {
            const overdue = isOverdue(r)
            const days = daysUntil(r)
            return (
              <li key={r.id} className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">{r.title}</p>
                  <p className="text-xs text-ink-muted">
                    {format(parseISO(r.date), 'MMM d', { locale: undefined })}
                    {overdue ? ` · ${Math.abs(days)} ${i18n.language === 'es' ? 'días vencido' : 'days overdue'}` : days === 0 ? ` · ${i18n.language === 'es' ? 'hoy' : 'today'}` : ` · ${days} ${i18n.language === 'es' ? 'días' : 'days'}`}
                  </p>
                </div>
                {overdue && <Badge variant="negative">{t('common:status.overdue')}</Badge>}
                <Button size="sm" variant="ghost" onClick={() => handleMarkDone(r.id)}>{t('common:actions.markDone')}</Button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}