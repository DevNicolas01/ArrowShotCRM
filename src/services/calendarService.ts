import { orderBy, where, getDocs, query, type FirestoreError } from 'firebase/firestore'
import type { CalendarEvent } from '../types'
import { collectionService } from './firestore'

const COLLECTION = 'calendarEvents'
const base = collectionService<CalendarEvent>(COLLECTION)

/** Custom one-off events (e.g. "Reunião de pauta", "Gravação externa").
 *  Content publication dates and task due dates are read directly from their
 *  own collections in useCalendar — no denormalized sync required for those. */
export async function createCalendarEvent(
  data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  userId: string
) {
  return base.create(data, userId)
}

export async function deleteCalendarEvent(id: string) {
  await base.remove(id)
}

export function subscribeCalendarEvents(
  onData: (items: CalendarEvent[]) => void,
  onError?: (err: FirestoreError) => void
) {
  return base.subscribe([orderBy('date', 'asc')], onData, onError)
}

/** One-shot fetch (not a live listener) — used by the client-deletion
 *  cascade, which needs a snapshot to batch-delete. */
export async function getClientCalendarEvents(clientId: string): Promise<CalendarEvent[]> {
  const snap = await getDocs(query(base.colRef, where('clientId', '==', clientId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as CalendarEvent)
}
