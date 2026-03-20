'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WellnessCard } from './WellnessCard'
import { WellnessChart } from './WellnessChart'
import { WellnessScore } from './WellnessScore'

interface Log {
  id: string
  category: string
  value: number
  note: string | null
  log_date: string
}

interface Props {
  userId: string
  todayStr: string
  todayLogs: Log[]
  weekLogs: Log[]
  profile: {
    wellness_goals: string[]
    hobbies: string[]
  }
}

const categories = [
  { key: 'physical', label: 'Físico', description: 'Treino, energia, corpo', emoji: '💪' },
  { key: 'mental', label: 'Mental', description: 'Foco, humor, estresse', emoji: '🧠' },
  { key: 'diet', label: 'Dieta', description: 'Alimentação, hidratação', emoji: '🥗' },
  { key: 'hobby', label: 'Hobby', description: 'Tempo para você', emoji: '🎸' },
]

export function WellnessDashboard({ userId, todayStr, todayLogs, weekLogs }: Props) {
  const [logs, setLogs] = useState<Log[]>(todayLogs)
  const supabase = createClient()

  async function saveLog(category: string, value: number, note?: string) {
    const { data } = await supabase
      .from('wellness_logs')
      .upsert({
        user_id: userId,
        log_date: todayStr,
        category,
        value,
        note: note ?? null,
      }, { onConflict: 'user_id,log_date,category' })
      .select()
      .single()

    if (data) {
      setLogs(prev => {
        const filtered = prev.filter(l => l.category !== category)
        return [...filtered, data]
      })
    }
  }

  const score = logs.length > 0
    ? Math.round(logs.reduce((sum, l) => sum + l.value, 0) / logs.length * 20)
    : null

  return (
    <div className="flex flex-col gap-6">
      <WellnessScore score={score} total={logs.length} />

      <div className="grid grid-cols-2 gap-3">
        {categories.map(cat => {
          const log = logs.find(l => l.category === cat.key)
          return (
            <WellnessCard
              key={cat.key}
              category={cat}
              currentValue={log?.value ?? null}
              onSave={(value: number, note?: string) => saveLog(cat.key, value, note)}
            />
          )
        })}
      </div>

      <WellnessChart weekLogs={weekLogs} />
    </div>
  )
}