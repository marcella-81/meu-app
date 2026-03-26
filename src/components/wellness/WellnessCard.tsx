// src/components/wellness/WellnessCard.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface WellnessHabit {
  id: string
  area: string
  title: string
  category: string
}

interface WellnessLog {
  id: string
  habit_id: string
  completed: boolean
}

interface Props {
  area: string
  habits: WellnessHabit[]
  todayLogs: WellnessLog[]
  userId: string
  onLogUpdate?: () => void
}

const areaInfo: Record<string, { label: string; icon: string; color: string }> = {
  physical: { label: 'Físico', icon: '💪', color: '#EF4444' },
  mental: { label: 'Mental', icon: '🧠', color: '#8B5CF6' },
  diet: { label: 'Dieta', icon: '🥗', color: '#10B981' },
  hobby: { label: 'Hobby', icon: '🎨', color: '#F59E0B' },
}

export function WellnessCard({ area, habits, todayLogs, userId, onLogUpdate }: Props) {
  const [logs, setLogs] = useState(todayLogs)
  const supabase = createClient()
  const info = areaInfo[area] || areaInfo.physical

  const completedCount = logs.filter(l => l.completed).length
  const totalCount = habits.length
  const score = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  async function toggleHabit(habitId: string) {
    const existingLog = logs.find(l => l.habit_id === habitId)
    const today = new Date().toISOString().split('T')[0]

    if (existingLog) {
      const newCompleted = !existingLog.completed
      await supabase
        .from('wellness_logs')
        .update({ completed: newCompleted })
        .eq('id', existingLog.id)
      
      setLogs(logs.map(l => 
        l.id === existingLog.id ? { ...l, completed: newCompleted } : l
      ))
    } else {
      const { data } = await supabase
        .from('wellness_logs')
        .insert({
          user_id: userId,
          habit_id: habitId,
          log_date: today,
          completed: true,
          actual_value: 1
        })
        .select()
        .single()
      
      if (data) setLogs([...logs, data])
    }
    
    onLogUpdate?.()
  }

  return (
    <div 
      className="rounded-2xl p-6 border transition-all hover:shadow-md"
      style={{ 
        background: 'var(--surface)', 
        borderColor: `${info.color}30`,
        borderLeft: `4px solid ${info.color}`
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{info.icon}</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
              {info.label}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text3)' }}>
              {completedCount}/{totalCount} concluídos
            </p>
          </div>
        </div>
        
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="var(--border)" strokeWidth="4" fill="none" />
            <circle
              cx="32" cy="32" r="28"
              stroke={score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'}
              strokeWidth="4" fill="none"
              strokeDasharray={`${(score / 100) * 175} 175`}
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: 'var(--text)' }}>
            {score}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {habits.map(habit => {
          const isCompleted = logs.some(l => l.habit_id === habit.id && l.completed)
          return (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              } border`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {isCompleted && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`flex-1 ${isCompleted ? 'text-green-900 line-through' : 'text-gray-700'}`}>
                {habit.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}