import { subscribeInvites } from '../services/inviteService'
import type { Invite } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useInvites() {
  return useCollectionSubscription<Invite>((onData, onError) => subscribeInvites(onData, onError), [])
}
