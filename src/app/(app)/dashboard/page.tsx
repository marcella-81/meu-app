import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TimeBlockList } from '@/components/dashboard/TimeBlockList'
import { HabitList } from '@/components/dashboard/HabitList'
import { TaskList } from '@/components/dashboard/TaskList'
import { CheckIn } from '@/components/dashboard/CheckIn'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date()
  const weekday = today.getDay()
  const todayStr = today.toISOString().split('T')[0]

  const [
    { data: timeBlocks },
    { data: habits },
    { data: habitLogs },
    { data: tasks },
    { data: profile },
  ] = await Promise.all([
    supabase.from('time_blocks').select('*').eq('user_id', user.id).contains('weekdays', [weekday]).order('start_time'),
    supabase.from('habits').select('*').eq('user_id', user.id).eq('is_active', true),
    supabase.from('habits_log').select('*').eq('user_id', user.id).eq('log_date', todayStr),
    supabase.from('tasks').select('*').eq('user_id', user.id).eq('completed', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
  ])

  const now = today.toTimeString().slice(0, 5)
  const blocksWithStatus = (timeBlocks ?? []).map(block => ({
    ...block,
    is_current: block.start_time <= now && block.end_time > now,
    is_past: block.end_time <= now,
  }))
  const currentBlock = blocksWithStatus.find(b => b.is_current)

  const hour = today.getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const doneHabits = (habitLogs ?? []).filter(l => l.completed).length
  const totalHabits = (habits ?? []).length

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          {greeting} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
          {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Hero — bloco atual */}
      {currentBlock && (
        <div className="rounded-2xl p-6 mb-6 flex items-center justify-between" style={{ background: 'var(--hero)' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Agora
            </p>
            <p className="text-xl font-bold text-white">{currentBlock.title}</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {currentBlock.start_time.slice(0, 5)} — {currentBlock.end_time.slice(0, 5)}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
            Em andamento
          </div>
        </div>
      )}

      {/* Check-in IA */}
      <CheckIn currentBlock={currentBlock ?? null} profile={profile ?? null} />

      {/* Grade de 3 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* Coluna 1 — Rotina */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text3)' }}>
            Rotina de hoje
          </p>
          <TimeBlockList blocks={blocksWithStatus} />
        </div>

        {/* Coluna 2 — Hábitos */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
              Hábitos
            </p>
            <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              {doneHabits}/{totalHabits}
            </p>
          </div>
          <HabitList
            habits={habits ?? []}
            logs={habitLogs ?? []}
            userId={user.id}
            todayStr={todayStr}
          />
        </div>

        {/* Coluna 3 — Tarefas */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text3)' }}>
            Pendências
          </p>
          <TaskList tasks={tasks ?? []} userId={user.id} />
        </div>

      </div>
    </div>
  )
}