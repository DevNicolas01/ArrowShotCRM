import { useCallback, useEffect, useState } from 'react'
import {
  clearAccessToken,
  getCachedAccessToken,
  listUpcomingEvents,
  requestAccessToken,
  type GoogleCalendarEvent,
} from '../services/googleCalendarService'

export function useGoogleCalendar() {
  const [connected, setConnected] = useState(!!getCachedAccessToken())
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const token = getCachedAccessToken()
    if (!token) {
      setConnected(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const items = await listUpcomingEvents(token)
      setEvents(items)
      setConnected(true)
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar sua agenda. Tente conectar de novo.')
      clearAccessToken()
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (connected) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connect = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await requestAccessToken(true)
      setConnected(true)
      await refresh()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }, [refresh])

  const disconnect = useCallback(() => {
    clearAccessToken()
    setConnected(false)
    setEvents([])
  }, [])

  return { connected, events, loading, error, connect, disconnect, refresh }
}
