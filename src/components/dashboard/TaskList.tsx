'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Task {
  id: string
  title: string
  priority: string
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

export function TaskList({ tasks, userId }: { tasks: Task[], userId: string }) {
  const [done, setDone] = useState<Set<string>>(new Set())
  const [newTask, setNewTask] = useState('')
  const [list, setList] = useState(tasks)
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
      .insert({ title: newTask.trim(), user_id: userId, priority: 'medium' })
      .select()
      .single()

    if (data) setList(prev => [data, ...prev])
    setNewTask('')
  }

  return (
    <div className="flex flex-col gap-2">
      {list.map(task => (
        <button
          key={task.id}
          onClick={() => complete(task.id)}
          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
            done.has(task.id)
              ? 'border-green-200 bg-green-50 opacity-60'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            done.has(task.id) ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {done.has(task.id) && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className={`text-sm flex-1 ${done.has(task.id) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority] ?? 'bg-gray-100 text-gray-500'}`}>
            {priorityLabels[task.priority] ?? task.priority}
          </span>
        </button>
      ))}

      {list.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">
          Nenhuma pendência
        </p>
      )}

      <form onSubmit={addTask} className="flex gap-2 mt-2">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Adicionar tarefa..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          className="px-3 py-2 text-white rounded-lg text-sm transition-all"
          style={{ background: 'var(--hero)' }}>
          Adicionar
        </button>
      </form>
    </div>
  )
}