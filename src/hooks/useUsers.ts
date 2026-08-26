import { subscribeUsers } from '../services/userService'
import type { AppUser } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useUsers() {
  return useCollectionSubscription<AppUser>((onData, onError) => subscribeUsers(onData, onError), [])
}
