import { useEffect, useMemo } from 'react'
import { subscribeMyNotifications, deleteNotifications } from '../services/notificationService'
import type { AppNotification } from '../types'
import { isNotificationStale } from '../types/notification'
import { useCollectionSubscription } from './useCollectionSubscription'

/** `isAdmin` widens the underlying query to every notification in the
 *  platform (Bruno sees all — see firestore.rules), not just this user's
 *  own. `read` is a single field on the document, not per-viewer, so an
 *  admin browsing someone else's notification must never mark it read —
 *  `unreadCount` and the "unread" styling both stay scoped to `ownedByMe`,
 *  regardless of how wide the underlying list is. */
export function useNotifications(userId: string | undefined, isAdmin = false) {
  const { data, loading } = useCollectionSubscription<AppNotification>(
    (onData, onError) => subscribeMyNotifications(userId ?? '__none__', isAdmin, onData, onError),
    [userId, isAdmin]
  )

  const sorted = useMemo(
    () =>
      [...data]
        .filter((n) => !isNotificationStale(n))
        .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)),
    [data]
  )
  const own = useMemo(() => sorted.filter((n) => n.userId === userId), [sorted, userId])
  const unreadCount = useMemo(() => own.filter((n) => !n.read).length, [own])

  // 30-day retention has no backend job to enforce it — whichever client
  // loads a stale row just deletes it. Cheap and safe: same effect, run by
  // many users over time, just deletes the same already-gone doc harmlessly.
  useEffect(() => {
    const stale = data.filter(isNotificationStale)
    if (stale.length > 0) deleteNotifications(stale).catch(() => {})
  }, [data])

  return { notifications: sorted, ownNotifications: own, unreadCount, loading }
}
