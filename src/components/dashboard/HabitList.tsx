'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Habit {
  id: string
  title: string
  category: string
}

interface HabitLog {
  habit_id: string
  completed: boolean
}

interface Props {
  habits: Habit[]
  logs: HabitLog[]
  userId: string
  todayStr: string
}

export function HabitList({ habits, logs, userId, todayStr }: Props) {
  const initialDone = new Set(
    logs.filter(l => l.completed).map(l => l.habit_id)
  )
  const [done, setDone] = useState<Set<string>>(initialDone)
  const supabase = createClient()

  async function toggle(habitId: string) {
    const isDone = done.has(habitId)
    const newDone = new Set(done)

    if (isDone) {
      newDone.delete(habitId)
      await supabase
        .from('habits_log')
        .update({ completed: false, completed_at: null })
        .eq('habit_id', habitId)
        .eq('log_date', todayStr)
    } else {
      newDone.add(habitId)
      await supabase
        .from('habits_log')
        .upsert({
          habit_id: habitId,
          user_id: userId,
          log_date: todayStr,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'habit_id,log_date' })
    }

    setDone(newDone)
  }

  if (habits.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-4 text-center">
        Nenhum hábito cadastrado
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {habits.map(habit => {
        const isDone = done.has(habit.id)
        return (
          <button
            key={habit.id}
            onClick={() => toggle(habit.id)}
            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
              isDone
                ? 'border-green-200 bg-green-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              isDone ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {isDone && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={`text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {habit.title}
            </span>
          </button>
        )
      })}
      <p className="text-xs text-gray-400 text-right mt-1">
        {done.size}/{habits.length} concluídos
      </p>
    </div>
  )
}