import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WellnessDashboard } from '@/components/wellness/WellnessDashboard'

export default async function WellnessPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const todayStr = new Date().toISOString().split('T')[0]

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

  const [
    { data: todayLogs },
    { data: weekLogs },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('wellness_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', todayStr),
    supabase
      .from('wellness_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', sevenDaysAgoStr)
      .order('log_date'),
    supabase
      .from('profiles')
      .select('wellness_goals, hobbies')
      .eq('user_id', user.id)
      .single(),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Wellness</h1>
        <p className="text-sm text-gray-500 mt-1">Como você está hoje?</p>
      </div>
      <WellnessDashboard
        userId={user.id}
        todayStr={todayStr}
        todayLogs={todayLogs ?? []}
        weekLogs={weekLogs ?? []}
        profile={profile ?? { wellness_goals: [], hobbies: [] }}
      />
    </div>
  )
}