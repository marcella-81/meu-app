'use client'
import { useState } from 'react'

interface Category {
  key: string
  label: string
  description: string
  emoji: string
}

interface Props {
  category: Category
  currentValue: number | null
  onSave: (value: number, note?: string) => void
}

export function WellnessCard({ category, currentValue, onSave }: Props) {
  const [selected, setSelected] = useState<number | null>(currentValue)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')

  function handleSelect(value: number) {
    setSelected(value)
    onSave(value, note)
    if (value <= 2) setShowNote(true)
  }

  const colors = [
    'bg-red-100 border-red-300 text-red-600',
    'bg-orange-100 border-orange-300 text-orange-600',
    'bg-amber-100 border-amber-300 text-amber-600',
    'bg-lime-100 border-lime-300 text-lime-600',
    'bg-green-100 border-green-300 text-green-600',
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 20 }}>{category.emoji}</span>
        <div>
          <p className="text-sm font-medium text-gray-800">{category.label}</p>
          <p className="text-xs text-gray-400">{category.description}</p>
        </div>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(value => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={`flex-1 h-8 rounded border text-xs font-medium transition-all ${
              selected === value
                ? colors[value - 1]
                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {showNote && (
        <input
          type="text"
          placeholder="O que aconteceu? (opcional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          onBlur={() => selected && onSave(selected, note)}
          className="mt-2 w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-violet-400"
        />
      )}
    </div>
  )
}
