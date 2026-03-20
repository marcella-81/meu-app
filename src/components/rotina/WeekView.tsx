'use client'
import { useState } from 'react'

interface Block {
  id: string
  title: string
  category: string
  start_time: string
  end_time: string
  weekdays: number[]
}

const weekdays = [
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 0 },
]

const categoryColors: Record<string, string> = {
  work:     'bg-blue-100 border-blue-200 text-blue-700',
  study:    'bg-purple-100 border-purple-200 text-purple-700',
  health:   'bg-green-100 border-green-200 text-green-700',
  personal: 'bg-amber-100 border-amber-200 text-amber-700',
  rest:     'bg-gray-100 border-gray-200 text-gray-600',
}

export function WeekView({ blocks }: { blocks: Block[] }) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())

  const dayBlocks = blocks
    .filter(b => b.weekdays.includes(selectedDay))
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <div className="flex flex-col gap-4">

      <div className="flex gap-2">
        {weekdays.map(day => (
          <button
            key={day.value}
            onClick={() => setSelectedDay(day.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDay === day.value
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {dayBlocks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Nenhum bloco para esse dia
          </div>
        ) : (
          dayBlocks.map(block => (
            <div
              key={block.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${categoryColors[block.category] ?? 'bg-gray-100 border-gray-200 text-gray-600'}`}
            >
              <div className="text-xs font-medium w-24 flex-shrink-0">
                {block.start_time.slice(0, 5)} — {block.end_time.slice(0, 5)}
              </div>
              <p className="text-sm font-medium flex-1">{block.title}</p>
            </div>
          ))
        )}
      </div>

    </div>
  )
}