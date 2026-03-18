'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

const TOTAL_STEPS = 4

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
    wellness_goals: [] as string[],
    hobbies: [] as string[],
    focus_areas: [] as string[],
  })


  const router = useRouter()
  const supabase = createClient()

  function update(field: string, value: unknown) {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  function nextStep() {
    setStep(prev => prev + 1)
  }

  function prevStep() {
    setStep(prev => prev - 1)
  }

  async function handleFinish() {
  setLoading(true)

  const hobbies = answers.hobbies.filter(h => h.trim() !== '')
  const killers = answers.productivity_killers.filter(k => k.trim() !== '')
  const wellness = answers.wellness_goals.filter(w => w.trim() !== '')
  const focus = answers.focus_areas.filter(f => f.trim() !== '')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Salva o perfil no banco
  await supabase.from('profiles').upsert({
    user_id: user.id,
    chronotype: answers.chronotype || 'flexible',
    work_type: answers.work_type.trim() || 'não informado',
    productivity_killers: killers,
    hobbies: hobbies,
    wellness_goals: wellness,
    long_term_goals: focus,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  // Chama a IA para gerar a rotina
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
      wellness_goals: wellness,
      hobbies: hobbies,
      focus_areas: focus,
    }),
  })

  const { timeBlocks, error } = await response.json()

  if (!error && timeBlocks) {
    // Salva os time blocks no banco
    const blocksToInsert = timeBlocks.map((block: any) => ({
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

        {/* Navegação */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button variant="ghost" onClick={prevStep}>Voltar</Button>
          ) : (
            <div />
          )}
          {step < TOTAL_STEPS ? (
            <Button onClick={nextStep}>Continuar</Button>
          ) : (
            <Button onClick={handleFinish} loading={loading}>
              Concluir
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

function Step1({ answers, update }: { answers: any, update: any }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Sua rotina básica</h2>
        <p className="text-sm text-gray-500 mt-1">Conta como é seu dia naturalmente</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Você é mais produtivo:</label>
        {['morning', 'evening', 'flexible'].map(option => (
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
            onChange={e => update('wake_time', e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-gray-700">Que horas dorme?</label>
          <input
            type="time"
            value={answers.sleep_time}
            onChange={e => update('sleep_time', e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
          />
        </div>
      </div>
    </div>
  )
}

function Step2({ answers, update }: { answers: any, update: any }) {
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
          onChange={e => update('work_type', e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Quantas horas por dia você trabalha ou estuda?</label>
        {['2-4h', '4-6h', '6-8h', '8h+'].map(option => (
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
          onChange={e => update('study_subject', e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
      </div>
    </div>
  )
}

function Step3({ answers, update }: { answers: any, update: any }) {
  const killers = ['Redes sociais', 'Celular', 'Procrastinação', 'Barulho', 'Desorganização', 'Cansaço']
  const boosters = ['Música', 'Silêncio', 'Pomodoro', 'Listas de tarefas', 'Exercício antes', 'Café']

  function toggle(field: string, value: string, current: string[]) {
    if (current.includes(value)) {
      update(field, current.filter(v => v !== value))
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
          {killers.map(item => (
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
          {boosters.map(item => (
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

function Step4({ answers, update }: { answers: any, update: any }) {
  const wellness = ['Academia', 'Corrida', 'Meditação', 'Dieta', 'Sono melhor', 'Saúde mental']
  const focusAreas = ['Carreira', 'Estudos', 'Relacionamentos', 'Finanças', 'Saúde', 'Criatividade']

  function toggle(field: string, value: string, current: string[]) {
    if (current.includes(value)) {
      update(field, current.filter(v => v !== value))
    } else {
      update(field, [...current, value])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Wellness e foco</h2>
        <p className="text-sm text-gray-500 mt-1">O que você quer desenvolver</p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Quais áreas de saúde quer trabalhar?</label>
        <div className="flex flex-wrap gap-2">
          {wellness.map(item => (
            <button
              key={item}
              onClick={() => toggle('wellness_goals', item, answers.wellness_goals)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                answers.wellness_goals.includes(item)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Quais áreas da vida quer focar?</label>
        <div className="flex flex-wrap gap-2">
          {focusAreas.map(item => (
            <button
              key={item}
              onClick={() => toggle('focus_areas', item, answers.focus_areas)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                answers.focus_areas.includes(item)
                  ? 'border-violet-600 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Quais são seus hobbies?</label>
        <input
          type="text"
          placeholder="Ex: guitarra, leitura, jogos, culinária..."
          onBlur={e => update('hobbies', e.target.value.split(',').map(h => h.trim()))}
          defaultValue={answers.hobbies.join(', ')}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-violet-500"
        />
        <span className="text-xs text-gray-400">Separa por vírgula</span>
      </div>
    </div>
  )
}