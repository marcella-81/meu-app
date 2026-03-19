import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  const { currentBlock, profile, status } = await request.json()

  let prompt = ''

  if (status === 'check') {
    prompt = `
Você é um assistente de produtividade pessoal amigável e direto.

O usuário tem o seguinte perfil:
- Trabalho/área: ${profile.work_type}
- O que atrapalha: ${profile.productivity_killers?.join(', ')}
- O que ajuda: ${profile.productivity_boosters?.join(', ')}
- Metas de wellness: ${profile.wellness_goals?.join(', ')}

Agora são ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} e o bloco atual é "${currentBlock.title}" (${currentBlock.category}).

Manda uma mensagem curta e motivadora de check-in — máximo 2 frases. 
Pergunta se está conseguindo seguir o bloco atual.
Seja natural, como um amigo que está acompanhando.
Não use emojis excessivos — no máximo 1.
`
  } else if (status === 'yes') {
    prompt = `
O usuário confirmou que está seguindo o bloco "${currentBlock.title}".
Manda uma mensagem curta de incentivo — máximo 1 frase.
Seja animado mas não exagerado.
`
  } else if (status === 'no') {
    prompt = `
O usuário disse que não está conseguindo seguir o bloco "${currentBlock.title}" (${currentBlock.category}).

Perfil do usuário:
- O que atrapalha: ${profile.productivity_killers?.join(', ')}
- O que ajuda: ${profile.productivity_boosters?.join(', ')}
- Hobbies: ${profile.hobbies?.join(', ')}

Sugira uma atividade alternativa leve mas produtiva que faça sentido para esse perfil.
Máximo 3 frases. Seja empático e prático.
Não force a rotina — às vezes um ajuste é melhor que forçar.
`
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Erro na IA' }, { status: 500 })
  }

  return NextResponse.json({ message: content.text })
}