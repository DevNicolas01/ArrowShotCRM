import { doc, setDoc, getDoc, serverTimestamp, orderBy, getCountFromServer, type FirestoreError } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AppUser, UserRole } from '../types'
import { collectionService } from './firestore'

const COLLECTION = 'users'
const base = collectionService<AppUser>(COLLECTION)

/** Creates the Firestore profile doc for a freshly authenticated user, if missing.
 *  First user ever created becomes admin; everyone else starts as employee and
 *  waits for an admin to adjust their role. */
export async function ensureUserProfile(uid: string, email: string, name: string, photoURL?: string) {
  const ref = doc(db, COLLECTION, uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data() as AppUser

  let role: UserRole = 'employee'
  try {
    const countSnap = await getCountFromServer(base.colRef)
    role = countSnap.data().count === 0 ? 'admin' : 'employee'
  } catch {
    role = 'employee'
  }

  const profile = {
    name,
    email,
    photoURL: photoURL ?? null,
    role,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, profile)
  return { id: uid, ...profile } as unknown as AppUser
}

export function getUserProfile(uid: string) {
  return base.getById(uid)
}

export function subscribeUsers(onData: (items: AppUser[]) => void, onError?: (err: FirestoreError) => void) {
  return base.subscribe([orderBy('name', 'asc')], onData, onError)
}

export async function updateUserRole(uid: string, role: UserRole, actingUserId: string) {
  await base.update(uid, { role }, actingUserId)
}

export async function updateUserActive(uid: string, active: boolean, actingUserId: string) {
  await base.update(uid, { active }, actingUserId)
}

export async function updateUserPhoto(uid: string, photoURL: string) {
  await base.update(uid, { photoURL }, uid)
}
