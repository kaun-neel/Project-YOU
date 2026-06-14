import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'

export async function POST(req: NextRequest) {
  try {
    const { query, nodes } = await req.json()

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    // Build context from captured nodes
    const contextBlock =
      Array.isArray(nodes) && nodes.length > 0
        ? nodes
            .map(
              (n: {
                title: string
                type: string
                summary: string
                tags: string[]
                source?: string
              }) =>
                `[${n.type.toUpperCase()}] "${n.title}"\nSummary: ${n.summary}\nTags: ${n.tags.join(', ')}${n.source ? `\nSource: ${n.source}` : ''}`,
            )
            .join('\n\n')
        : 'No notes captured yet.'

    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: `You are a personal knowledge assistant. The user has captured notes, PDFs, URLs, and voice memos. Your job is to answer questions about their knowledge base.

RULES:
- Only use information from the provided knowledge base context below.
- Always cite specific note titles you are drawing from.
- If the information is not in the knowledge base, say so clearly.
- Be concise and direct. Do not pad your response.
- Speak in first person about "your notes" or "what you've saved".

KNOWLEDGE BASE:
${contextBlock}`,
      messages: [{ role: 'user', content: query }],
      maxTokens: 600,
    })

    // Stream as plain text/event-stream that search-view can parse
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`),
            )
          }
          controller.close()
        } catch (err) {
          console.error('[v0] Stream error:', err)
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[v0] Search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
