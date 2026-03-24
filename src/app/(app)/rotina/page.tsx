import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeekView } from '@/components/rotina/WeekView'
import Link from 'next/link'

export default async function RotinaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: timeBlocks } = await supabase
    .from('time_blocks')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time')

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Planejamento
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
            Sua rotina base da semana
          </p>
        </div>

        {/* Links para calendários */}
        <div className="flex gap-2">
          <Link
            href="/calendario/semanal"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            📅 Calendário Semanal
          </Link>
          <Link
            href="/calendario/mensal"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)' }}
          >
            📆 Calendário Mensal
          </Link>
        </div>
      </div>

      {/* WeekView - planejamento semanal */}
      <WeekView blocks={timeBlocks ?? []} userId={user.id} />
    </div>
  )
}