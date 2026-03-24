'use client'

import { useState } from 'react'  
import { calculateGoalProgress, formatDaysRemaining } from '@/lib/utils/goal-utils' 

interface Task {
  id: string
  title: string
  priority: string
  completed: boolean
  scheduled_day?: number | null
  scheduled_hour?: number | null
}

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  status?: string
  completed?: boolean
  start_date?: string
  created_at: string
  target_date: string
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  pendencia: { bg: '#FFE0E0', text: '#8B4747', border: '#FFB3B3' },
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function MonthlyCalendar({
  tasks,
  goals,
}: {
  tasks: Task[]
  goals: Goal[]
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

  const getGoalsForDay = (day: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return goals.filter(goal => {
      if (goal.status === 'completed' || goal.completed === true) return false
      
      const start = new Date(goal.start_date || goal.created_at)
      const end = new Date(goal.target_date)
      
      return day >= start && day <= end
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

                {/* Contador de metas ativas */}
                {getGoalsForDay(day).length > 0 && (
                  <div className="mb-1">
                    <div
                      className="text-xs px-1.5 py-0.5 rounded-full inline-block"
                      style={{
                        background: today ? 'rgba(255,255,255,0.2)' : '#E0E7FF',
                        color: today ? 'white' : '#4338CA',
                      }}
                    >
                      🎯 {getGoalsForDay(day).length} meta{getGoalsForDay(day).length > 1 ? 's' : ''}
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
                  {getGoalsForDay(day).slice(0, 2).map(goal => {
                    const goalCategory = categoryColors[goal.category] || categoryColors.personal
                    const progress = calculateGoalProgress(
                      goal.start_date || goal.created_at,
                      goal.target_date || new Date().toISOString(),
                      []
                    )
                    return (
                      <a
                        key={goal.id}
                        href="/metas"
                        className="text-[10px] px-1.5 py-0.5 rounded truncate block hover:opacity-80 transition-opacity"
                        style={{
                          background: `${goalCategory.bg}60`,
                          border: `1px solid ${goalCategory.border}`,
                          color: goalCategory.text,
                        }}
                      >
                        🎯 {goal.title} ({progress.progress}%)
                      </a>
                    )
                  })}

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

      {/* Metas Ativas do Dia */}
          {selectedDate && getGoalsForDay(selectedDate).length > 0 && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text2)' }}>
                🎯 Metas Ativas
              </h4>
              <div className="space-y-2">
                {getGoalsForDay(selectedDate).map(goal => {
                  // Cores da categoria da meta
                  const goalCategoryColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
                    personal: { bg: '#FCE7F3', text: '#EC4899', border: '#F9A8D4', icon: '👤' },
                    career: { bg: '#DBEAFE', text: '#3B82F6', border: '#93C5FD', icon: '💼' },
                    health: { bg: '#D1FAE5', text: '#10B981', border: '#6EE7B7', icon: '💚' },
                    study: { bg: '#EDE9FE', text: '#8B5CF6', border: '#C4B5FD', icon: '📚' },
                    finance: { bg: '#FEF3C7', text: '#F59E0B', border: '#FCD34D', icon: '💰' },
                    relationships: { bg: '#FEE2E2', text: '#EF4444', border: '#FCA5A5', icon: '❤️' },
                  }
                  const goalCategory = goalCategoryColors[goal.category] || goalCategoryColors.personal
                  
                  // Calcular progresso
                  const progress = calculateGoalProgress(
                    goal.start_date || goal.created_at,
                    goal.target_date || new Date().toISOString(),
                    []
                  )

                  return (
                    <a
                      key={goal.id}
                      href="/metas"
                      className="block p-3 rounded-xl border-2 transition-all hover:shadow-md hover:scale-[1.02]"
                      style={{
                        background: goalCategory.bg,
                        borderColor: goalCategory.border,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: goalCategory.text }}>
                            {goal.title}
                          </p>
                          <p className="text-xs mt-1 opacity-75" style={{ color: goalCategory.text }}>
                            📊 {progress.progress}% • {formatDaysRemaining(progress.remainingDays)}
                          </p>
                          {goal.description && (
                            <p className="text-xs mt-1 line-clamp-1 opacity-60" style={{ color: goalCategory.text }}>
                              {goal.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xl flex-shrink-0">{goalCategory.icon}</span>
                      </div>
                      {/* Mini barra de progresso */}
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${progress.progress}%`,
                            background: goalCategory.text 
                          }}
                        />
                      </div>
                    </a>
                  )
                })}
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