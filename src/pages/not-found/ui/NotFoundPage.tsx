import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { EmptyState } from '@/shared/ui/EmptyState'
import { Button } from '@/shared/ui/Button'

export function NotFoundPage() {
  const { t } = useTranslation(['common'])
  const navigate = useNavigate()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon={<span className="text-4xl">404</span>}
        title={t('misc.none')}
        description={t('misc.noResults')}
        action={<Button onClick={() => navigate('/')}>{t('nav:dashboard')}</Button>}
      />
    </div>
  )
}