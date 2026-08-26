import type { Timestamp } from 'firebase/firestore'
import type { BaseDoc } from './common'

export type CalendarEventType = 'content' | 'task' | 'custom'

/** Denormalized calendar entry. Contents/tasks with dates are projected here
 *  (or read directly — see calendarService) so the calendar can query one
 *  cheap collection instead of fanning out across modules as more are added. */
export interface CalendarEvent extends BaseDoc {
  title: string
  type: CalendarEventType
  date: Timestamp
  time?: string
  clientId?: string
  refType?: 'content' | 'task'
  refId?: string
}
