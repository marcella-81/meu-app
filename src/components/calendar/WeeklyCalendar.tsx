'use client'

import { useState } from 'react'

interface TimeBlock {
  id: string
  title: string
  category: string
  start_time: string
  end_time: string
  weekdays: number[]
}

interface Task {
  id: string
  title: string
  priority: string
  completed: boolean
  scheduled_day?: number | null
  scheduled_hour?: number | null
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  work: { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
  study: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  health: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  personal: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  rest: { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' },
  pendencia: { bg: '#FFE0E0', text: '#8B4747', border: '#FFB3B3' },
}

const weekdays = [
  { label: 'Segunda', value: 1 },
  { label: 'Terça', value: 2 },
  { label: 'Quarta', value: 3 },
  { label: 'Quinta', value: 4 },
  { label: 'Sexta', value: 5 },
  { label: 'Sábado', value: 6 },
  { label: 'Domingo', value: 0 },
]

const hours = Array.from({ length: 18 }, (_, i) => i + 6) // 06:00 às 23:00

export function WeeklyCalendar({
  timeBlocks,
  tasks,
}: {
  timeBlocks: TimeBlock[]
  tasks: Task[]
}) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())

  const getWeekDays = () => {
    const curr = new Date(currentWeek)
    const week = []
    const first = curr.getDate() - curr.getDay() + 1
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr)
      day.setDate(first + i)
      week.push(day)
    }
    return week
  }

  const weekDays = getWeekDays()

  const getBlocksForSlot = (dayValue: number, hour: number) => {
    return timeBlocks.filter((block) => {
      const blockHour = parseInt(block.start_time.split(':')[0])
      return block.weekdays.includes(dayValue) && blockHour === hour
    })
  }

  const getScheduledTasksForSlot = (dayValue: number, hour: number) => {
    return tasks.filter(task => 
      !task.completed && 
      task.scheduled_day === dayValue && 
      task.scheduled_hour === hour
    )
  }

  function previousWeek() {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() - 7)))
  }

  function nextWeek() {
    setCurrentWeek(new Date(currentWeek.setDate(currentWeek.getDate() + 7)))
  }

  function goToToday() {
    setCurrentWeek(new Date())
    setSelectedDay(new Date().getDay())
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--hero)' }}>
            {weekDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>
            Visão semanal da sua rotina
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={previousWeek}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            ← Anterior
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all text-white"
            style={{ background: 'var(--hero)' }}
          >
            Hoje
          </button>
          <button
            onClick={nextWeek}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            Próxima →
          </button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {/* Header - Dias da semana */}
        <div className="grid grid-cols-8 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text3)' }}>
            Horário
          </div>
          {weekdays.map((day, i) => {
            const isSelected = selectedDay === day.value
            const isToday = new Date().getDay() === day.value
            return (
              <button
                key={day.value}
                onClick={() => setSelectedDay(day.value)}
                className={`p-4 text-center transition-all ${isSelected ? 'ring-2 ring-inset' : ''}`}
                style={isSelected ? { background: 'var(--hero)', color: 'white' } : { background: 'var(--bg)' }}
              >
                <div className="text-xs uppercase tracking-wider" style={isSelected ? { color: 'rgba(255,255,255,0.7)' } : { color: 'var(--text3)' }}>
                  {day.label}
                </div>
                <div className={`text-xl font-bold mt-1 ${isToday ? 'text-white' : ''}`} style={isSelected ? {} : { color: 'var(--text)' }}>
                  {weekDays[i].getDate()}
                </div>
              </button>
            )
          })}
        </div>

        {/* Time Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              {/* Coluna de horas */}
              <div className="p-3 text-xs font-medium" style={{ color: 'var(--text3)', background: 'var(--bg)' }}>
                {hour.toString().padStart(2, '0')}:00
              </div>

              {/* Colunas dos dias */}
              {weekdays.map((day) => {
                const blocks = getBlocksForSlot(day.value, hour)
                const scheduledTasks = getScheduledTasksForSlot(day.value, hour)

                return (
                  <div
                    key={`${day.value}-${hour}`}
                    className="p-2 min-h-[60px] border-l"
                    style={{
                      borderColor: 'var(--border)',
                      background: selectedDay === day.value ? 'var(--bg)' : 'var(--surface)',
                    }}
                  >
                    <div className="flex flex-col gap-1 min-h-[60px]">
                      {/* Pendências COM horário (DESTACADAS) */}
                      {scheduledTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-2 rounded-lg text-xs border-2 shadow-sm"
                          style={{
                            background: categoryColors.pendencia.bg,
                            borderColor: categoryColors.pendencia.border,
                            color: categoryColors.pendencia.text,
                          }}
                        >
                          <div className="font-semibold truncate">{task.title}</div>
                          <div className="opacity-75 text-[10px]">{task.scheduled_hour}:00 • Pendência</div>
                        </div>
                      ))}

                      {/* Time Blocks da Rotina (EM CINZA) */}
                      {blocks.map((block) => {
                        const colors = categoryColors[block.category] || categoryColors.rest
                        return (
                          <div
                            key={block.id}
                            className="p-2 rounded-lg text-xs border border-dashed transition-opacity"
                            style={{
                              background: colors.bg,
                              borderColor: colors.border,
                              color: colors.text,
                              opacity: 0.7,
                              filter: 'grayscale(20%)',
                            }}
                          >
                            <div className="font-semibold truncate opacity-80">{block.title}</div>
                            <div className="opacity-60 text-[10px]">
                              {block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2" style={{ background: categoryColors.pendencia.bg, borderColor: categoryColors.pendencia.border }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>Pendência</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-dashed opacity-50" style={{ background: categoryColors.rest.bg, borderColor: categoryColors.rest.border }} />
          <span className="text-xs" style={{ color: 'var(--text3)' }}>Rotina (Time Block)</span>
        </div>
      </div>
    </div>
  )
}