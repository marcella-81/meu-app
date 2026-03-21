'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  chronotype: string
  work_type: string
  productivity_killers: string[]
  productivity_boosters: string[]
  hobbies: string[]
  wellness_goals: string[]
  long_term_goals: string[]
}

interface Props {
  userId: string
  profile: Profile | null
}

const chronotypeOptions = [
  { value: 'morning', label: 'Matutino — mais produtivo de manhã' },
  { value: 'evening', label: 'Noturno — mais produtivo à noite' },
  { value: 'flexible', label: 'Flexível — sem horário fixo de pico' },
]

export function ProfileForm({ userId, profile }: Props) {
  const [workType, setWorkType] = useState(profile?.work_type ?? '')
  const [chronotype, setChronotype] = useState(profile?.chronotype ?? 'flexible')
  const [killers, setKillers] = useState(profile?.productivity_killers?.join(', ') ?? '')
  const [boosters, setBoosters] = useState(profile?.productivity_boosters?.join(', ') ?? '')
  const [hobbies, setHobbies] = useState(profile?.hobbies?.join(', ') ?? '')
  const [wellness, setWellness] = useState(profile?.wellness_goals?.join(', ') ?? '')
  const [goals, setGoals] = useState(profile?.long_term_goals?.join(', ') ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await supabase.from('profiles').upsert({
      user_id: userId,
      work_type: workType.trim(),
      chronotype,
      productivity_killers: killers.split(',').map(s => s.trim()).filter(Boolean),
      productivity_boosters: boosters.split(',').map(s => s.trim()).filter(Boolean),
      hobbies: hobbies.split(',').map(s => s.trim()).filter(Boolean),
      wellness_goals: wellness.split(',').map(s => s.trim()).filter(Boolean),
      long_term_goals: goals.split(',').map(s => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Trabalho / área</label>
        <input
          type="text"
          value={workType}
          onChange={e => setWorkType(e.target.value)}
          placeholder="Ex: desenvolvedor, designer, estudante..."
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Cronotipo</label>
        {chronotypeOptions.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setChronotype(opt.value)}
            className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
              chronotype === opt.value
                ? 'border-violet-600 bg-violet-50 text-violet-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">O que atrapalha sua produtividade</label>
        <input
          type="text"
          value={killers}
          onChange={e => setKillers(e.target.value)}
          placeholder="Ex: redes sociais, celular, barulho..."
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
        <span className="text-xs text-gray-400">Separa por vírgula</span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">O que te deixa produtivo</label>
        <input
          type="text"
          value={boosters}
          onChange={e => setBoosters(e.target.value)}
          placeholder="Ex: música, silêncio, café..."
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
        <span className="text-xs text-gray-400">Separa por vírgula</span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Hobbies</label>
        <input
          type="text"
          value={hobbies}
          onChange={e => setHobbies(e.target.value)}
          placeholder="Ex: guitarra, leitura, jogos..."
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
        <span className="text-xs text-gray-400">Separa por vírgula</span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Metas de wellness</label>
        <input
          type="text"
          value={wellness}
          onChange={e => setWellness(e.target.value)}
          placeholder="Ex: academia, meditação, dieta..."
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
        <span className="text-xs text-gray-400">Separa por vírgula</span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Objetivos de longo prazo</label>
        <input
          type="text"
          value={goals}
          onChange={e => setGoals(e.target.value)}
          placeholder="Ex: carreira, estudos, saúde..."
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
        <span className="text-xs text-gray-400">Separa por vírgula</span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-all disabled:opacity-50"
      >
        {loading ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar alterações'}
      </button>

    </form>
  )
}