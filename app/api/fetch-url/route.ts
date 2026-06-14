import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url?.trim()) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  // Validate URL format
  let parsed: URL
  try {
    parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProjectYOU/1.0; +https://projectyou.app)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not fetch page (${res.status})` },
        { status: 422 },
      )
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      // Non-HTML resource (PDF, image, etc.) — return metadata only
      return NextResponse.json({
        title: parsed.pathname.split('/').pop() || parsed.hostname,
        description: `${contentType.split(';')[0]} resource from ${parsed.hostname}`,
        hostname: parsed.hostname,
        url: parsed.toString(),
      })
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    // Extract title
    const title =
      $('meta[property="og:title"]').attr('content')?.trim() ||
      $('meta[name="twitter:title"]').attr('content')?.trim() ||
      $('title').text().trim() ||
      parsed.hostname

    // Extract description
    const description =
      $('meta[property="og:description"]').attr('content')?.trim() ||
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[name="twitter:description"]').attr('content')?.trim() ||
      $('p').first().text().trim().slice(0, 200) ||
      ''

    // Extract image
    const image =
      $('meta[property="og:image"]').attr('content')?.trim() ||
      $('meta[name="twitter:image"]').attr('content')?.trim() ||
      null

    return NextResponse.json({
      title: title.slice(0, 120),
      description: description.slice(0, 300),
      image,
      hostname: parsed.hostname,
      url: parsed.toString(),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({ error: msg }, { status: 422 })
  }
}
