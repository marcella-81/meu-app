import { Skeleton } from '@/components/ui/Skeleton'

export default function WellnessLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-48 mb-8" />
      <Skeleton className="h-20 w-full mb-6" />
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  )
}