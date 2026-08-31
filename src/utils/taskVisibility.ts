import { useAuth } from '../context/AuthContext'

/** The one person who sees every task regardless of who it's assigned to —
 *  matched by name, the same loose convention already used across the app
 *  to resolve "Bruno"/"Ciane"/"Janilson" without a dedicated role field. */
const UNRESTRICTED_VIEWER_NAME = 'bruno'

export function useTaskVisibility() {
  const { profile } = useAuth()
  const canSeeAllTasks = !!profile?.name?.toLowerCase().includes(UNRESTRICTED_VIEWER_NAME)
  return { canSeeAllTasks, viewerId: profile?.id }
}

/** Client-side task visibility: a task is visible only to its assignee,
 *  except for the unrestricted viewer (see above), who sees everything.
 *  Only for lists of individual tasks — aggregate/health computations (e.g.
 *  client status) must keep using the full, unfiltered task set. */
export function filterVisibleTasks<T extends { assignedTo?: string }>(
  tasks: T[],
  canSeeAllTasks: boolean,
  viewerId?: string
): T[] {
  if (canSeeAllTasks || !viewerId) return tasks
  return tasks.filter((t) => t.assignedTo === viewerId)
}
