import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoalList } from '@/components/goals/GoalList'
import Link from 'next/link'

export default async function MetasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Calcular estatísticas
  const totalGoals = goals?.length || 0
  const completedGoals = goals?.filter(g => g.status === 'completed').length || 0
  const activeGoals = goals?.filter(g => g.status === 'active').length || 0
  const progressRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header com Estatísticas */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Metas & Objetivos
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
              Transforme sonhos em realidade, um passo de cada vez
            </p>
          </div>
          <Link
            href="/pendencias"
            className="text-sm px-4 py-2 rounded-xl transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            🔗 Ver Tarefas Vinculadas
          </Link>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon="🎯"
            label="Total de Metas"
            value={totalGoals}
            color="var(--hero)"
          />
          <StatCard
            icon="✅"
            label="Concluídas"
            value={completedGoals}
            color="#10B981"
          />
          <StatCard
            icon="🔥"
            label="Em Andamento"
            value={activeGoals}
            color="#F59E0B"
          />
          <StatCard
            icon="📈"
            label="Taxa de Sucesso"
            value={`${progressRate}%`}
            color="#8B5CF6"
          />
        </div>
      </div>

      {/* Lista de Metas */}
      <GoalList goals={goals ?? []} userId={user.id} />
    </div>
  )
}

// Componente de Stat Card
function StatCard({ icon, label, value, color }: { 
  icon: string
  label: string
  value: string | number
  color: string
}) {
  return (
    <div 
      className="rounded-2xl p-5 transition-all hover:shadow-lg"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}20` }}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>{label}</p>
        </div>
      </div>
    </div>
  )
}