'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Habit {
  id: string
  title: string
  category: string
  frequency: string
  is_active: boolean
}

const categoryOptions = [
  { value: 'health', label: 'Saúde' },
  { value: 'study', label: 'Estudo' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'work', label: 'Trabalho' },
  { value: 'wellness', label: 'Wellness' },
]

const categoryColors: Record<string, string> = {
  health:   'bg-green-100 text-green-700',
  study:    'bg-purple-100 text-purple-700',
  personal: 'bg-amber-100 text-amber-700',
  work:     'bg-blue-100 text-blue-700',
  wellness: 'bg-pink-100 text-pink-700',
}

export function HabitManager({ habits, userId }: { habits: Habit[], userId: string }) {
  const [list, setList] = useState(habits)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('health')
  const [frequency, setFrequency] = useState('daily')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function addHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)

    const { data } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        title: title.trim(),
        category,
        frequency,
        is_active: true,
      })
      .select()
      .single()

    if (data) setList(prev => [...prev, data])
    setTitle('')
    setShowForm(false)
    setLoading(false)
  }

  async function toggleActive(habitId: string, current: boolean) {
    await supabase
      .from('habits')
      .update({ is_active: !current })
      .eq('id', habitId)

    setList(prev => prev.map(h =>
      h.id === habitId ? { ...h, is_active: !current } : h
    ))
  }

  async function deleteHabit(habitId: string) {
    await supabase.from('habits').delete().eq('id', habitId)
    setList(prev => prev.filter(h => h.id !== habitId))
  }

  const active = list.filter(h => h.is_active)
  const inactive = list.filter(h => !h.is_active)

  return (
    <div className="flex flex-col gap-3">

      {active.map(habit => (
        <div
          key={habit.id}
          className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl"
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{habit.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[habit.category] ?? 'bg-gray-100 text-gray-600'}`}>
                {categoryOptions.find(c => c.value === habit.category)?.label ?? habit.category}
              </span>
              <span className="text-xs text-gray-400">
                {habit.frequency === 'daily' ? 'Diário' : 'Semanal'}
              </span>
            </div>
          </div>
          <button
            onClick={() => toggleActive(habit.id, habit.is_active)}
            className="text-xs text-gray-400 hover:text-amber-500 transition-all"
          >
            Pausar
          </button>
          <button
            onClick={() => deleteHabit(habit.id)}
            className="text-gray-300 hover:text-red-400 transition-all text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}

      {inactive.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-xs text-gray-400">Pausados</p>
          {inactive.map(habit => (
            <div
              key={habit.id}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl opacity-60"
            >
              <p className="text-sm text-gray-500 flex-1 line-through">{habit.title}</p>
              <button
                onClick={() => toggleActive(habit.id, habit.is_active)}
                className="text-xs text-violet-500 hover:text-violet-700 transition-all"
              >
                Reativar
              </button>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="text-gray-300 hover:text-red-400 transition-all text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-all"
      >
        + Novo hábito
      </button>

      {showForm && (
        <form onSubmit={addHabit} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome do hábito"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
            required
          />

          <div className="flex gap-2">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar hábito'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

    </div>
  )
}