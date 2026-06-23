import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { IconButton } from '@/shared/ui/IconButton'
import { ThemeToggle } from '@/features/theme-toggle'
import { CurrencySwitch } from '@/features/currency-switch'
import { LocaleSwitch } from '@/features/locale-switch'

interface TopbarProps {
  onMenuClick: () => void
}

const ROUTE_TITLES: Record<string, string> = {
  '/': 'nav:dashboard',
  '/income': 'nav:income',
  '/expenses': 'nav:expenses',
  '/balance': 'nav:balance',
  '/debts': 'nav:debts',
  '/loans': 'nav:loans',
  '/savings': 'nav:savings',
  '/investments': 'nav:investments',
  '/history': 'nav:history',
  '/settings': 'nav:settings',
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useTranslation(['nav'])
  const location = useLocation()
  const titleKey = ROUTE_TITLES[location.pathname] ?? 'nav:dashboard'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 h-16 bg-canvas/80 backdrop-blur border-b border-line">
      <div className="flex items-center gap-3">
        <IconButton
          icon="menu"
          aria-label="Open menu"
          onClick={onMenuClick}
          className="lg:hidden"
        />
        <h1 className="text-lg font-semibold text-ink hidden sm:block">{t(titleKey)}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <CurrencySwitch />
        </div>
        <div className="hidden md:block w-32">
          <LocaleSwitch />
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}