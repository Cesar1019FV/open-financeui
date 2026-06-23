import { startTransition } from 'react'

import { SegmentedControl } from '@/shared/ui/SegmentedControl'
import { useCurrency } from '@/app/providers/useCurrency'
import type { CurrencyCode } from '@/shared/lib/format'

export function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency()

  const options = [
    { value: 'USD', label: 'USD' },
    { value: 'CRC', label: 'CRC' },
  ]

  return (
    <SegmentedControl
      options={options}
      value={currency}
      onChange={(v) => startTransition(() => setCurrency(v as CurrencyCode))}
      size="sm"
    />
  )
}