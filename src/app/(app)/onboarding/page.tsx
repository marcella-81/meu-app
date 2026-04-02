'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const TOTAL_STEPS = 5

interface Answers {
  chronotype: string
  wake_time: string
  sleep_time: string
  work_type: string
  work_hours: string
  study_subject: string
  productivity_killers: string[]
  productivity_boosters: string[]
  wellness_areas: string[]
  wellness_habits: Record<string, string[]>
  hobbies: string[]
  focus_areas: string[]
}

interface StepProps {
  answers: Answers
  update: (field: string, value: unknown) => void
}

function HabitSelector({
  area, currentHabits, onUpdate, suggestions
}: {
  area: string
  currentHabits: string[]
  onUpdate: (habits: string[]) => void
  suggestions: string[]
}) {
  const [customInput, setCustomInput] = useState('')

  const areaIcons: Record<string, string> = {
    physical: '💪', mental: '🧠', diet: '🥗', hobby: '🎨',
  }
  const areaLabels: Record<string, string> = {
    physical: 'Físico', mental: 'Mental', diet: 'Dieta', hobby: 'Hobby',
  }

  function toggleHabit(habit: string) {
    const newHabits = currentHabits.includes(habit)
      ? currentHabits.filter(h => h !== habit)
      : [...currentHabits, habit]
    onUpdate(newHabits)
  }

  function addCustomHabit(value: string) {
    if (!value.trim()) return
    if (!currentHabits.includes(value.trim())) {
      onUpdate([...currentHabits, value.trim()])
    }
  }

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{areaIcons[area]}</span>
        <div>
          <h3 className="font-medium" style={{ color: 'var(--text)' }}>{areaLabels[area]}</h3>
          <p className="text-xs" style={{ color: 'var(--text3)' }}>{currentHabits.length}/3 hábitos selecionados</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map(habit => (
          <button
            key={habit}
            onClick={() => toggleHabit(habit)}
            className="px-3 py-1.5 rounded-full text-xs transition-all border"
            style={currentHabits.includes(habit)
              ? { background: 'rgba(61,92,58,0.1)', color: 'var(--hero)', borderColor: 'var(--accent)' }
              : { background: 'var(--bg)', color: 'var(--text2)', borderColor: 'var(--border)' }
            }
          >
            {habit}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Adicione um hábito personalizado..."
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { addCustomHabit(customInput); setCustomInput('') }
          }}
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <button
          onClick={() => { addCustomHabit(customInput); setCustomInput('') }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--hero)' }}
        >
          +
        </button>
      </div>

      {currentHabits.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {currentHabits.map(habit => (
            <span key={habit} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
              style={{ background: 'rgba(61,92,58,0.1)', color: 'var(--hero)' }}>
              {habit}
              <button onClick={() => toggleHabit(habit)} className="ml-1">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Step1({ answers, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Sua rotina básica</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Conta como é seu dia naturalmente</p>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Você é mais produtivo:</label>
        {['morning', 'evening', 'flexible'].map(option => (
          <button key={option} onClick={() => update('chronotype', option)}
            className="px-4 py-3 rounded-xl border text-sm text-left transition-all"
            style={answers.chronotype === option
              ? { borderColor: 'var(--accent)', background: 'rgba(61,92,58,0.06)', color: 'var(--hero)' }
              : { borderColor: 'var(--border)', color: 'var(--text2)' }
            }>
            {option === 'morning' && 'De manhã — acordo cedo e rendo mais cedo'}
            {option === 'evening' && 'À noite — sou mais focado no período da tarde/noite'}
            {option === 'flexible' && 'Flexível — não tenho um horário fixo de pico'}
          </button>
        ))}
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Que horas acorda?</label>
          <input type="time" value={answers.wake_time} onChange={e => update('wake_time', e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Que horas dorme?</label>
          <input type="time" value={answers.sleep_time} onChange={e => update('sleep_time', e.target.value)}
            className="px-3 py-2 rounded-xl text-sm outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
        </div>
      </div>
    </div>
  )
}

function Step2({ answers, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Trabalho e estudo</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>O que você faz no seu dia a dia</p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>O que você faz?</label>
        <input type="text" placeholder="Ex: desenvolvedor, estudante, designer..."
          value={answers.work_type} onChange={e => update('work_type', e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Horas de trabalho/estudo por dia:</label>
        {['2-4h', '4-6h', '6-8h', '8h+'].map(option => (
          <button key={option} onClick={() => update('work_hours', option)}
            className="px-4 py-3 rounded-xl border text-sm text-left transition-all"
            style={answers.work_hours === option
              ? { borderColor: 'var(--accent)', background: 'rgba(61,92,58,0.06)', color: 'var(--hero)' }
              : { borderColor: 'var(--border)', color: 'var(--text2)' }
            }>
            {option}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>Estudando algo específico? (opcional)</label>
        <input type="text" placeholder="Ex: inglês, programação, concurso..."
          value={answers.study_subject} onChange={e => update('study_subject', e.target.value)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
      </div>
    </div>
  )
}

function Step3({ answers, update }: StepProps) {
  const killers = ['Redes sociais', 'Celular', 'Procrastinação', 'Barulho', 'Desorganização', 'Cansaço']
  const boosters = ['Música', 'Silêncio', 'Pomodoro', 'Listas de tarefas', 'Exercício antes', 'Café']

  function toggle(field: string, value: string, current: string[]) {
    update(field, current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Sua produtividade</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>O que te atrapalha e o que te ajuda</p>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>O que mais acaba com sua produtividade?</label>
        <div className="flex flex-wrap gap-2">
          {killers.map(item => (
            <button key={item} onClick={() => toggle('productivity_killers', item, answers.productivity_killers)}
              className="px-3 py-1.5 rounded-full border text-sm transition-all"
              style={answers.productivity_killers.includes(item)
                ? { borderColor: '#f87171', background: '#fef2f2', color: '#dc2626' }
                : { borderColor: 'var(--border)', color: 'var(--text2)' }
              }>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium" style={{ color: 'var(--text2)' }}>O que te deixa mais produtivo?</label>
        <div className="flex flex-wrap gap-2">
          {boosters.map(item => (
            <button key={item} onClick={() => toggle('productivity_boosters', item, answers.productivity_boosters)}
              className="px-3 py-1.5 rounded-full border text-sm transition-all"
              style={answers.productivity_boosters.includes(item)
                ? { borderColor: 'var(--accent)', background: 'rgba(61,92,58,0.06)', color: 'var(--hero)' }
                : { borderColor: 'var(--border)', color: 'var(--text2)' }
              }>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step4({ answers, update }: StepProps) {
  const wellnessAreas = [
    { value: 'physical', label: 'Físico', icon: '💪', desc: 'Exercício, sono, energia' },
    { value: 'mental', label: 'Mental', icon: '🧠', desc: 'Foco, clareza, equilíbrio' },
    { value: 'diet', label: 'Dieta', icon: '🥗', desc: 'Nutrição, hidratação, hábitos' },
    { value: 'hobby', label: 'Hobby', icon: '🎨', desc: 'Lazer, criatividade, prazer' },
  ]

  function toggleArea(value: string) {
    const current = answers.wellness_areas
    if (current.includes(value)) {
      update('wellness_areas', current.filter(v => v !== value))
      const newHabits = { ...answers.wellness_habits }
      delete newHabits[value]
      update('wellness_habits', newHabits)
    } else if (current.length < 4) {
      update('wellness_areas', [...current, value])
    } else {
      alert('Você pode selecionar até 4 áreas')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Wellness</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Escolha até 4 áreas para focar</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {wellnessAreas.map(area => {
          const isSelected = answers.wellness_areas.includes(area.value)
          return (
            <button key={area.value} onClick={() => toggleArea(area.value)}
              className="p-4 rounded-xl border text-left transition-all"
              style={isSelected
                ? { borderColor: 'var(--accent)', background: 'rgba(61,92,58,0.06)' }
                : { borderColor: 'var(--border)' }
              }>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{area.icon}</span>
                <span className="font-medium" style={{ color: 'var(--text)' }}>{area.label}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text3)' }}>{area.desc}</p>
              {isSelected && <span className="inline-block mt-2 text-xs font-medium" style={{ color: 'var(--accent)' }}>✓ Selecionado</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Step5({
  answers, updateWellnessHabit
}: {
  answers: Answers
  updateWellnessHabit: (area: string, habits: string[]) => void
}) {
  const habitSuggestions: Record<string, string[]> = {
    physical: ['Treinar 30 minutos', 'Caminhar 10k passos', 'Dormir 7+ horas', 'Beber 2L de água', 'Alongar 10 minutos'],
    mental: ['Meditar 10 minutos', 'Ler 15 minutos', 'Escrever 3 gratidões', 'Fazer pausa a cada 2h'],
    diet: ['Bater metas de macros', 'Comer 5 refeições balanceadas', 'Zero açúcar refinado', 'Preparar marmita'],
    hobby: ['Praticar instrumento 20min', 'Desenhar ou pintar', 'Escrever no journal', 'Cozinhar receita nova'],
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Defina seus hábitos</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>Escolha 2-3 hábitos mensuráveis para cada área</p>
      </div>
      {answers.wellness_areas.map(area => (
        <HabitSelector
          key={area}
          area={area}
          currentHabits={answers.wellness_habits[area] || []}
          suggestions={habitSuggestions[area] || []}
          onUpdate={habits => updateWellnessHabit(area, habits)}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState<Answers>({
    chronotype: '',
    wake_time: '',
    sleep_time: '',
    work_type: '',
    work_hours: '',
    study_subject: '',
    productivity_killers: [],
    productivity_boosters: [],
    wellness_areas: [],
    wellness_habits: {},
    hobbies: [],
    focus_areas: [],
  })

  const router = useRouter()
  const supabase = createClient()

  function update(field: string, value: unknown) {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  function updateWellnessHabit(area: string, habits: string[]) {
    setAnswers(prev => ({
      ...prev,
      wellness_habits: { ...prev.wellness_habits, [area]: habits }
    }))
  }

  function nextStep() {
    if (step === 4 && answers.wellness_areas.length === 0) {
      alert('Selecione pelo menos 1 área de wellness para continuar')
      return
    }
    setStep(prev => prev + 1)
  }

  function prevStep() {
    setStep(prev => prev - 1)
  }

  async function handleFinish() {
    setLoading(true)
    console.log('1. iniciou')

    const hobbies = answers.hobbies.filter(h => h.trim() !== '')
    const killers = answers.productivity_killers.filter(k => k.trim() !== '')
    const focus = answers.focus_areas.filter(f => f.trim() !== '')

    const { data: { user } } = await supabase.auth.getUser()
    console.log('2. user:', user?.id)

    if (!user) { setLoading(false); return }

    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: user.id,
      chronotype: answers.chronotype || 'flexible',
      work_type: answers.work_type.trim() || 'não informado',
      productivity_killers: killers,
      productivity_boosters: answers.productivity_boosters,
      hobbies: hobbies,
      long_term_goals: focus,
      wellness_areas: answers.wellness_areas,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    console.log('3. profileError:', profileError)

    const wellnessHabitsToInsert = Object.entries(answers.wellness_habits).flatMap(
      ([area, habits]) => habits
        .filter(h => h.trim() !== '')
        .map(habit => ({ user_id: user.id, area, title: habit.trim(), is_active: true }))
    )
    console.log('4. wellness habits:', wellnessHabitsToInsert)

    if (wellnessHabitsToInsert.length > 0) {
    const { error: wellnessError } = await supabase.from('wellness_habits').insert(wellnessHabitsToInsert)
    console.log('5. wellnessError:', wellnessError)
  }

  // Cria hábitos na tabela habits para aparecer no dashboard
  const habitsToInsert = Object.entries(answers.wellness_habits).flatMap(
    ([area, habits]) => habits
      .filter(h => h.trim() !== '')
      .map(habit => ({
        user_id: user.id,
        title: habit.trim(),
        category: area,
        frequency: 'daily',
        is_active: true
      }))
  )

  if (habitsToInsert.length > 0) {
    const { error: habitsError } = await supabase.from('habits').insert(habitsToInsert)
    console.log('5b. habitsError:', habitsError)
  }

  console.log('6. chamando IA...')
    try {
      const response = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chronotype: answers.chronotype,
          wake_time: answers.wake_time,
          sleep_time: answers.sleep_time,
          work_type: answers.work_type,
          work_hours: answers.work_hours,
          study_subject: answers.study_subject,
          productivity_killers: killers,
          productivity_boosters: answers.productivity_boosters,
          wellness_goals: answers.wellness_areas,
          wellness_habits: answers.wellness_habits,
          hobbies: hobbies,
          focus_areas: focus,
        }),
      })
      const result = await response.json()
      console.log('7. resultado IA:', result)

      if (!result.error && result.timeBlocks) {
        const blocksToInsert = result.timeBlocks.map((block: {
          title: string; category: string; start_time: string; end_time: string; weekdays: number[]
        }) => ({ ...block, user_id: user.id, is_base_routine: true }))
        const { error: blocksError } = await supabase.from('time_blocks').insert(blocksToInsert)
        console.log('8. blocksError:', blocksError)
      }
    } catch (err) {
      console.log('ERRO na IA:', err)
    }

    console.log('9. redirecionando...')
    router.replace('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-lg px-6 py-10">

        <div className="mb-2">
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>flow.</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text3)' }}>
            <span>Etapa {step} de {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: 'var(--hero)' }}
            />
          </div>
        </div>

        {step === 1 && <Step1 answers={answers} update={update} />}
        {step === 2 && <Step2 answers={answers} update={update} />}
        {step === 3 && <Step3 answers={answers} update={update} />}
        {step === 4 && <Step4 answers={answers} update={update} />}
        {step === 5 && <Step5 answers={answers} updateWellnessHabit={updateWellnessHabit} />}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
          ) : <div />}

          {step < TOTAL_STEPS ? (
            <Button onClick={nextStep}>Continuar</Button>
          ) : (
            <Button onClick={handleFinish} loading={loading}>
              Concluir e Gerar Rotina
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}