import { orderBy, where, doc, writeBatch, type QueryConstraint, type FirestoreError } from 'firebase/firestore'
import type { AppUser, Client } from '../types'
import { db } from '../firebase/config'
import { collectionService } from './firestore'
import { logActivity } from './activityService'
import { createNotification } from './notificationService'
import { getClientTasks } from './taskService'
import { getClientContents } from './contentService'
import { getClientCalendarEvents } from './calendarService'
import { getClientMeetings } from './meetingService'
import { getInternalStaffIds } from '../utils/userLookup'

const COLLECTION = 'clients'
const base = collectionService<Client>(COLLECTION)

/** `users`, when given, notifies the whole internal team (everyone but the
 *  creator) that a new client was registered. Optional + defaults to []
 *  purely so this stays callable from anywhere that doesn't happen to have
 *  the users list handy — no notification fires in that case. */
export async function createClient(
  data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  userId: string,
  userName: string,
  users: AppUser[] = []
) {
  const id = await base.create(data, userId)
  await logActivity({
    entityType: 'client',
    entityId: id,
    clientId: id,
    action: 'created',
    message: `criou o cliente "${data.companyName}"`,
    userId,
    userName,
  })

  const hasTraffic = !!data.modules?.paidTraffic
  const hasSocial = !!data.modules?.socialMedia
  const serviceLabel = hasTraffic && hasSocial ? 'Ambos' : hasTraffic ? 'Tráfego' : hasSocial ? 'Social Mídia' : 'Não definido'
  const message = `🆕 Novo cliente cadastrado: ${data.companyName}\nServiço: ${serviceLabel}\nCadastrado por: ${userName}`

  const recipientIds = getInternalStaffIds(users).filter((uid) => uid !== userId)
  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        userId: recipientId,
        type: 'new_client',
        message,
        actorName: userName,
        entityType: 'client',
        entityId: id,
      })
    )
  )

  return id
}

export async function updateClient(
  id: string,
  data: Partial<Client>,
  userId: string,
  userName: string
) {
  await base.update(id, data, userId)
  await logActivity({
    entityType: 'client',
    entityId: id,
    clientId: id,
    action: 'updated',
    message: 'atualizou os dados do cliente',
    userId,
    userName,
  })
}

/** Deletes a client and cascades to every task/content that references it —
 *  Firestore has no referential integrity, so orphaned tasks/contents would
 *  otherwise linger forever (invisible in the UI, but still counted by any
 *  code that queries the collection directly, e.g. dashboard buckets). */
export async function deleteClient(client: Client, userId: string, userName: string) {
  const [tasks, contents, calendarEvents, meetings] = await Promise.all([
    getClientTasks(client.id),
    getClientContents(client.id),
    getClientCalendarEvents(client.id),
    getClientMeetings(client.id),
  ])

  const batch = writeBatch(db)
  for (const task of tasks) batch.delete(doc(db, 'tasks', task.id))
  for (const content of contents) batch.delete(doc(db, 'contents', content.id))
  for (const event of calendarEvents) batch.delete(doc(db, 'calendarEvents', event.id))
  for (const meeting of meetings) batch.delete(doc(db, 'meetings', meeting.id))
  batch.delete(doc(db, 'clients', client.id))
  await batch.commit()

  await logActivity({
    entityType: 'client',
    entityId: client.id,
    clientId: client.id,
    action: 'deleted',
    message: `excluiu o cliente "${client.companyName}" (${tasks.length} tarefa(s), ${contents.length} conteúdo(s), ${calendarEvents.length} evento(s) e ${meetings.length} reunião(ões) removidos junto)`,
    userId,
    userName,
  })
}

export function getClient(id: string) {
  return base.getById(id)
}

export function subscribeClients(
  onData: (items: Client[]) => void,
  filters?: { status?: string },
  onError?: (err: FirestoreError) => void
) {
  const constraints: QueryConstraint[] = [orderBy('companyName', 'asc')]
  if (filters?.status) constraints.unshift(where('status', '==', filters.status))
  return base.subscribe(constraints, onData, onError)
}
