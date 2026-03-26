// src/components/wellness/WellnessScore.tsx
'use client'

interface Props {
  overallScore: number
  totalHabits: number
  totalCompleted: number
}

function formatScore(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) return { label: 'Excelente', color: '#10B981', emoji: '🌟' }
  if (score >= 60) return { label: 'Bom', color: '#3B82F6', emoji: '👍' }
  if (score >= 40) return { label: 'Regular', color: '#F59E0B', emoji: '🤔' }
  return { label: 'Precisa melhorar', color: '#EF4444', emoji: '💪' }
}

export function WellnessScore({ overallScore, totalHabits, totalCompleted }: Props) {
  const { label, color, emoji } = formatScore(overallScore)

  return (
    <div 
      className="rounded-2xl p-6 text-white"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            Seu Wellness Hoje
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl">{emoji}</span>
            <span className="text-2xl font-bold">{overallScore}%</span>
          </div>
          <p className="text-sm opacity-90 mt-1">{label}</p>
        </div>
        
        <div className="text-right">
          <p className="text-3xl font-bold">{totalCompleted}/{totalHabits}</p>
          <p className="text-xs opacity-80">hábitos concluídos</p>
        </div>
      </div>
      
      <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${overallScore}%` }}
        />
      </div>
    </div>
  )
}