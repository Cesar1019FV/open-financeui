import { Skeleton } from '@/shared/ui/Skeleton'

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton w="w-48" h="h-8" />
      <Skeleton h="h-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} h="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton h="h-64" className="lg:col-span-2" />
        <Skeleton h="h-64" />
      </div>
    </div>
  )
}