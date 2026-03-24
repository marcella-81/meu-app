'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Task {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  scheduled_day?: number | null
  scheduled_hour?: number | null
  created_at: string
}

const priorityColors = {
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🔴' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '🟡' },
  low: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: '⚪' },
}

const priorityLabels = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

const weekdaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const hours = Array.from({ length: 18 }, (_, i) => i + 6) // 06:00 às 23:00

// ✅ Modal de agendamento rápido
function ScheduleModal({ 
  task, 
  isOpen, 
  onClose, 
  onSchedule 
}: { 
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSchedule: (day: number, hour: number) => void
}) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay())
  const [selectedHour, setSelectedHour] = useState<number>(10)

  if (!isOpen || !task) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            Agendar: {task.title}
          </h3>
          <button 
            onClick={onClose}
            className="text-xl opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text)' }}
          >
            ×
          </button>
        </div>

        {/* Escolher dia */}
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>
            Escolha o dia:
          </p>
          <div className="grid grid-cols-7 gap-1">
            {weekdaysShort.map((day, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  selectedDay === i ? 'ring-2 ring-[var(--hero)]' : ''
                }`}
                style={{
                  background: selectedDay === i ? 'var(--hero)' : 'var(--bg)',
                  color: selectedDay === i ? 'white' : 'var(--text2)',
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Escolher hora */}
        <div className="mb-6">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>
            Escolha o horário:
          </p>
          <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto pr-1">
            {hours.map(hour => (
              <button
                key={hour}
                onClick={() => setSelectedHour(hour)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  selectedHour === hour ? 'ring-2 ring-[var(--hero)]' : ''
                }`}
                style={{
                  background: selectedHour === hour ? 'var(--hero)' : 'var(--bg)',
                  color: selectedHour === hour ? 'white' : 'var(--text2)',
                }}
              >
                {hour}:00
              </button>
            ))}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--bg)', color: 'var(--text2)', border: '1px solid var(--border)' }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSchedule(selectedDay, selectedHour)
              onClose()
            }}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'var(--hero)' }}
          >
            Agendar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PendenciasPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [showSchedule, setShowSchedule] = useState<string | null>(null)
  const [scheduleDay, setScheduleDay] = useState<number>(new Date().getDay())
  const [scheduleHour, setScheduleHour] = useState<number>(10)
  
  // ✅ Estados para o modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleModalTask, setScheduleModalTask] = useState<Task | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !isMounted) return

      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && isMounted) {
        setTasks(data)
      }
      if (isMounted) {
        setLoading(false)
      }
    }
    
    loadTasks()

    return () => {
      isMounted = false
    }
  }, [supabase])

  // Filtrar tarefas
  const today = new Date().getDay()
  const todayTasks = tasks.filter(t => t.scheduled_day === today && !t.completed)
  const upcomingTasks = tasks.filter(t => t.scheduled_day !== null && t.scheduled_day !== today && !t.completed)
  const unscheduledTasks = tasks.filter(t => t.scheduled_day === null && !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('tasks')
      .insert({
        title: newTask.trim(),
        priority: selectedPriority,
        completed: false,
        user_id: user.id,
        scheduled_day: showSchedule ? scheduleDay : null,
        scheduled_hour: showSchedule ? scheduleHour : null,
      })
      .select()
      .single()

    if (data) {
      setTasks(prev => [data, ...prev])
      setNewTask('')
      setShowSchedule(null)
    }
  }

  async function toggleTask(taskId: string) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const { data } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', taskId)
      .select()
      .single()

    if (data) {
      setTasks(prev => prev.map(t => t.id === taskId ? data : t))
    }
  }

  async function deleteTask(taskId: string) {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  async function unscheduleTask(taskId: string) {
    const { data } = await supabase
      .from('tasks')
      .update({
        scheduled_day: null,
        scheduled_hour: null,
      })
      .eq('id', taskId)
      .select()
      .single()

    if (data) {
      setTasks(prev => prev.map(t => t.id === taskId ? data : t))
    }
  }

  // ✅ Função para agendar via modal
  async function scheduleTaskViaModal(taskId: string, day: number, hour: number) {
    const { data } = await supabase
      .from('tasks')
      .update({
        scheduled_day: day,
        scheduled_hour: hour,
      })
      .eq('id', taskId)
      .select()
      .single()

    if (data) {
      setTasks(prev => prev.map(t => t.id === taskId ? data : t))
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
          Pendências
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
          Gerencie suas tarefas e pendências
        </p>
      </div>

      {/* Dica de uso */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text2)' }}>
          💡 <strong>Dica:</strong> Clique em &quot;Agendar&quot; para escolher dia e horário no calendário
        </p>
      </div>

      {/* Adicionar nova tarefa */}
      <form onSubmit={addTask} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Adicionar nova tarefa..."
            className="flex-1 px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--hero)]"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as 'high' | 'medium' | 'low')}
            className="px-4 py-3 rounded-xl border outline-none"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="high">🔴 Alta</option>
            <option value="medium">🟡 Média</option>
            <option value="low">⚪ Baixa</option>
          </select>
          <button
            type="button"
            onClick={() => setShowSchedule(showSchedule ? null : 'new')}
            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              showSchedule === 'new' ? 'ring-2 ring-[var(--hero)]' : ''
            }`}
            style={{ 
              background: showSchedule === 'new' ? 'var(--hero)' : 'var(--surface)',
              color: showSchedule === 'new' ? 'white' : 'var(--text2)',
              borderColor: 'var(--border)'
            }}
          >
            📅 Agendar
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl text-white font-medium"
            style={{ background: 'var(--hero)' }}
          >
            Adicionar
          </button>
        </div>

        {/* Opções de agendamento (expansível) */}
        {showSchedule === 'new' && (
          <div className="mt-3 p-4 rounded-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>Agendar para:</p>
            <div className="flex gap-3">
              <select
                value={scheduleDay}
                onChange={(e) => setScheduleDay(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                {weekdaysShort.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
              <select
                value={scheduleHour}
                onChange={(e) => setScheduleHour(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border text-sm outline-none w-24"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                {hours.map(hour => (
                  <option key={hour} value={hour}>{hour.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </form>

      {loading ? (
        <p className="text-center py-8" style={{ color: 'var(--text3)' }}>Carregando...</p>
      ) : (
        <>
          {/* Tarefas de Hoje */}
          {todayTasks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Para Hoje
              </h2>
              <div className="space-y-2">
                {todayTasks.map(task => {
                  const colors = priorityColors[task.priority]
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border ${colors.bg} ${colors.border}`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
                        style={{ borderColor: 'var(--hero)', background: 'white' }}
                      >
                        ✓
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${colors.text}`}>{task.title}</p>
                        <p className="text-xs mt-0.5 opacity-75">
                          {task.scheduled_hour?.toString().padStart(2, '0')}:00 • {priorityLabels[task.priority]}
                        </p>
                      </div>
                      <button
                        onClick={() => unscheduleTask(task.id)}
                        className="text-xs px-2 py-1 rounded hover:bg-white/50 flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tarefas Próximas */}
          {upcomingTasks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Próximos Dias
              </h2>
              <div className="space-y-2">
                {upcomingTasks.map(task => {
                  const colors = priorityColors[task.priority]
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border ${colors.bg} ${colors.border}`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{ borderColor: 'var(--hero)', background: 'white' }}
                      >
                        ✓
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${colors.text}`}>{task.title}</p>
                        <p className="text-xs mt-0.5 opacity-75">
                          {weekdaysShort[task.scheduled_day!]} às {task.scheduled_hour?.toString().padStart(2, '0')}:00
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tarefas Sem Agendamento */}
          {unscheduledTasks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                Sem Agendamento
              </h2>
              <div className="space-y-2">
                {unscheduledTasks.map(task => {
                  const colors = priorityColors[task.priority]
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border ${colors.bg} ${colors.border}`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{ borderColor: 'var(--hero)', background: 'white' }}
                      >
                        ✓
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${colors.text}`}>{task.title}</p>
                        <p className="text-xs mt-0.5 opacity-75">{priorityLabels[task.priority]}</p>
                      </div>
                      <button
                        onClick={() => {
                          setScheduleModalTask(task)
                          setScheduleModalOpen(true)
                        }}
                        className="text-sm px-3 py-1.5 rounded-lg hover:bg-white/50 transition-all flex-shrink-0"
                        style={{ color: 'var(--hero)' }}
                        title="Agendar no calendário"
                      >
                        📅 Agendar
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tarefas Concluídas */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text3)' }}>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Concluídas
              </h2>
              <div className="space-y-2 opacity-50">
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center bg-green-500 border-green-500 text-white"
                    >
                      ✓
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-through text-gray-500 truncate">{task.title}</p>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-sm text-red-500 hover:underline flex-shrink-0"
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ✅ Modal de agendamento */}
      <ScheduleModal
        task={scheduleModalTask}
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false)
          setScheduleModalTask(null)
        }}
        onSchedule={(day, hour) => {
          if (scheduleModalTask) {
            scheduleTaskViaModal(scheduleModalTask.id, day, hour)
          }
        }}
      />
    </div>
  )
}