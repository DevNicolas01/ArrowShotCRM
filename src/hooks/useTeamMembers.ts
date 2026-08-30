import { subscribeTeamMembers } from '../services/teamMemberService'
import type { TeamMember } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useTeamMembers() {
  return useCollectionSubscription<TeamMember>((onData, onError) => subscribeTeamMembers(onData, onError), [])
}
