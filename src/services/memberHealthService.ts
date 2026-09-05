import { doc, onSnapshot, serverTimestamp, writeBatch, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase/config'
import { EMERGENCY_KEYS, type MemberEmergency, type MemberHealth } from '../types'

const HEALTH_COLLECTION = 'memberHealth'
const EMERGENCY_COLLECTION = 'memberEmergency'

/** Full confidential record — the subscription errors out for non-admins
 *  (Firestore rules), which the caller surfaces as "sem permissão". */
export function subscribeMemberHealth(
  memberId: string,
  onData: (data: MemberHealth | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, HEALTH_COLLECTION, memberId),
    (snap) => onData(snap.exists() ? (snap.data() as MemberHealth) : null),
    (err) => {
      console.error(err)
      onError?.(err)
    }
  )
}

/** Non-confidential subset — readable by any internal team member. */
export function subscribeMemberEmergency(
  memberId: string,
  onData: (data: MemberEmergency | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, EMERGENCY_COLLECTION, memberId),
    (snap) => onData(snap.exists() ? (snap.data() as MemberEmergency) : null),
    (err) => {
      console.error(err)
      onError?.(err)
    }
  )
}

/** Persists the health record and, atomically, refreshes its public emergency
 *  mirror. `setDoc` (no merge) so fields the admin cleared actually disappear —
 *  the Firestore SDK is configured with ignoreUndefinedProperties, so empty
 *  optional fields are simply omitted. */
export async function saveMemberHealth(memberId: string, data: MemberHealth, userId: string) {
  const emergency: MemberEmergency = {}
  for (const key of EMERGENCY_KEYS) {
    const value = data[key]
    if (value !== undefined && value !== '') {
      // key is constrained to the shared subset, so the assignment is safe
      ;(emergency as Record<string, unknown>)[key] = value
    }
  }

  const batch = writeBatch(db)
  batch.set(doc(db, HEALTH_COLLECTION, memberId), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  })
  batch.set(doc(db, EMERGENCY_COLLECTION, memberId), {
    ...emergency,
    updatedAt: serverTimestamp(),
  })
  await batch.commit()
}
