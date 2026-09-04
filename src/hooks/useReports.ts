import { subscribeReports } from '../services/reportService'
import type { Report } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useReports() {
  return useCollectionSubscription<Report>((onData, onError) => subscribeReports(onData, onError), [])
}
