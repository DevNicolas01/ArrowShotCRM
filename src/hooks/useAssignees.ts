import { useMemo } from 'react'
import { useUsers } from './useUsers'
import { useTeamMembers } from './useTeamMembers'

/** A person who can be set as a task's `assignedTo`. */
export interface Assignee {
  id: string
  name: string
  photoURL?: string
  /** true when this person has no login account yet — only a roster entry
   *  (e.g. Bruno, Jamilson). They still work as an assignee; they just won't
   *  receive in-app notifications until an account is created for them. */
  rosterOnly?: boolean
}

/**
 * Assignable people for tasks: every login account (`users`) plus the active
 * Equipe roster members who don't have an account linked yet. Keeps the
 * team's real people (Bruno, Jamilson) selectable as responsáveis even before
 * their Firebase accounts exist. Roster-only people are keyed by their
 * `teamMembers` doc id.
 */
export function useAssignees(): Assignee[] {
  const { data: users } = useUsers()
  const { data: members } = useTeamMembers()

  return useMemo(() => {
    const list: Assignee[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      photoURL: u.photoURL ?? undefined,
    }))
    const takenNames = new Set(users.map((u) => u.name.trim().toLowerCase()))

    for (const m of members) {
      if (m.status !== 'active' || m.userId) continue
      if (takenNames.has(m.name.trim().toLowerCase())) continue
      list.push({ id: m.id, name: m.name, photoURL: m.photoURL ?? undefined, rosterOnly: true })
    }

    return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [users, members])
}

/** `assignedTo` id -> Assignee, for resolving names/avatars in task lists. */
export function useAssigneeMap(): Record<string, Assignee> {
  const assignees = useAssignees()
  return useMemo(() => Object.fromEntries(assignees.map((a) => [a.id, a])), [assignees])
}
