import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { Icon, type IconName } from '@/shared/ui/Icon'
import { useFinanceStore } from '@/shared/api'
import { isOverdue } from '@/entities/reminder'

interface NavItem {
  to: string
  labelKey: string
  icon: IconName
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav:dashboard', icon: 'dashboard' },
  { to: '/income', labelKey: 'nav:income', icon: 'income' },
  { to: '/expenses', labelKey: 'nav:expenses', icon: 'expense' },
  { to: '/balance', labelKey: 'nav:balance', icon: 'balance' },
  { to: '/debts', labelKey: 'nav:debts', icon: 'debt' },
  { to: '/loans', labelKey: 'nav:loans', icon: 'loan' },
  { to: '/savings', labelKey: 'nav:savings', icon: 'savings' },
  { to: '/investments', labelKey: 'nav:investments', icon: 'investment' },
  { to: '/history', labelKey: 'nav:history', icon: 'history' },
  { to: '/settings', labelKey: 'nav:settings', icon: 'settings' },
]

interface SidebarNavigationProps {
  onNavigate?: () => void
}

export function SidebarNavigation({ onNavigate }: SidebarNavigationProps) {
  const { t } = useTranslation(['nav'])
  const reminders = useFinanceStore((s) => s.reminders)
  const overdueCount = reminders.filter((r) => isOverdue(r)).length

  return (
    <nav aria-label="Main" className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              isActive
                ? 'bg-brand-100 text-brand-700'
                : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
            )
          }
        >
          <Icon name={item.icon} size={20} />
          <span className="flex-1">{t(item.labelKey)}</span>
          {item.to === '/' && overdueCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-negative text-canvas text-xs font-semibold">
              {overdueCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}