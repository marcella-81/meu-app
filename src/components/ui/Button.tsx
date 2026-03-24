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
    primary: 'rgba(61,92,58,0.2)',
    secondary: 'bg-green-500 text-white hover:bg-green-600',
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