import { cn } from '@/lib/utils/cn'

export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 p-4', className)}>
      {children}
    </div>
  )
}
