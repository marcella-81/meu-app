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

// ✅ Componente auxiliar: Seletor de Hábitos (fora do componente principal)
function HabitSelector({ 
  area, 
  currentHabits, 
  onUpdate,
  suggestions 
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
      ? currentHabits.filter((h: string) => h !== habit)
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
          <h3 className="font-medium text-gray-900">{areaLabels[area]}</h3>
          <p className="text-xs text-gray-500">
            {currentHabits.length}/3 hábitos selecionados
          </p>
        </div>
      </div>

      {/* Sugestões */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((habit: string) => (
          <button
            key={habit}
            onClick={() => toggleHabit(habit)}
            className={`px-3 py-1.5 rounded-full text-xs transition-all ${
              currentHabits.includes(habit)
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            } border`}
          >
            {habit}
          </button>
        ))}
      </div>

      {/* Input custom */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ou adicione um hábito personalizado..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addCustomHabit(customInput)
              setCustomInput('')
            }
          }}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
        <button
          onClick={() => {
            addCustomHabit(customInput)
            setCustomInput('')
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--hero)' }}
        >
          +
        </button>
      </div>

      {/* Hábitos selecionados */}
      {currentHabits.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {currentHabits.map((habit: string) => (
            <span
              key={habit}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
            >
              {habit}
              <button
                onClick={() => toggleHabit(habit)}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Step 1
function Step1({ answers, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Sua rotina básica</h2>
        <p className="text-sm text-gray-500 mt-1">Conta como é seu dia naturalmente</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Você é mais produtivo:</label>
        {['morning', 'evening', 'flexible'].map((option: string) => (
          <button
            key={option}
            onClick={() => update('chronotype', option)}
            className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
              answers.chronotype === option
                ? 'border-violet-600 bg-violet-50 text-violet-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {option === 'morning' && 'De manhã — acordo cedo e rendo mais cedo'}
            {option === 'evening' && 'À noite — sou mais focado no período da tarde/noite'}
            {option === 'flexible' && 'Flexível — não tenho um horário fixo de pico'}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-gray-700">Que horas acorda?</label>
          <input
            type="time"
            value={answers.wake_time}
            onChange={(e) => update('wake_time', e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-gray-700">Que horas dorme?</label>
          <input
            type="time"
            value={answers.sleep_time}
            onChange={(e) => update('sleep_time', e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
          />
        </div>
      </div>
    </div>
  )
}

// Step 2
function Step2({ answers, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Trabalho e estudo</h2>
        <p className="text-sm text-gray-500 mt-1">O que você faz no seu dia a dia</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">O que você faz? (trabalho/área)</label>
        <input
          type="text"
          placeholder="Ex: desenvolvedor, estudante de medicina, designer..."
          value={answers.work_type}
          onChange={(e) => update('work_type', e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Quantas horas por dia você trabalha ou estuda?</label>
        {['2-4h', '4-6h', '6-8h', '8h+'].map((option: string) => (
          <button
            key={option}
            onClick={() => update('work_hours', option)}
            className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
              answers.work_hours === option
                ? 'border-violet-600 bg-violet-50 text-violet-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Está estudando algo específico?</label>
        <input
          type="text"
          placeholder="Ex: inglês, programação, concurso... (opcional)"
          value={answers.study_subject}
          onChange={(e) => update('study_subject', e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
      </div>
    </div>
  )
}

// Step 3
function Step3({ answers, update }: StepProps) {
  const killers = ['Redes sociais', 'Celular', 'Procrastinação', 'Barulho', 'Desorganização', 'Cansaço']
  const boosters = ['Música', 'Silêncio', 'Pomodoro', 'Listas de tarefas', 'Exercício antes', 'Café']

  function toggle(field: string, value: string, current: string[]) {
    if (current.includes(value)) {
      update(field, current.filter((v: string) => v !== value))
    } else {
      update(field, [...current, value])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Sua produtividade</h2>
        <p className="text-sm text-gray-500 mt-1">O que te atrapalha e o que te ajuda</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">O que mais acaba com sua produtividade?</label>
        <div className="flex flex-wrap gap-2">
          {killers.map((item: string) => (
            <button
              key={item}
              onClick={() => toggle('productivity_killers', item, answers.productivity_killers)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                answers.productivity_killers.includes(item)
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">O que te deixa mais produtivo?</label>
        <div className="flex flex-wrap gap-2">
          {boosters.map((item: string) => (
            <button
              key={item}
              onClick={() => toggle('productivity_boosters', item, answers.productivity_boosters)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                answers.productivity_boosters.includes(item)
                  ? 'border-violet-600 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Step 4
function Step4({ answers, update }: StepProps) {
  const wellnessAreas = [
    { value: 'physical', label: 'Físico', icon: '💪', desc: 'Exercício, sono, energia' },
    { value: 'mental', label: 'Mental', icon: '🧠', desc: 'Foco, clareza, equilíbrio' },
    { value: 'diet', label: 'Dieta', icon: '🥗', desc: 'Nutrição, hidratação, hábitos' },
    { value: 'hobby', label: 'Hobby', icon: '🎨', desc: 'Lazer, criatividade, prazer' },
  ]

  function toggleArea(value: string) {
    const current: string[] = answers.wellness_areas
    const maxAreas = 4
    
    if (current.includes(value)) {
      update('wellness_areas', current.filter((v: string) => v !== value))
      const newHabits = { ...answers.wellness_habits }
      delete newHabits[value]
      update('wellness_habits', newHabits)
    } else if (current.length < maxAreas) {
      update('wellness_areas', [...current, value])
    } else {
      alert(`Você pode selecionar até ${maxAreas} áreas`)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Wellness</h2>
        <p className="text-sm text-gray-500 mt-1">
          Escolha até 4 áreas para focar (você definirá hábitos específicos na próxima etapa)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {wellnessAreas.map((area) => {
          const isSelected = answers.wellness_areas.includes(area.value)
          return (
            <button
              key={area.value}
              onClick={() => toggleArea(area.value)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{area.icon}</span>
                <span className="font-medium text-gray-900">{area.label}</span>
              </div>
              <p className="text-xs text-gray-500">{area.desc}</p>
              {isSelected && (
                <span className="inline-block mt-2 text-xs text-green-700 font-medium">
                  ✓ Selecionado
                </span>
              )}
            </button>
          )
        })}
      </div>

      {answers.wellness_areas.length > 0 && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 Na próxima etapa, você vai definir 2-3 hábitos específicos e mensuráveis 
            para cada área selecionada. Ex: &apos;Treinar 30min&apos;, &apos;Beber 2L de água&apos;, etc.
          </p>
        </div>
      )}
    </div>
  )
}

// Step 5
function Step5({ 
  answers, 
  updateWellnessHabit 
}: { 
  answers: Answers
  updateWellnessHabit: (area: string, habits: string[]) => void 
}) {
  const habitSuggestions: Record<string, string[]> = {
    physical: ['Treinar 30 minutos', 'Caminhar 10k passos', 'Dormir 7+ horas', 'Beber 2L de água', 'Alongar 10 minutos'],
    mental: ['Meditar 10 minutos', 'Ler 15 minutos', 'Escrever 3 coisas de gratidão', 'Fazer pausa a cada 2h'],
    diet: ['Bater metas de macros', 'Comer 5 refeições balanceadas', 'Zero açúcar refinado', 'Preparar marmita do dia'],
    hobby: ['Praticar instrumento 20min', 'Desenhar ou pintar', 'Escrever no journal', 'Cozinhar uma receita nova'],
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Defina seus hábitos</h2>
        <p className="text-sm text-gray-500 mt-1">
          Para cada área, escolha 2-3 hábitos mensuráveis que você quer construir
        </p>
      </div>

      {answers.wellness_areas.map((area: string) => (
        <HabitSelector
          key={area}
          area={area}
          currentHabits={answers.wellness_habits[area] || []}
          suggestions={habitSuggestions[area] || []}
          onUpdate={(habits) => updateWellnessHabit(area, habits)}
        />
      ))}

      <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
        <p className="text-sm text-amber-800">
          💡 Dica: Escolha hábitos que você consegue medir facilmente. 
          Em vez de &apos;ser mais saudável&apos;, prefira &apos;beber 2L de água por dia&apos;.
        </p>
      </div>
    </div>
  )
}

// ✅ Componente Principal
export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [answers, setAnswers] = useState({
    chronotype: '',
    wake_time: '',
    sleep_time: '',
    work_type: '',
    work_hours: '',
    study_subject: '',
    productivity_killers: [] as string[],
    productivity_boosters: [] as string[],
    wellness_areas: [] as string[],
    wellness_habits: {} as Record<string, string[]>,
    hobbies: [] as string[],
    focus_areas: [] as string[],
  })

  const router = useRouter()
  const supabase = createClient()

  function update(field: string, value: unknown) {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  function updateWellnessHabit(area: string, habits: string[]) {
    setAnswers(prev => ({
      ...prev,
      wellness_habits: {
        ...prev.wellness_habits,
        [area]: habits
      }
    }))
  }

  function nextStep() {
    if (step === 4 && answers.wellness_areas.length === 0) {
      alert('Selecione pelo menos 1 área de wellness para continuar')
      return
    }
    if (step === 5) {
      const hasEmptyArea = answers.wellness_areas.some(
        (area: string) => !answers.wellness_habits[area] || answers.wellness_habits[area].length === 0
      )
      if (hasEmptyArea) {
        alert('Defina pelo menos 1 hábito para cada área selecionada')
        return
      }
    }
    setStep(prev => prev + 1)
  }

  function prevStep() {
    setStep(prev => prev - 1)
  }

  // ✅ Helper para categorizar hábitos
  function getCategoryFromHabit(habit: string, area: string): string {
    const categories: Record<string, Record<string, string>> = {
      physical: {
        'treinar': 'exercise', 'academia': 'exercise', 'corrida': 'cardio',
        'alongar': 'flexibility', 'dormir': 'sleep', 'água': 'hydration', 'hidratação': 'hydration',
      },
      mental: {
        'meditar': 'mindfulness', 'meditação': 'mindfulness', 'ler': 'reading',
        'leitura': 'reading', 'journal': 'journaling', 'gratidão': 'gratitude',
        'pausa': 'breaks', 'respirar': 'breathing',
      },
      diet: {
        'macros': 'nutrition', 'proteína': 'nutrition', 'açúcar': 'restriction',
        'refeições': 'frequency', 'jejum': 'fasting', 'vitaminas': 'supplements',
      },
      hobby: {
        'violão': 'music', 'guitarra': 'music', 'desenhar': 'art', 'pintar': 'art',
        'jogar': 'gaming', 'cozinhar': 'cooking', 'escrever': 'writing',
      }
    }
    const habitLower = habit.toLowerCase()
    return categories[area]?.[habitLower] || 'custom'
  }

  // ✅ handleFinish corrigido
  async function handleFinish() {
    setLoading(true)

    const hobbies = answers.hobbies.filter((h: string) => h.trim() !== '')
    const killers = answers.productivity_killers.filter((k: string) => k.trim() !== '')
    const focus = answers.focus_areas.filter((f: string) => f.trim() !== '')

    const { data: { user } } = await supabase.auth.getUser()
      
    // ✅ CORREÇÃO: braces para early return
    if (!user) {
      setLoading(false)
      return
    }

    // 1️⃣ Salva o perfil
    await supabase.from('profiles').upsert({
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

    // 2️⃣ Salva hábitos de wellness
    const wellnessHabitsToInsert = Object.entries(answers.wellness_habits).flatMap(
      ([area, habits]: [string, string[]]) => 
        habits
          .filter((h: string) => h.trim() !== '')
          .map((habit: string) => ({
            user_id: user.id,
            area,
            title: habit.trim(),
            category: getCategoryFromHabit(habit, area),
            target_value: 1,
            is_active: true
          }))
    )

    if (wellnessHabitsToInsert.length > 0) {
      await supabase.from('wellness_habits').insert(wellnessHabitsToInsert)
    }

    // 3️⃣ Chama IA para gerar rotina
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
    const { timeBlocks, error } = result

    if (!error && timeBlocks) {
      const blocksToInsert = timeBlocks.map((block:  { title: string; category: string; start_time: string; end_time: string; weekdays: number[] }) => ({
        ...block,
        user_id: user.id,
        is_base_routine: true,
      }))
      await supabase.from('time_blocks').insert(blocksToInsert)
    }

    router.replace('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg px-6 py-10">

        {/* Barra de progresso */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Etapa {step} de {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full">
            <div
              className="h-1.5 bg-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Etapas */}
        {step === 1 && <Step1 answers={answers} update={update} />}
        {step === 2 && <Step2 answers={answers} update={update} />}
        {step === 3 && <Step3 answers={answers} update={update} />}
        {step === 4 && <Step4 answers={answers} update={update} />}
        {step === 5 && <Step5 answers={answers} updateWellnessHabit={updateWellnessHabit} />}

        {/* Navegação */}
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