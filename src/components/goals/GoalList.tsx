'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Goal {
  id: string
  title: string
  description: string | null
  category: string
  target_date: string | null
  progress: number
  completed: boolean
}

const categoryColors: Record<string, string> = {
  carreira:       'bg-blue-100 text-blue-700',
  estudos:        'bg-purple-100 text-purple-700',
  saude:          'bg-green-100 text-green-700',
  financas:       'bg-amber-100 text-amber-700',
  relacionamentos:'bg-pink-100 text-pink-700',
  criatividade:   'bg-orange-100 text-orange-700',
}

export function GoalList({ goals, userId }: { goals: Goal[], userId: string }) {
  const [list, setList] = useState(goals)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('carreira')
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function addGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)

    const { data } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        category,
        target_date: targetDate || null,
        progress: 0,
      })
      .select()
      .single()

    if (data) setList(prev => [data, ...prev])
    setTitle('')
    setDescription('')
    setTargetDate('')
    setShowForm(false)
    setLoading(false)
  }

  async function updateProgress(goalId: string, progress: number) {
    await supabase
      .from('goals')
      .update({ progress, completed: progress === 100 })
      .eq('id', goalId)

    setList(prev => prev.map(g =>
      g.id === goalId ? { ...g, progress, completed: progress === 100 } : g
    ))
  }

  async function deleteGoal(goalId: string) {
    await supabase.from('goals').delete().eq('id', goalId)
    setList(prev => prev.filter(g => g.id !== goalId))
  }

  return (
    <div className="flex flex-col gap-4">

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-all"
      >
        + Nova meta
      </button>

      {showForm && (
        <form onSubmit={addGoal} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Qual é sua meta?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
            required
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500 resize-none"
          />
          <div className="flex gap-2">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
            >
              <option value="carreira">Carreira</option>
              <option value="estudos">Estudos</option>
              <option value="saude">Saúde</option>
              <option value="financas">Finanças</option>
              <option value="relacionamentos">Relacionamentos</option>
              <option value="criatividade">Criatividade</option>
            </select>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar meta'}
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

      {list.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Nenhuma meta ainda. Que tal criar a primeira?
        </div>
      )}

      {list.map(goal => (
        <div
          key={goal.id}
          className={`bg-white border rounded-xl p-4 transition-all ${
            goal.completed ? 'border-green-200 opacity-75' : 'border-gray-100'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[goal.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {goal.category}
                </span>
                {goal.target_date && (
                  <span className="text-xs text-gray-400">
                    até {new Date(goal.target_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                {goal.completed && (
                  <span className="text-xs text-green-600 font-medium">Concluída!</span>
                )}
              </div>
              <p className={`text-sm font-medium ${goal.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {goal.title}
              </p>
              {goal.description && (
                <p className="text-xs text-gray-400 mt-0.5">{goal.description}</p>
              )}
            </div>
            <button
              onClick={() => deleteGoal(goal.id)}
              className="text-gray-300 hover:text-red-400 transition-all text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  goal.completed ? 'bg-green-500' : 'bg-violet-500'
                }`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{goal.progress}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={goal.progress}
            onChange={e => updateProgress(goal.id, Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      ))}
    </div>
  )
}