import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoalList } from '@/components/goals/GoalList'

export default async function MetasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Metas</h1>
        <p className="text-sm text-gray-500 mt-1">Seus objetivos de longo prazo</p>
      </div>
      <GoalList goals={goals ?? []} userId={user.id} />
    </div>
  )
}