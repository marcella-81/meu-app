'use client'

interface Block {
  id: string
  title: string
  category: string
  start_time: string
  end_time: string
  is_current: boolean
  is_past: boolean
}

const categoryColors: Record<string, string> = {
  work:     'bg-blue-100 text-blue-700',
  study:    'bg-purple-100 text-purple-700',
  health:   'bg-green-100 text-green-700',
  personal: 'bg-amber-100 text-amber-700',
  rest:     'bg-gray-100 text-gray-600',
}

const categoryLabels: Record<string, string> = {
  work:     'Trabalho',
  study:    'Estudo',
  health:   'Saúde',
  personal: 'Pessoal',
  rest:     'Descanso',
}

export function TimeBlockList({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-4 text-center">
        Nenhum bloco para hoje
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {blocks.map(block => (
        <div
          key={block.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
            block.is_current
              ? 'border-violet-300 bg-violet-50'
              : block.is_past
              ? 'border-gray-100 bg-gray-50 opacity-50'
              : 'border-gray-100 bg-white'
          }`}
        >
          <div className="text-xs text-gray-400 w-20 flex-shrink-0">
            {block.start_time.slice(0, 5)} — {block.end_time.slice(0, 5)}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${block.is_past ? 'text-gray-400' : 'text-gray-800'}`}>
              {block.title}
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[block.category] ?? 'bg-gray-100 text-gray-600'}`}>
            {categoryLabels[block.category] ?? block.category}
          </span>
        </div>
      ))}
    </div>
  )
}