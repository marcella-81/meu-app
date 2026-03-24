'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-4">⚠️</p>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Algo deu errado
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  )
}