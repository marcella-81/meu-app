export interface Checkin {
  id: string
  goal_id: string
  checkin_date: string
  notes?: string
  time_spent_minutes?: number
}

export interface GoalProgress {
  progress: number
  totalDays: number
  checkinDays: number
  remainingDays: number
  streak: number
  isCompleted: boolean
  isOverdue: boolean
}

// Calcular progresso baseado em check-ins
export function calculateGoalProgress(
  startDate: string,
  endDate: string,
  checkins: Checkin[]
): GoalProgress {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Total de dias do período da meta
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  
  // Dias com check-in (até hoje)
  const checkinDays = checkins.filter(c => {
    const checkinDate = new Date(c.checkin_date)
    checkinDate.setHours(0, 0, 0, 0)
    return checkinDate <= today
  }).length
  
  // Progresso = (checkins / total days) * 100, limitado a 100%
  const progress = Math.min(100, Math.round((checkinDays / totalDays) * 100))
  
  // Dias restantes
  const remainingDays = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  
  // Calcular streak
  const streak = calculateStreak(checkins, today)
  
  return {
    progress,
    totalDays,
    checkinDays,
    remainingDays,
    streak,
    isCompleted: progress >= 100,
    isOverdue: today > end && progress < 100
  }
}

// Calcular streak de check-ins consecutivos
export function calculateStreak(checkins: Checkin[], referenceDate = new Date()): number {
  if (checkins.length === 0) return 0
  
  const today = new Date(referenceDate)
  today.setHours(0, 0, 0, 0)
  
  // Ordenar check-ins por data (mais recente primeiro)
  const sorted = [...checkins]
    .map(c => {
      const d = new Date(c.checkin_date)
      d.setHours(0, 0, 0, 0)
      return d
    })
    .sort((a, b) => b.getTime() - a.getTime())
  
  // Verificar se tem check-in hoje ou ontem
  const lastCheckin = sorted[0]
  const diffLast = Math.round((today.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffLast > 1) return 0 // Streak quebrado
  
  let streak = 1
  
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = sorted[i - 1]
    const currDate = sorted[i]
    const diff = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diff === 1) {
      streak++
    } else if (diff > 1) {
      break // Streak quebrado
    }
  }
  
  return streak
}

// Formatar datas para exibição
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export function formatDaysRemaining(days: number): string {
  if (days === 0) return 'Hoje é o último dia!'
  if (days === 1) return '1 dia restante'
  if (days < 7) return `${days} dias restantes`
  if (days < 30) return `${Math.round(days / 7)} semanas restantes`
  return `${Math.round(days / 30)} meses restantes`
}