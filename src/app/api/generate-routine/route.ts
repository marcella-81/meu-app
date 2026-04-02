import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const profile = await request.json()

    const prompt = `
Você é um assistente de produtividade pessoal. Com base no perfil abaixo, crie uma rotina base com time blocks para a semana.

PERFIL DO USUÁRIO:
- Cronotipo: ${profile.chronotype === 'morning' ? 'Matutino' : profile.chronotype === 'evening' ? 'Noturno' : 'Flexível'}
- Acorda: ${profile.wake_time}
- Dorme: ${profile.sleep_time}
- Trabalho/área: ${profile.work_type}
- Horas de trabalho por dia: ${profile.work_hours}
- Estudo atual: ${profile.study_subject || 'nenhum'}
- O que atrapalha: ${profile.productivity_killers?.join(', ') || 'nenhum'}
- O que ajuda: ${profile.productivity_boosters?.join(', ') || 'nenhum'}
- Wellness: ${profile.wellness_goals?.join(', ') || 'nenhum'}
- Hobbies: ${profile.hobbies?.join(', ') || 'nenhum'}
- Foco: ${profile.focus_areas?.join(', ') || 'nenhum'}

Crie entre 5 e 8 time blocks diários que façam sentido para esse perfil.

Responda APENAS com um array JSON válido, sem texto antes ou depois, neste formato exato:
[
  {
    "title": "Foco principal",
    "category": "work",
    "start_time": "09:00",
    "end_time": "11:00",
    "weekdays": [1,2,3,4,5]
  }
]

Categorias disponíveis: work, study, health, personal, rest
Weekdays: 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado, 0=domingo
`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ timeBlocks: [], error: 'Resposta inválida da IA' })
    }

    const clean = content.text.replace(/```json|```/g, '').trim()
    const timeBlocks = JSON.parse(clean)
    return NextResponse.json({ timeBlocks })

  } catch (err) {
    console.error('Erro na generate-routine:', err)
    // Retorna array vazio em vez de erro — o onboarding continua normalmente
    return NextResponse.json({ timeBlocks: [], error: 'IA indisponível' })
  }
}