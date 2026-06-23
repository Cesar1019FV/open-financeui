import { startTransition } from 'react'

import { Select } from '@/shared/ui/Select'
import { useLocale } from '@/app/providers/useLocale'

export function LocaleSwitch() {
  const { locale, setLocale } = useLocale()

  const options = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ]

  return (
    <Select
      aria-label="Language"
      options={options}
      value={locale}
      onChange={(e) => startTransition(() => setLocale(e.target.value as 'es' | 'en'))}
    />
  )
}