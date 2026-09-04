const CLIENT_COLOR_PALETTE = [
  'text-blue-600',
  'text-violet-600',
  'text-emerald-600',
  'text-amber-600',
  'text-pink-600',
  'text-cyan-600',
  'text-orange-600',
  'text-teal-600',
  'text-indigo-600',
  'text-rose-600',
]

/** Deterministic text-color class for a client, so the same client always
 *  reads in the same color across the Social Media board cards without
 *  storing a color field. */
export function clientHashColor(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return CLIENT_COLOR_PALETTE[hash % CLIENT_COLOR_PALETTE.length]
}
