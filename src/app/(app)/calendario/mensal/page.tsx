import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar'
import Link from 'next/link'

export default async function CalendarioMensalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: timeBlocks } = await supabase
    .from('time_blocks')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/rotina"
            className="text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
            style={{ color: 'var(--text2)' }}
          >
            ← Voltar
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Calendário Mensal
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
              Visualização mensal da sua rotina
            </p>
          </div>
        </div>

        {/* Link para semanal */}
        <Link
          href="/calendario/semanal"
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
        >
          Ver Semanal
        </Link>
      </div>

      {/* Calendário Mensal */}
      <MonthlyCalendar 
        tasks={tasks ?? []} 
        goals={goals ?? []}
      />
    </div>
  )
}