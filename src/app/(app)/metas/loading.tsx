import { Skeleton } from '@/components/ui/Skeleton'

export default function MetasLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}