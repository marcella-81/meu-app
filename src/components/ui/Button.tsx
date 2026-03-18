'use client'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading,
  children,
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700',
    secondary: 'border border-violet-600 text-violet-600 hover:bg-violet-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  }
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50',
        variants[variant],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  )
}