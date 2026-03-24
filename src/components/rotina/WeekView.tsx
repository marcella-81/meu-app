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
  { label: 'Segunda', short: 'Seg', value: 1 },
  { label: 'Terça', short: 'Ter', value: 2 },
  { label: 'Quarta', short: 'Qua', value: 3 },
  { label: 'Quinta', short: 'Qui', value: 4 },
  { label: 'Sexta', short: 'Sex', value: 5 },
  { label: 'Sábado', short: 'Sáb', value: 6 },
  { label: 'Domingo', short: 'Dom', value: 0 },
]

const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
  work:     { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
  study:    { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  health:   { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  personal: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  rest:     { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' },
}

const categoryLabels: Record<string, string> = {
  work: 'Trabalho', study: 'Estudo', health: 'Saúde', personal: 'Pessoal', rest: 'Descanso',
}

const categories = [
  { value: 'work', label: 'Trabalho' },
  { value: 'study', label: 'Estudo' },
  { value: 'health', label: 'Saúde' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'rest', label: 'Descanso' },
]

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins < 0) mins += 24 * 60
  return mins / 60
}

export function WeekView({ blocks, userId }: Props) {
  const [list, setList] = useState(blocks)
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [showForm, setShowForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
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

  const totalBlocks = dayBlocks.length
  const totalHours = dayBlocks.reduce((acc, b) => acc + calcHours(b.start_time, b.end_time), 0)

  function openNew() {
    setEditingBlock(null)
    setTitle('')
    setCategory('work')
    setStartTime('')
    setEndTime('')
    setSelectedWeekdays([1, 2, 3, 4, 5])
    setShowForm(true)
  }

  function openEdit(block: Block) {
    setEditingBlock(block)
    setTitle(block.title)
    setCategory(block.category)
    setStartTime(block.start_time.slice(0, 5))
    setEndTime(block.end_time.slice(0, 5))
    setSelectedWeekdays(block.weekdays)
    setShowForm(true)
  }

  function toggleWeekday(day: number) {
    setSelectedWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startTime || !endTime) return
    setLoading(true)

    if (editingBlock) {
      const { data } = await supabase
        .from('time_blocks')
        .update({ title: title.trim(), category, start_time: startTime, end_time: endTime, weekdays: selectedWeekdays })
        .eq('id', editingBlock.id)
        .select().single()
      if (data) setList(prev => prev.map(b => b.id === editingBlock.id ? data : b))
    } else {
      const { data } = await supabase
        .from('time_blocks')
        .insert({ user_id: userId, title: title.trim(), category, start_time: startTime, end_time: endTime, weekdays: selectedWeekdays, is_base_routine: true })
        .select().single()
      if (data) setList(prev => [...prev, data])
    }

    setShowForm(false)
    setEditingBlock(null)
    setLoading(false)
  }

  async function deleteBlock(blockId: string) {
    await supabase.from('time_blocks').delete().eq('id', blockId)
    setList(prev => prev.filter(b => b.id !== blockId))
  }

  return (
    <div className="flex gap-6">

      {/* Coluna esquerda */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--hero)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {weekdays.find(d => d.value === selectedDay)?.label}
          </p>
          <div>
            <p className="text-4xl font-bold text-white tracking-tight">{totalBlocks}</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>blocos planejados</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white tracking-tight">{Math.round(totalHours * 10) / 10}h</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>horas organizadas</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text3)' }}>
            Dia da semana
          </p>
          {weekdays.map(day => {
            const count = list.filter(b => b.weekdays.includes(day.value)).length
            return (
              <button
                key={day.value}
                onClick={() => setSelectedDay(day.value)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all text-left"
                style={selectedDay === day.value
                  ? { background: 'var(--hero)', color: 'white' }
                  : { color: 'var(--text2)' }
                }
              >
                <span>{day.label}</span>
                {count > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={selectedDay === day.value
                    ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                    : { background: 'var(--bg)', color: 'var(--text3)' }
                  }>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={openNew}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-all text-white"
          style={{ background: 'var(--accent)' }}
        >
          + Novo bloco
        </button>
      </div>

      {/* Coluna direita */}
      <div className="flex-1">
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {dayBlocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm" style={{ color: 'var(--text3)' }}>Nenhum bloco para esse dia</p>
              <button onClick={openNew} className="text-sm font-medium underline" style={{ color: 'var(--accent)' }}>
                Adicionar bloco
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {dayBlocks.map(block => {
                const colors = categoryColors[block.category] ?? categoryColors.rest
                return (
                  <div
                    key={block.id}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                  >
                    <div className="w-20 flex-shrink-0">
                      <p className="text-xs font-medium" style={{ color: colors.text }}>
                        {block.start_time.slice(0, 5)}
                      </p>
                      <p className="text-xs" style={{ color: colors.text, opacity: 0.6 }}>
                        {block.end_time.slice(0, 5)}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: colors.text }}>{block.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: colors.text, opacity: 0.6 }}>
                        {categoryLabels[block.category]} · {Math.round(calcHours(block.start_time, block.end_time) * 10) / 10}h
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(block)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{ background: 'rgba(0,0,0,0.06)', color: colors.text }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteBlock(block.id)}
                        className="text-lg leading-none transition-all opacity-30 hover:opacity-70"
                        style={{ color: colors.text }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="w-full max-w-md rounded-3xl p-6 shadow-xl" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                {editingBlock ? 'Editar bloco' : 'Novo bloco'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-xl leading-none opacity-30 hover:opacity-60" style={{ color: 'var(--text)' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nome do bloco"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                required
              />

              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <div className="flex gap-3">
                <div className="flex-1">
                  <p className="text-xs mb-1.5" style={{ color: 'var(--text3)' }}>Início</p>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    required
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs mb-1.5" style={{ color: 'var(--text3)' }}>Fim</p>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    required
                  />
                </div>
              </div>

              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>Dias da semana</p>
                <div className="flex gap-1.5">
                  {weekdays.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleWeekday(day.value)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                      style={selectedWeekdays.includes(day.value)
                        ? { background: 'var(--hero)', color: 'white' }
                        : { background: 'var(--bg)', color: 'var(--text3)', border: '1px solid var(--border)' }
                      }
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--bg)', color: 'var(--text2)', border: '1px solid var(--border)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: 'var(--hero)' }}
                >
                  {loading ? 'Salvando...' : editingBlock ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}