/** Extracts a YouTube video id from watch/short/embed URL formats and
 *  returns an embeddable URL, or null if the input isn't a recognizable
 *  YouTube link. */
export function toYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    let id: string | null = null
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1)
    } else if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') id = u.searchParams.get('v')
      else if (u.pathname.startsWith('/embed/')) id = u.pathname.replace('/embed/', '')
      else if (u.pathname.startsWith('/shorts/')) id = u.pathname.replace('/shorts/', '')
    }
    return id ? `https://www.youtube.com/embed/${id}` : null
  } catch {
    return null
  }
}
