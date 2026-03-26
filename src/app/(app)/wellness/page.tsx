// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WellnessScore } from '@/components/wellness/WellnessScore'
import { WellnessCard } from '@/components/wellness/WellnessCard'
import { calculateDailyScore, calculateHistoricalScores } from '@/lib/utils/wellness-utils'

export default async function WellnessPage() {
  // ✅ 1. Criar cliente Supabase (UMA VEZ no topo)
  const supabase = await createClient()

  // ✅ 2. Verificar usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  // ✅ 3. Buscar hábitos
  const { data: habits } = await supabase
    .from('wellness_habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('area')

  // ✅ 4. Buscar logs de hoje
  const { data: logs } = await supabase
    .from('wellness_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', today)

  // ✅ 5. Calcular score do dia
  const dailyScore = calculateDailyScore(
    habits ?? [],
    logs ?? [],
    today
  )
  
  // ✅ 6. Agrupar hábitos por área
  const habitsByArea = (habits ?? []).reduce(
    (acc: Record<string, typeof habits>, habit : typeof habits[0]) => {
    if (!acc[habit.area]) acc[habit.area] = []
    acc[habit.area].push(habit)
    return acc
  }, 
  {} as Record<string, typeof habits>)

  // ✅ 7. Buscar logs históricos (últimos 7 dias)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const { data: historicalLogs } = await supabase
    .from('wellness_logs')
    .select('*, wellness_habits(area)')
    .eq('user_id', user.id)
    .gte('log_date', weekAgo.toISOString().split('T')[0])

  // ✅ 8. Calcular scores históricos
  interface WellnessLog {
  id: string;
  habit_id: string;
  log_date: string;
  [key: string]: unknown; // se houver campos adicionais
}

  
  const historicalScores = calculateHistoricalScores(
    habits ?? [],
    (historicalLogs ?? [] as WellnessLog[])
  )

  // ✅ 9. Buscar insight semanal mais recente
  const { data: weeklyInsight } = await supabase
    .from('wellness_insights')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // ✅ 10. Renderizar
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
          Wellness
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
          Acompanhe seu progresso diário em cada área
        </p>
      </div>

      {/* Score do Dia */}
      <WellnessScore
        overallScore={dailyScore.overall}
        totalHabits={dailyScore.totalHabits}
        totalCompleted={dailyScore.totalCompleted}
      />

      {/* Cards por Área */}
      <div className="mt-8 space-y-4">
        {['physical', 'mental', 'diet', 'hobby'].map(area => {
          const areaHabits = habitsByArea[area] || []
          if (areaHabits.length === 0) return null

          const areaLogs = (logs ?? []).filter(log => {
            const habit = areaHabits.find(h => h.id === log.habit_id)
            return habit
          })

          return (
            <WellnessCard
              key={area}
              area={area}
              habits={areaHabits}
              todayLogs={areaLogs}
              userId={user.id}
            />
          )
        })}
      </div>

      {/* Mensagem se não tem hábitos */}
      {(!habits || habits.length === 0) && (
        <div 
          className="rounded-2xl p-8 text-center mt-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-4xl mb-4">🌱</p>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
            Nenhum hábito cadastrado
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text3)' }}>
            Complete seu onboarding para começar a acompanhar
          </p>
        </div>
      )}

      {/* Insight Semanal da IA */}
      {weeklyInsight && (
        <div 
          className="rounded-2xl p-6 mt-8"
          style={{ background: 'var(--hero)', color: 'white' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-bold">Análise da Semana</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(weeklyInsight.area_scores || {}).map(([area, score]) => (
                <div key={area} className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs opacity-80 capitalize">{area}</p>
                  <p className="text-2xl font-bold">{Number(score)}%</p>
                </div>
              ))}
            </div>

            {weeklyInsight.ai_analysis && (
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm leading-relaxed">{weeklyInsight.ai_analysis}</p>
              </div>
            )}

            {weeklyInsight.recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2 opacity-80">Recomendações:</p>
                <ul className="space-y-1">
                  {weeklyInsight.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-300">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
