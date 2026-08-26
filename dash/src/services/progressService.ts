import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { ModuleProgress } from '../types'

const COLLECTION = 'moduleProgress'
const colRef = collection(db, COLLECTION)

function progressId(userId: string, moduleId: string) {
  return `${userId}_${moduleId}`
}

export async function completeModule(params: {
  userId: string
  trailId: string
  moduleId: string
  quizScore: number
  checklistDone: boolean
}) {
  const { userId, trailId, moduleId, quizScore, checklistDone } = params
  await setDoc(doc(db, COLLECTION, progressId(userId, moduleId)), {
    userId,
    trailId,
    moduleId,
    completed: true,
    quizScore,
    checklistDone,
    completedAt: serverTimestamp(),
  })
}

/** All progress docs for one user, across every trail — filtered client-side
 *  per trail/module to keep this to a single listener and avoid extra indexes. */
export function subscribeUserProgress(
  userId: string,
  onData: (items: ModuleProgress[]) => void,
  onError?: (err: FirestoreError) => void
) {
  const q = query(colRef, where('userId', '==', userId))
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as ModuleProgress)),
    onError
  )
}

/** Admin-only: progress across every employee, for the "progresso por funcionário" view. */
export function subscribeAllProgress(
  onData: (items: ModuleProgress[]) => void,
  onError?: (err: FirestoreError) => void
) {
  return onSnapshot(
    colRef,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as ModuleProgress)),
    onError
  )
}
