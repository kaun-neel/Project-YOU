import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

// A realistic desktop browser User-Agent. Many sites and bot-protection
// services (e.g. Cloudflare) reject requests from non-browser agents with a
// 403/429, so we present ourselves as a normal browser.
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
}

// Minimal metadata derived purely from the URL, used as a graceful fallback
// when a page can't be fetched or parsed.
function fallbackMeta(parsed: URL) {
  const lastSegment = parsed.pathname.split('/').filter(Boolean).pop()
  const title = lastSegment
    ? decodeURIComponent(lastSegment).replace(/[-_]+/g, ' ')
    : parsed.hostname
  return {
    title: title.slice(0, 120),
    description: `Saved from ${parsed.hostname}`,
    image: null as string | null,
    hostname: parsed.hostname,
    url: parsed.toString(),
  }
}

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

  // Only allow http(s) schemes.
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(parsed.toString(), {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    // Network error / timeout — still let the user save the URL.
    return NextResponse.json(fallbackMeta(parsed))
  }

  // If the site blocks us (403/429) or otherwise errors, don't fail the
  // capture — return hostname-based metadata so the URL can still be saved.
  if (!res.ok) {
    return NextResponse.json(fallbackMeta(parsed))
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    // Non-HTML resource (PDF, image, etc.) — return metadata only
    return NextResponse.json({
      title: parsed.pathname.split('/').pop() || parsed.hostname,
      description: `${contentType.split(';')[0]} resource from ${parsed.hostname}`,
      image: null,
      hostname: parsed.hostname,
      url: parsed.toString(),
    })
  }

  try {
    const html = await res.text()
    const $ = cheerio.load(html)

    // The final URL after any redirects — used to resolve relative links.
    const baseUrl = res.url || parsed.toString()

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
      `Saved from ${parsed.hostname}`

    // Extract image, then resolve relative / protocol-relative URLs to
    // absolute so the client preview can actually load it.
    const rawImage =
      $('meta[property="og:image"]').attr('content')?.trim() ||
      $('meta[name="twitter:image"]').attr('content')?.trim() ||
      $('link[rel="image_src"]').attr('href')?.trim() ||
      null

    let image: string | null = null
    if (rawImage) {
      try {
        image = new URL(rawImage, baseUrl).toString()
      } catch {
        image = null
      }
    }

    return NextResponse.json({
      title: title.slice(0, 120),
      description: description.slice(0, 300),
      image,
      hostname: parsed.hostname,
      url: parsed.toString(),
    })
  } catch {
    // Parsing failed — still return usable fallback metadata.
    return NextResponse.json(fallbackMeta(parsed))
  }
}
