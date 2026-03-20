'use client'

interface Log {
  log_date: string
  category: string
  value: number
}

interface Props {
  weekLogs: Log[]
}

const categoryColors: Record<string, string> = {
  physical: '#10b981',
  mental:   '#8b5cf6',
  diet:     '#f59e0b',
  hobby:    '#3b82f6',
}

const categoryLabels: Record<string, string> = {
  physical: 'Físico',
  mental:   'Mental',
  diet:     'Dieta',
  hobby:    'Hobby',
}

export function WellnessChart({ weekLogs }: Props) {
  if (weekLogs.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-center">
        <p className="text-sm text-gray-400">Registre por alguns dias para ver sua evolução</p>
      </div>
    )
  }

  const dates = [...new Set(weekLogs.map(l => l.log_date))].sort()
  const categories = ['physical', 'mental', 'diet', 'hobby']

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-sm font-medium text-gray-700 mb-4">Evolução da semana</p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {categories.map(cat => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: categoryColors[cat] }} />
            <span className="text-xs text-gray-500">{categoryLabels[cat]}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-1 items-end h-32">
        {dates.map(date => {
          const dayLogs = weekLogs.filter(l => l.log_date === date)
          const avg = dayLogs.length > 0
            ? dayLogs.reduce((sum, l) => sum + l.value, 0) / dayLogs.length
            : 0
          const height = Math.round((avg / 5) * 100)
          const dayName = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })

          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: 100 }}>
                <div
                  className="w-full bg-violet-200 rounded-t transition-all duration-500"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{dayName}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}