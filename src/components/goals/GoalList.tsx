'use client'

import { useState } from 'react'
import { GoalCard } from './GoalCard'
import { AddGoalModal } from './AddGoalModal'

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  status: 'active' | 'completed' | 'paused'
  priority: 'high' | 'medium' | 'low'
  target_date?: string
  progress: number
  created_at: string
  user_id: string
}

const categories = [
  { value: 'personal', label: 'Pessoal', icon: '👤', color: '#EC4899' },
  { value: 'career', label: 'Carreira', icon: '💼', color: '#3B82F6' },
  { value: 'health', label: 'Saúde', icon: '💚', color: '#10B981' },
  { value: 'study', label: 'Estudos', icon: '📚', color: '#8B5CF6' },
  { value: 'finance', label: 'Finanças', icon: '💰', color: '#F59E0B' },
  { value: 'relationships', label: 'Relacionamentos', icon: '❤️', color: '#EF4444' },
]

export function GoalList({ goals, userId }: { goals: Goal[], userId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredGoals = goals.filter(goal => {
  const isCompleted = goal.status === 'completed'
  
  if (filter === 'active' && isCompleted) return false
  if (filter === 'completed' && !isCompleted) return false
  if (categoryFilter !== 'all' && goal.category !== categoryFilter) return false
  return true
})

  const activeGoals = filteredGoals.filter(g => g.status === 'active')
  const completedGoals = filteredGoals.filter(g => g.status === 'completed')

  return (
    <div className="space-y-8">
      {/* Filtros e Botão de Adicionar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'all' ? 'ring-2 ring-[var(--hero)]' : ''
            }`}
            style={{ 
              background: filter === 'all' ? 'var(--hero)' : 'var(--surface)',
              color: filter === 'all' ? 'white' : 'var(--text2)',
              border: '1px solid var(--border)'
            }}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'active' ? 'ring-2 ring-[var(--hero)]' : ''
            }`}
            style={{ 
              background: filter === 'active' ? 'var(--hero)' : 'var(--surface)',
              color: filter === 'active' ? 'white' : 'var(--text2)',
              border: '1px solid var(--border)'
            }}
          >
            Em Andamento
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'completed' ? 'ring-2 ring-[var(--hero)]' : ''
            }`}
            style={{ 
              background: filter === 'completed' ? 'var(--hero)' : 'var(--surface)',
              color: filter === 'completed' ? 'white' : 'var(--text2)',
              border: '1px solid var(--border)'
            }}
          >
            ✅ Concluídas
          </button>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:shadow-lg"
          style={{ background: 'var(--hero)' }}
        >
          Nova Meta
        </button>
      </div>

      {/* Filtro por Categoria */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            categoryFilter === 'all' ? 'ring-2 ring-[var(--hero)]' : ''
          }`}
          style={{ 
            background: categoryFilter === 'all' ? 'var(--hero)' : 'var(--bg)',
            color: categoryFilter === 'all' ? 'white' : 'var(--text2)',
          }}
        >
          Todas
        </button>
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              categoryFilter === cat.value ? 'ring-2 ring-[var(--hero)]' : ''
            }`}
            style={{ 
              background: categoryFilter === cat.value ? cat.color : 'var(--bg)',
              color: categoryFilter === cat.value ? 'white' : 'var(--text2)',
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Metas em Andamento */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Em Andamento ({activeGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
                        ))}
          </div>
        </div>
      )}

      {/* Metas Concluídas */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text3)' }}>
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            Concluídas ({completedGoals.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
            {completedGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Nenhuma meta */}
      {filteredGoals.length === 0 && (
        <div 
          className="text-center py-16 rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-6xl mb-4"></div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
            Nenhuma meta encontrada
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text3)' }}>
            Comece definindo seu primeiro objetivo!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'var(--hero)' }}
          >
            + Criar Primeira Meta
          </button>
        </div>
      )}

      {/* Modal de Adicionar Meta */}
      <AddGoalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userId={userId}
        categories={categories}
      />
    </div>
  )
}