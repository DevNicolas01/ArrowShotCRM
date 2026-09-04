import { Timestamp } from 'firebase/firestore'
import type { Meeting, MeetingInput, MeetingType } from '../../types'

export interface ActionItemFormState {
  id: string
  description: string
  assignedTo: string
  dueDateStr: string
  /** Carried through once the action item has been turned into a real task
   *  (see meetingService) — the form never sets or clears this itself. */
  taskId?: string
}

export interface MeetingFormState {
  type: MeetingType
  dateStr: string
  time: string
  participantIds: string[]
  clientId: string
  agenda: string
  decisions: string
  actionItems: ActionItemFormState[]
  recordingLink: string
  notes: string
}

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function buildDefaultMeetingForm(overrides?: Partial<MeetingFormState>): MeetingFormState {
  return {
    type: 'daily',
    dateStr: toDateStr(new Date()),
    time: '',
    participantIds: [],
    clientId: '',
    agenda: '',
    decisions: '',
    actionItems: [],
    recordingLink: '',
    notes: '',
    ...overrides,
  }
}

export function meetingToFormState(meeting: Meeting): MeetingFormState {
  return {
    type: meeting.type,
    dateStr: toDateStr(meeting.date.toDate()),
    time: meeting.time ?? '',
    participantIds: meeting.participantIds ?? [],
    clientId: meeting.clientId ?? '',
    agenda: meeting.agenda ?? '',
    decisions: meeting.decisions ?? '',
    actionItems: (meeting.actionItems ?? []).map((a) => ({
      id: a.id,
      description: a.description,
      assignedTo: a.assignedTo ?? '',
      dueDateStr: a.dueDate ? toDateStr(a.dueDate.toDate()) : '',
      taskId: a.taskId,
    })),
    recordingLink: meeting.recordingLink ?? '',
    notes: meeting.notes ?? '',
  }
}

export function formStateToMeetingInput(state: MeetingFormState): MeetingInput {
  const [y, m, d] = state.dateStr.split('-').map(Number)
  return {
    type: state.type,
    date: Timestamp.fromDate(new Date(y, m - 1, d)),
    time: state.time || undefined,
    participantIds: state.participantIds,
    clientId: state.type === 'client' ? state.clientId || undefined : undefined,
    agenda: state.agenda.trim() || undefined,
    decisions: state.decisions.trim() || undefined,
    actionItems: state.actionItems
      .filter((a) => a.description.trim())
      .map((a) => ({
        id: a.id,
        description: a.description.trim(),
        assignedTo: a.assignedTo || undefined,
        dueDate: a.dueDateStr ? Timestamp.fromDate(new Date(`${a.dueDateStr}T00:00:00`)) : null,
        taskId: a.taskId,
      })),
    recordingLink: state.recordingLink.trim() || undefined,
    notes: state.notes.trim() || undefined,
  }
}
