export interface WellnessLog {
  id: string
  habit_id: string
  log_date: string
  completed: boolean
  actual_value: number
}

export interface WellnessHabit {
  id: string
  area: 'physical' | 'mental' | 'diet' | 'hobby'
  title: string
  category: string
  target_value: number
}

export interface AreaScore {
  area: string
  score: number
  completed: number
  total: number
}

export interface DailyWellnessScore {
  overall: number
  areas: AreaScore[]
  totalHabits: number
  totalCompleted: number
}

// ✅ Calcula score do dia baseado nos logs
export function calculateDailyScore(
  habits: WellnessHabit[],
  logs: WellnessLog[],
  targetDate: string = new Date().toISOString().split('T')[0]
): DailyWellnessScore {
  const areas = ['physical', 'mental', 'diet', 'hobby']
  const areaScores: AreaScore[] = []
  let totalHabits = 0
  let totalCompleted = 0

  areas.forEach(area => {
    const areaHabits = habits.filter(h => h.area === area)
    if (areaHabits.length === 0) return

    const areaLogs = logs.filter(l => {
      const habit = habits.find(h => h.id === l.habit_id)
      return habit?.area === area && l.log_date === targetDate
    })

    const completed = areaLogs.filter(l => l.completed).length
    const total = areaHabits.length

    areaScores.push({
      area,
      score: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total
    })

    totalHabits += total
    totalCompleted += completed
  })

  return {
    overall: totalHabits > 0 ? Math.round((totalCompleted / totalHabits) * 100) : 0,
    areas: areaScores,
    totalHabits,
    totalCompleted
  }
}

// ✅ Calcula score histórico para gráfico (últimos 7 dias)
export function calculateHistoricalScores(
  habits: WellnessHabit[],
  logs: WellnessLog[],
  days: number = 7
) {
  const scores: { date: string; score: number }[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dailyScore = calculateDailyScore(habits, logs, dateStr)
    scores.push({ date: dateStr, score: dailyScore.overall })
  }

  return scores
}

// ✅ Formata score para exibição
export function formatScore(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) return { label: 'Excelente', color: '#10B981', emoji: '🌟' }
  if (score >= 60) return { label: 'Bom', color: '#3B82F6', emoji: '👍' }
  if (score >= 40) return { label: 'Regular', color: '#F59E0B', emoji: '🤔' }
  return { label: 'Precisa melhorar', color: '#EF4444', emoji: '💪' }
}

// ✅ Informações das áreas
export const areaInfo: Record<string, { label: string; icon: string; color: string }> = {
  physical: { label: 'Físico', icon: '💪', color: '#EF4444' },
  mental: { label: 'Mental', icon: '🧠', color: '#8B5CF6' },
  diet: { label: 'Dieta', icon: '🥗', color: '#10B981' },
  hobby: { label: 'Hobby', icon: '🎨', color: '#F59E0B' },
}