import { Skeleton } from '@/components/ui/Skeleton'

export default function PerfilLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-12" />
      </div>
      <Skeleton className="h-4 w-16 mb-4" />
      <div className="flex flex-col gap-3 mb-8">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}