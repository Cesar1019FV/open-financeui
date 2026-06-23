import { useTranslation } from 'react-i18next'

import { SegmentedControl } from '@/shared/ui/SegmentedControl'
import { Icon } from '@/shared/ui/Icon'
import { useTheme } from '@/app/providers/useTheme'
import type { ThemeMode } from '@/shared/config'

export function ThemeToggle() {
  const { t } = useTranslation(['settings'])
  const { mode, setMode } = useTheme()

  const options = [
    { value: 'light', label: t('appearance.light') },
    { value: 'dark', label: t('appearance.dark') },
    { value: 'system', label: t('appearance.system') },
  ]

  return (
    <div className="flex items-center gap-2">
      <Icon name={mode === 'dark' ? 'moon' : mode === 'light' ? 'sun' : 'system'} size={16} className="text-ink-muted" />
      <SegmentedControl
        options={options}
        value={mode}
        onChange={(v) => setMode(v as ThemeMode)}
        size="sm"
      />
    </div>
  )
}