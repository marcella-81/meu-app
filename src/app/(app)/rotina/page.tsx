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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Rotina</h1>
        <p className="text-sm text-gray-500 mt-1">Sua semana organizada</p>
      </div>
      <WeekView blocks={timeBlocks ?? []} userId={user.id} />
    </div>
  )
}