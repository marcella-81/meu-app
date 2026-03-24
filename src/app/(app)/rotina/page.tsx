import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeekView } from '@/components/rotina/WeekView'

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          Planejamento
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>
          Sua rotina base da semana
        </p>
      </div>
      <WeekView blocks={timeBlocks ?? []} userId={user.id} />
    </div>
  )
}