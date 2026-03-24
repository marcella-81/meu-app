'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateGoalProgress, formatDate, formatDaysRemaining } from '@/lib/utils/goal-utils'

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  status?: 'active' | 'completed' | 'paused'
  priority?: 'high' | 'medium' | 'low'
  target_date?: string
  start_date?: string
  progress: number
  completed?: boolean
  created_at: string
}

interface Checkin {
  id: string
  goal_id: string
  checkin_date: string
  notes?: string
  time_spent_minutes?: number
}

const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  personal: { bg: '#FCE7F3', text: '#EC4899', icon: '👤' },
  career: { bg: '#DBEAFE', text: '#3B82F6', icon: '💼' },
  health: { bg: '#D1FAE5', text: '#10B981', icon: '💚' },
  study: { bg: '#EDE9FE', text: '#8B5CF6', icon: '📚' },
  finance: { bg: '#FEF3C7', text: '#F59E0B', icon: '💰' },
  relationships: { bg: '#FEE2E2', text: '#EF4444', icon: '❤️' },
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
}

export function GoalCard({ goal }: { goal: Goal }) {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const supabase = createClient()

  const isCompleted = goal.status === 'completed' || goal.completed === true
  const category = categoryColors[goal.category || 'personal'] || categoryColors.personal
  const priority = goal.priority || 'medium'

  // Calcular progresso dinâmico
  const progressData = calculateGoalProgress(
    goal.start_date || goal.created_at,
    goal.target_date || new Date().toISOString(),
    checkins
  )

  // Carregar check-ins ao montar
  useEffect(() => {
    async function loadCheckins() {
      const { data } = await supabase
        .from('goal_checkins')
        .select('*')
        .eq('goal_id', goal.id)
        .order('checkin_date', { ascending: false })
      
      if (data) setCheckins(data)
      setLoading(false)
    }
    loadCheckins()
  }, [goal.id, supabase])

  // Verificar se já fez check-in hoje
  const hasCheckedInToday = checkins.some(c => {
    const today = new Date().toISOString().split('T')[0]
    return c.checkin_date === today
  })

  // Fazer check-in
  async function handleCheckin() {
    if (hasCheckedInToday) return

    const { error } = await supabase
      .from('goal_checkins')
      .insert({
        goal_id: goal.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        checkin_date: new Date().toISOString().split('T')[0],
        notes: notes.trim() || null,
      })

    if (!error) {
      // Recarregar check-ins
      const { data } = await supabase
        .from('goal_checkins')
        .select('*')
        .eq('goal_id', goal.id)
      
      if (data) {
        setCheckins(data)
        setNotes('')
        setShowNotes(false)
        
        // Celebrar se completou a meta
        const newProgress = calculateGoalProgress(
          goal.start_date || goal.created_at,
          goal.target_date || new Date().toISOString(),
          data
        )
        if (newProgress.progress >= 100 && progressData.progress < 100) {
          alert('🎉 Parabéns! Você concluiu sua meta!')
        }
      }
    }
  }

  // Alternar status da meta
  async function toggleStatus() {
    const newCompleted = !isCompleted
    const newStatus = newCompleted ? 'completed' : 'active'
    
    await supabase
      .from('goals')
      .update({ 
        status: newStatus,
        completed: newCompleted,
      })
      .eq('id', goal.id)
    
    window.location.reload()
  }

  // Excluir meta
  async function deleteGoal() {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      await supabase.from('goals').delete().eq('id', goal.id)
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  return (
    <div 
      className="rounded-2xl p-5 transition-all hover:shadow-lg group"
      style={{ 
        background: 'var(--surface)', 
        border: `2px solid ${category.bg}` 
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h3 className="font-bold" style={{ color: 'var(--text)' }}>{goal.title}</h3>
            <p className="text-xs" style={{ color: category.text }}>{goal.category || 'Pessoal'}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleStatus}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-xs"
            title={isCompleted ? 'Marcar como ativa' : 'Marcar como concluída'}
          >
            {isCompleted ? '↩️' : '✅'}
          </button>
          <button
            onClick={deleteGoal}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 text-xs"
            title="Excluir"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Descrição */}
      {goal.description && (
        <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text2)' }}>
          {goal.description}
        </p>
      )}

      {/* Timeline da Meta */}
      <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: 'var(--text3)' }}>
        <span>📅 {formatDate(goal.start_date || goal.created_at)}</span>
        <span>→</span>
        <span className={progressData.isOverdue ? 'text-red-500 font-medium' : ''}>
          {formatDate(goal.target_date || '')}
        </span>
        {!progressData.isCompleted && !progressData.isOverdue && (
          <span className="ml-auto font-medium" style={{ color: category.text }}>
            {formatDaysRemaining(progressData.remainingDays)}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[priority]}`}>
          {priority === 'high' ? '🔥 Alta' : priority === 'medium' ? '⚡ Média' : '💤 Baixa'}
        </span>
        {progressData.streak > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
            🔥 {progressData.streak} dia{progressData.streak > 1 ? 's' : ''} seguidos
          </span>
        )}
        {isCompleted && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
            ✅ Concluída
          </span>
        )}
        {progressData.isOverdue && (
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
            ⚠️ Atrasada
          </span>
        )}
      </div>

      {/* Barra de Progresso */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold" style={{ color: 'var(--text3)' }}>
            Progresso ({progressData.checkinDays}/{progressData.totalDays} dias)
          </span>
          <span className="text-xs font-bold" style={{ color: category.text }}>
            {progressData.progress}%
          </span>
        </div>
        <div 
          className="h-3 rounded-full overflow-hidden"
          style={{ background: 'var(--bg)' }}
        >
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              progressData.isOverdue ? 'animate-pulse' : ''
            }`}
            style={{ 
              width: `${progressData.progress}%`,
              background: progressData.isOverdue 
                ? 'linear-gradient(90deg, #EF4444, #F97316)' 
                : `linear-gradient(90deg, ${category.text}, ${category.text}dd)`
            }}
          />
        </div>
      </div>

      {/* Área de Check-in */}
      {!isCompleted && !progressData.isOverdue && (
        <div className="space-y-3">
          {/* Botão de Check-in */}
          <button
            onClick={() => hasCheckedInToday ? null : setShowNotes(!showNotes)}
            disabled={hasCheckedInToday}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              hasCheckedInToday 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-md active:scale-[0.98]'
            }`}
            style={{ 
              background: hasCheckedInToday ? 'var(--bg)' : category.text,
              color: hasCheckedInToday ? 'var(--text3)' : 'white'
            }}
          >
            {hasCheckedInToday ? (
              <>
                <span>✅</span>
                <span>Check-in feito hoje!</span>
              </>
            ) : (
              <>
                <span>🎯</span>
                <span>Trabalhei nisso hoje</span>
              </>
            )}
          </button>

          {/* Campo de notas (opcional) */}
          {showNotes && !hasCheckedInToday && (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="O que você fez hoje? (opcional)"
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowNotes(false); setNotes('') }}
                  className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--bg)', color: 'var(--text2)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCheckin}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-white"
                  style={{ background: 'var(--hero)' }}
                >
                  Registrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mini histórico de check-ins */}
      {checkins.length > 0 && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text3)' }}>
            Últimos check-ins:
          </p>
          <div className="flex gap-1">
            {checkins.slice(0, 7).map((checkin) => {
              const date = new Date(checkin.checkin_date)
              const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
              return (
                <div
                  key={checkin.id}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                    isToday ? 'ring-2 ring-[var(--hero)]' : ''
                  }`}
                  style={{ 
                    background: category.bg,
                    color: category.text,
                    border: `1px solid ${category.text}`
                  }}
                  title={date.toLocaleDateString('pt-BR')}
                >
                  {date.getDate()}
                </div>
              )
            })}
            {checkins.length > 7 && (
              <span className="text-xs" style={{ color: 'var(--text3)' }}>
                +{checkins.length - 7}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}