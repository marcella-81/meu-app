interface Props {
  score: number | null
  total: number
}

export function WellnessScore({ score, total }: Props) {
  if (total === 0) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center">
        <p className="text-sm text-gray-400">Registre suas categorias para ver seu score do dia</p>
      </div>
    )
  }

  const color = score && score >= 70
    ? 'text-green-600'
    : score && score >= 40
    ? 'text-amber-600'
    : 'text-red-500'

  const label = score && score >= 70
    ? 'Ótimo dia!'
    : score && score >= 40
    ? 'Dia razoável'
    : 'Dia difícil'

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4">
      <div className={`text-4xl font-semibold ${color}`}>
        {score}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{total}/4 categorias registradas</p>
      </div>
      <div className="flex-1">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score && score >= 70 ? 'bg-green-500' : score && score >= 40 ? 'bg-amber-400' : 'bg-red-400'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  )
}