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
    supabase
      .from('time_blocks')
      .select('*')
      .eq('user_id', user.id)
      .contains('weekdays', [weekday])
      .order('start_time'),
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true),
    supabase
      .from('habits_log')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', todayStr),
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single(),
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {greeting} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {today.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Bloco atual */}
      {currentBlock && (
        <div className="bg-violet-600 text-white rounded-xl p-5 mb-6">
          <p className="text-violet-200 text-xs font-medium uppercase tracking-wide mb-1">
            Agora
          </p>
          <p className="text-lg font-semibold">{currentBlock.title}</p>
          <p className="text-violet-200 text-sm mt-1">
            {currentBlock.start_time} — {currentBlock.end_time}
          </p>
        </div>
      )}

      {/* Check-in IA */}
      <CheckIn
        currentBlock={currentBlock ?? null}
        profile={profile ?? null}
      />

      {/* Time blocks do dia */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Rotina de hoje
        </h2>
        <TimeBlockList blocks={blocksWithStatus} />
      </div>

      {/* Hábitos */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Hábitos
        </h2>
        <HabitList
          habits={habits ?? []}
          logs={habitLogs ?? []}
          userId={user.id}
          todayStr={todayStr}
        />
      </div>

      {/* Tarefas */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Pendências
        </h2>
        <TaskList tasks={tasks ?? []} userId={user.id} />
      </div>

    </div>
  )
}