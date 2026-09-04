import { orderBy, type FirestoreError } from 'firebase/firestore'
import type { Report, ReportInput } from '../types'
import { collectionService } from './firestore'
import { logActivity } from './activityService'

const COLLECTION = 'reports'
const base = collectionService<Report>(COLLECTION)

export async function createReport(data: ReportInput, userId: string, userName: string) {
  const id = await base.create(data, userId)
  await logActivity({
    entityType: 'report',
    entityId: id,
    clientId: data.clientId,
    action: 'created',
    message: `gerou o relatório ${data.type === 'weekly' ? 'semanal' : 'mensal'}`,
    userId,
    userName,
  })
  return id
}

export async function deleteReport(report: Report, userId: string, userName: string) {
  await base.remove(report.id)
  await logActivity({
    entityType: 'report',
    entityId: report.id,
    clientId: report.clientId,
    action: 'deleted',
    message: 'excluiu um relatório',
    userId,
    userName,
  })
}

export function getReport(id: string) {
  return base.getById(id)
}

export function subscribeReports(onData: (items: Report[]) => void, onError?: (err: FirestoreError) => void) {
  return base.subscribe([orderBy('createdAt', 'desc')], onData, onError)
}
