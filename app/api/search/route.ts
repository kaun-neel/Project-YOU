import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { query, nodes } = await req.json()

  if (!query?.trim()) {
    return new Response('Query required', { status: 400 })
  }

  const contextBlock =
    Array.isArray(nodes) && nodes.length > 0
      ? nodes
          .map(
            (n: { title: string; type: string; summary: string; tags: string[]; source?: string }) =>
              `[${n.type.toUpperCase()}] "${n.title}"\nSummary: ${n.summary}\nTags: ${n.tags.join(', ')}${n.source ? `\nSource: ${n.source}` : ''}`,
          )
          .join('\n\n')
      : 'No notes captured yet.'

  const systemPrompt = `You are a personal knowledge assistant. Answer ONLY from the knowledge base below.
Always cite specific note titles. Be concise. If not in the knowledge base, say so.

KNOWLEDGE BASE:
${contextBlock}`

  const upstream = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      stream: true,
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
    }),
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    return new Response(err, { status: upstream.status })
  }

  // Pipe the SSE stream directly to the client
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
