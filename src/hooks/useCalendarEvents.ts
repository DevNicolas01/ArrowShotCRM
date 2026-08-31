import { subscribeCalendarEvents } from '../services/calendarService'
import type { CalendarEvent } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useCalendarEvents() {
  return useCollectionSubscription<CalendarEvent>((onData, onError) => subscribeCalendarEvents(onData, onError), [])
}
