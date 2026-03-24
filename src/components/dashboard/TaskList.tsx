'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Task {
  id: string
  title: string
  priority: string
  completed: boolean
  scheduled_day?: number | null // 0-6 (Domingo-Sábado)
  scheduled_hour?: number | null // 2-23
}

const priorityColors: Record<string, string> = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low:    'bg-gray-100 text-gray-500',
}

const priorityLabels: Record<string, string> = {
  high:   'Alta',
  medium: 'Média',
  low:    'Baixa',
}

const weekdays = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
]

const hours = Array.from({ length: 22 }, (_, i) => i + 2) // 02:00 às 23:00

export function TaskList({ tasks, userId }: { tasks: Task[], userId: string }) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [newTask, setNewTask] = useState('')
  const [list, setList] = useState(tasks)
  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay())
  const [selectedHour, setSelectedHour] = useState<number>(10)
  const supabase = createClient()

  async function complete(taskId: string) {
    setDone(prev => new Set([...prev, taskId]))

    setTimeout(async () => {
      await supabase.from('tasks').update({ completed: true }).eq('id', taskId)
      setList(prev => prev.filter(t => t.id !== taskId))
      setDone(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }, 600)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return

    const { data } = await supabase
      .from('tasks')
      .insert({ 
        title: newTask.trim(), 
        user_id: userId, 
        priority: 'medium',
        completed: false 
      })
      .select()
      .single()

    if (data) setList(prev => [data, ...prev])
    setNewTask('')
  }

  async function scheduleTask(taskId: string, day: number, hour: number) {
    const { data } = await supabase
      .from('tasks')
      .update({ 
        scheduled_day: day,
        scheduled_hour: hour 
      })
      .eq('id', taskId)
      .select()
      .single()

    if (data) {
      setList(prev => prev.map(t => t.id === taskId ? data : t))
    }
    setSchedulingTaskId(null)
  }

  async function unScheduleTask(taskId: string) {
    const { data } = await supabase
      .from('tasks')
      .update({ 
        scheduled_day: null,
        scheduled_hour: null 
      })
      .eq('id', taskId)
      .select()
      .single()

    if (data) {
      setList(prev => prev.map(t => t.id === taskId ? data : t))
    }
  }

  const unscheduledTasks = list.filter(t => !t.scheduled_day && !t.completed)
  const scheduledTasks = list.filter(t => t.scheduled_day !== null && !t.completed)

  return (
    <div className="flex flex-col gap-4">
      {/* Tasks Agendadas */}
      {scheduledTasks.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>
            Agendadas
          </p>
          <div className="flex flex-col gap-2">
            {scheduledTasks.map(task => (
              <button
                key={task.id}
                onClick={() => complete(task.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  done.has(task.id)
                    ? 'border-green-200 bg-green-50 opacity-60'
                    : 'border-[var(--accent)] bg-[#F0F7F0]'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  done.has(task.id) ? 'border-green-500 bg-green-500' : 'border-[var(--accent)]'
                }`}>
                  {done.has(task.id) && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-sm block ${done.has(task.id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text3)' }}>
                    {weekdays.find(d => d.value === task.scheduled_day)?.label} às {task.scheduled_hour}:00
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    unScheduleTask(task.id)
                  }}
                  className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-600"
                >
                  ×
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Não Agendadas */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>
          Pendências {unscheduledTasks.length > 0 && `(${unscheduledTasks.length})`}
        </p>
        <div className="flex flex-col gap-2">
          {unscheduledTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-all"
            >
              <button
                onClick={() => complete(task.id)}
                className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0 transition-all hover:border-green-500"
              >
                {done.has(task.id) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span className="text-sm flex-1 text-gray-800">
                {task.title}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority] ?? 'bg-gray-100 text-gray-500'}`}>
                {priorityLabels[task.priority] ?? task.priority}
              </span>
              
              {/* Botão de agendar */}
              {schedulingTaskId === task.id ? (
                <div className="flex gap-1">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="text-xs px-2 py-1 rounded border border-gray-200 outline-none"
                    style={{ background: 'var(--surface)', color: 'var(--text)' }}
                  >
                    {weekdays.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(Number(e.target.value))}
                    className="text-xs px-2 py-1 rounded border border-gray-200 outline-none w-16"
                    style={{ background: 'var(--surface)', color: 'var(--text)' }}
                  >
                    {hours.map(hour => (
                      <option key={hour} value={hour}>{hour}:00</option>
                    ))}
                  </select>
                  <button
                    onClick={() => scheduleTask(task.id, selectedDay, selectedHour)}
                    className="text-xs px-2 py-1 rounded text-white"
                    style={{ background: 'var(--hero)' }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setSchedulingTaskId(null)}
                    className="text-xs px-2 py-1 rounded hover:bg-gray-100"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSchedulingTaskId(task.id)}
                  className="text-xs px-2 py-1 rounded hover:bg-blue-50 text-blue-600"
                  title="Agendar"
                >
                  📅
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {list.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          Nenhuma pendência
        </p>
      )}

      {/* Formulário para adicionar nova tarefa */}
      <form onSubmit={addTask} className="flex gap-2 mt-2">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Adicionar tarefa..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[var(--accent)]"
          style={{ background: 'var(--surface)', color: 'var(--text)' }}
        />
        <button
          type="submit"
          className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--hero)' }}
        >
          Adicionar
        </button>
      </form>
    </div>
  )
}