import {
  collection,
  doc,
  addDoc,
  updateDoc as fsUpdateDoc,
  deleteDoc as fsDeleteDoc,
  getDoc as fsGetDoc,
  onSnapshot,
  query,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
  type FirestoreError,
} from 'firebase/firestore'
import { db } from '../firebase/config'

/** Generic, type-safe wrapper around a Firestore collection.
 *  Every module's service is a thin layer on top of this — new modules
 *  (googleAds, metaAds, leads...) reuse the same primitives, never reinvent them. */
export function collectionService<T extends DocumentData>(collectionName: string) {
  const colRef = collection(db, collectionName)

  return {
    colRef,

    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>, userId: string) {
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId,
      })
      return docRef.id
    },

    async update(id: string, data: Partial<T>, userId: string) {
      await fsUpdateDoc(doc(db, collectionName, id), {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      })
    },

    async remove(id: string) {
      await fsDeleteDoc(doc(db, collectionName, id))
    },

    async getById(id: string): Promise<T | null> {
      const snap = await fsGetDoc(doc(db, collectionName, id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as T) : null
    },

    subscribe(
      constraints: QueryConstraint[],
      onData: (items: T[]) => void,
      onError?: (error: FirestoreError) => void
    ) {
      const q = query(colRef, ...constraints)
      return onSnapshot(
        q,
        (snap) => {
          const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as T)
          onData(items)
        },
        onError
      )
    },
  }
}
