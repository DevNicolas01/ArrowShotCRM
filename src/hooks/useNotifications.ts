import { useMemo } from 'react'
import { subscribeMyNotifications } from '../services/notificationService'
import type { AppNotification } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useNotifications(userId: string | undefined) {
  const { data, loading } = useCollectionSubscription<AppNotification>(
    (onData, onError) => subscribeMyNotifications(userId ?? '__none__', onData, onError),
    [userId]
  )

  const sorted = useMemo(
    () => [...data].sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)),
    [data]
  )
  const unreadCount = useMemo(() => sorted.filter((n) => !n.read).length, [sorted])

  return { notifications: sorted, unreadCount, loading }
}
