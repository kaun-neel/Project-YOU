import { streamText } from 'ai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { query, nodes } = await req.json()

  if (!query?.trim()) {
    return new Response('Query required', { status: 400 })
  }

  // Build a context block from the user's actual captured nodes
  const contextBlock = Array.isArray(nodes) && nodes.length > 0
    ? nodes
        .map(
          (n: { title: string; type: string; summary: string; tags: string[]; source?: string }) =>
            `[${n.type.toUpperCase()}] "${n.title}"\nSummary: ${n.summary}\nTags: ${n.tags.join(', ')}${n.source ? `\nSource: ${n.source}` : ''}`,
        )
        .join('\n\n')
    : 'No notes captured yet.'

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: `You are a personal knowledge assistant. The user has captured notes, PDFs, URLs, and voice memos. Your job is to answer questions about their knowledge base with precision.

RULES:
- ONLY use information from the provided knowledge base context below.
- Always cite which specific notes you are drawing from by referencing their titles.
- If the information is not in the knowledge base, say so clearly.
- Be concise and direct. Do not pad your response.
- Speak in first person about "your notes" or "what you've saved".

KNOWLEDGE BASE:
${contextBlock}`,
    messages: [{ role: 'user', content: query }],
    maxOutputTokens: 600,
  })

  return result.toUIMessageStreamResponse()
}
