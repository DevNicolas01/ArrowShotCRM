import { useEffect, useState } from 'react'
import type { FirestoreError, Unsubscribe } from 'firebase/firestore'

/** Wraps any `subscribe(onData, onError) => Unsubscribe` service function into
 *  { data, loading, error } state, and tears the listener down on unmount/dep change. */
export function useCollectionSubscription<T>(
  subscribe: (onData: (items: T[]) => void, onError?: (err: FirestoreError) => void) => Unsubscribe,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<FirestoreError | null>(null)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribe(
      (items) => {
        setData(items)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setError(err)
        setLoading(false)
      }
    )
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
