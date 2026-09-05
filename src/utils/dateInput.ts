import { Timestamp } from 'firebase/firestore'

/** Round-trip helpers for `<input type="date">` values ("yyyy-MM-dd", no time).
 *
 *  A date-only field must stay on the user's LOCAL calendar day. The naïve
 *  `new Date("2026-09-05")` parses as UTC midnight, which is still the day
 *  before in any negative-offset timezone (America/Sao_Paulo included) — so
 *  the stored Timestamp lands on the wrong day for every downstream local-time
 *  check (isToday, startOfDay, the due-date sweep, the dashboard buckets…).
 *  These two keep both directions anchored to midnight local time. */

export function dateInputToTimestamp(value: string): Timestamp | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return Timestamp.fromDate(new Date(y, m - 1, d))
}

export function timestampToDateInput(ts?: Timestamp | null): string {
  if (!ts) return ''
  const d = ts.toDate()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}
