import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <p className="text-6xl font-semibold text-violet-600 mb-4">404</p>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Página não encontrada
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Essa página não existe ou foi movida.
        </p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-all"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  )
}