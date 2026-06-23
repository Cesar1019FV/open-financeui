import { cn } from '@/shared/lib/cn'

interface SkeletonProps {
  w?: string
  h?: string
  rounded?: string
  className?: string
}

export function Skeleton({ w = 'w-full', h = 'h-4', rounded = 'rounded-md', className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-surface-2', w, h, rounded, className)} />
}