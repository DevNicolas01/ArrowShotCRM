import { useEffect, useState } from 'react'
import { subscribeMemberEmergency, subscribeMemberHealth } from '../services/memberHealthService'
import type { MemberEmergency, MemberHealth } from '../types'

/** Confidential record — `denied` flips true when Firestore rules reject the
 *  read (i.e. the viewer is not an admin). */
export function useMemberHealth(memberId: string | null) {
  const [data, setData] = useState<MemberHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    if (!memberId) return
    setLoading(true)
    setDenied(false)
    const unsub = subscribeMemberHealth(
      memberId,
      (d) => {
        setData(d)
        setLoading(false)
      },
      () => {
        setDenied(true)
        setLoading(false)
      }
    )
    return unsub
  }, [memberId])

  return { data, loading, denied }
}

export function useMemberEmergency(memberId: string | null) {
  const [data, setData] = useState<MemberEmergency | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!memberId) return
    setLoading(true)
    const unsub = subscribeMemberEmergency(
      memberId,
      (d) => {
        setData(d)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsub
  }, [memberId])

  return { data, loading }
}
