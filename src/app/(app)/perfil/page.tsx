import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/perfil/ProfileForm'
import { HabitManager } from '@/components/perfil/HabitManager'
import { LogoutButton } from '@/components/layout/LogoutButton'

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: habits },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('habits').select('*').eq('user_id', user.id).order('created_at'),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Perfil</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Hábitos
          </h2>
          <HabitManager habits={habits ?? []} userId={user.id} />
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Informações pessoais
          </h2>
          <ProfileForm userId={user.id} profile={profile} />
        </div>
      </div>
    </div>
  )

}