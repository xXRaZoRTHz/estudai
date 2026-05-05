import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
});

export async function gerarConteudo(
  area: string,
  assunto: string,
  topicos: string[],
  nivel: 'básico' | 'intermediário' | 'avançado'
): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `És um tutor educativo. Explica em português de forma ${nivel} sobre o assunto "${assunto}" da área "${area}".
        
Cobre os seguintes tópicos: ${topicos.join(', ')}.

Estrutura a resposta com:
- Introdução
- Um título e explicação para cada tópico
- Conclusão

Usa linguagem clara e exemplos práticos.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

export async function gerarQuiz(
  assunto: string,
  topicos: string[],
  quantidade: number,
  dificuldade: 'fácil' | 'médio' | 'difícil'
): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Gera ${quantidade} perguntas de múltipla escolha em português sobre "${assunto}" com dificuldade ${dificuldade}.

Tópicos: ${topicos.join(', ')}.

Responde APENAS em JSON com este formato:
{
  "perguntas": [
    {
      "pergunta": "texto da pergunta",
      "alternativas": ["A", "B", "C", "D"],
      "correta": 0,
      "explicacao": "porquê esta é a resposta certa"
    }
  ]
}`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}