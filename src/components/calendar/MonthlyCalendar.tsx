'use client'

import { useState } from 'react'

interface Task {
  id: string
  title: string
  priority: string
  completed: boolean
  scheduled_day?: number | null
  scheduled_hour?: number | null
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  pendencia: { bg: '#FFE0E0', text: '#8B4747', border: '#FFB3B3' },
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function MonthlyCalendar({
  tasks,
}: {
  tasks: Task[]
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1)
    const days: Date[] = []
    const firstDay = date.getDay()
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push(prevDate)
    }
    while (date.getMonth() === month) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    const lastDay = days[days.length - 1].getDay()
    for (let i = 1; i < 7 - lastDay; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push(nextDate)
    }
    return days
  }

  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())

  // Filtrar APENAS pendências agendadas (ignora time blocks)
  const getTasksForDay = (day: Date) => {
    const dayOfWeek = day.getDay()
    return tasks.filter(task => {
      if (!task.completed && task.scheduled_day === dayOfWeek) {
        return day.getMonth() === currentMonth.getMonth() && 
               day.getFullYear() === currentMonth.getFullYear()
      }
      return false
    })
  }

  const isToday = (day: Date) => {
    const today = new Date()
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear()
  }

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentMonth.getMonth() &&
           day.getFullYear() === currentMonth.getFullYear()
  }

  function previousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  function goToToday() {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold capitalize" style={{ color: 'var(--hero)' }}>
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>
            Suas pendências do mês
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={previousMonth}
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
            onClick={nextMonth}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            Próximo →
          </button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {/* Header - Dias da semana */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)' }}>
          {weekDays.map(day => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text3)', background: 'var(--bg)' }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês - APENAS PENDÊNCIAS */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day)
            const today = isToday(day)
            const currentMonthDay = isCurrentMonth(day)
            const isSelected = selectedDate && 
                               day.getDate() === selectedDate.getDate() &&
                               day.getMonth() === selectedDate.getMonth() &&
                               day.getFullYear() === selectedDate.getFullYear()

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[100px] p-2 border-b border-r text-left transition-all ${
                  isSelected ? 'ring-2 ring-inset' : ''
                }`}
                style={{
                  borderColor: 'var(--border)',
                  background: today ? 'var(--hero)' : currentMonthDay ? 'var(--surface)' : 'var(--bg)',
                  color: today ? 'white' : currentMonthDay ? 'var(--text)' : 'var(--text3)',
                }}
              >
                {/* Número do dia */}
                <div className={`text-sm font-semibold mb-1 ${today ? 'text-white' : ''}`}>
                  {day.getDate()}
                </div>

                {/* Contador de pendências */}
                {dayTasks.length > 0 && (
                  <div className="mb-1">
                    <div
                      className="text-xs px-1.5 py-0.5 rounded-full inline-block"
                      style={{
                        background: today ? 'rgba(255,255,255,0.2)' : categoryColors.pendencia.bg,
                        color: today ? 'white' : categoryColors.pendencia.text,
                      }}
                    >
                      {dayTasks.length} tarefa{dayTasks.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {/* Preview das pendências (máximo 3) */}
                <div className="space-y-0.5 mt-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate border"
                      style={{
                        background: today ? 'rgba(255,255,255,0.3)' : categoryColors.pendencia.bg,
                        borderColor: categoryColors.pendencia.border,
                        color: today ? 'white' : categoryColors.pendencia.text,
                      }}
                    >
                      {task.scheduled_hour ? `${task.scheduled_hour}:00 ` : ''}{task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] px-1.5 py-0.5" style={{ color: 'var(--text3)' }}>
                      +{dayTasks.length - 3} mais
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal/Preview do dia selecionado - APENAS PENDÊNCIAS */}
      {selectedDate && (
        <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xl leading-none opacity-30 hover:opacity-60"
              style={{ color: 'var(--text)' }}
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            {getTasksForDay(selectedDate).length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--text3)' }}>
                Nenhuma pendência agendada para este dia
              </p>
            ) : (
              getTasksForDay(selectedDate)
                .sort((a, b) => (a.scheduled_hour || 99) - (b.scheduled_hour || 99))
                .map(task => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border-2"
                    style={{
                      background: categoryColors.pendencia.bg,
                      borderColor: categoryColors.pendencia.border,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold" style={{ color: categoryColors.pendencia.text }}>
                          {task.title}
                        </p>
                        <p className="text-xs mt-1 opacity-75" style={{ color: categoryColors.pendencia.text }}>
                          {task.scheduled_hour ? `🕐 ${task.scheduled_hour}:00` : '📌 Sem horário definido'} • {task.priority}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2" style={{ background: categoryColors.pendencia.bg, borderColor: categoryColors.pendencia.border }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>Pendência</span>
        </div>
      </div>
    </div>
  )
}