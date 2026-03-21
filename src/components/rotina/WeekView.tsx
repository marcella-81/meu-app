'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Block {
  id: string
  title: string
  category: string
  start_time: string
  end_time: string
  weekdays: number[]
}

interface Props {
  blocks: Block[]
  userId: string
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

const categories = [
  { value: 'work', label: 'Trabalho' },
  { value: 'study', label: 'Estudo' },
  { value: 'health', label: 'Saúde' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'rest', label: 'Descanso' },
]

export function WeekView({ blocks, userId }: Props) {
  const [list, setList] = useState(blocks)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('work')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5])

  const supabase = createClient()

  const dayBlocks = list
    .filter(b => b.weekdays.includes(selectedDay))
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  function toggleWeekday(day: number) {
    setSelectedWeekdays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  async function addBlock(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startTime || !endTime) return
    setLoading(true)

    const { data } = await supabase
      .from('time_blocks')
      .insert({
        user_id: userId,
        title: title.trim(),
        category,
        start_time: startTime,
        end_time: endTime,
        weekdays: selectedWeekdays,
        is_base_routine: true,
      })
      .select()
      .single()

    if (data) setList(prev => [...prev, data])
    setTitle('')
    setStartTime('')
    setEndTime('')
    setSelectedWeekdays([1, 2, 3, 4, 5])
    setShowForm(false)
    setLoading(false)
  }

  async function deleteBlock(blockId: string) {
    await supabase.from('time_blocks').delete().eq('id', blockId)
    setList(prev => prev.filter(b => b.id !== blockId))
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Seletor de dias */}
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

      {/* Lista de blocos */}
      <div className="flex flex-col gap-2">
        {dayBlocks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhum bloco para esse dia
          </div>
        ) : (
          dayBlocks.map(block => (
            <div
              key={block.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${categoryColors[block.category] ?? 'bg-gray-100 border-gray-200'}`}
            >
              <div className="text-xs font-medium w-24 flex-shrink-0">
                {block.start_time.slice(0, 5)} — {block.end_time.slice(0, 5)}
              </div>
              <p className="text-sm font-medium flex-1">{block.title}</p>
              <button
                onClick={() => deleteBlock(block.id)}
                className="text-current opacity-40 hover:opacity-80 transition-all text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Botão novo bloco */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-all"
      >
        + Novo bloco
      </button>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={addBlock} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">

          <input
            type="text"
            placeholder="Nome do bloco"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
            required
          />

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-500">Início</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-gray-500">Fim</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Dias da semana</label>
            <div className="flex gap-1">
              {weekdays.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleWeekday(day.value)}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                    selectedWeekdays.includes(day.value)
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar bloco'}
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