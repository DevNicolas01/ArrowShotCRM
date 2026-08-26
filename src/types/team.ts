import type { BaseDoc } from './common'

/** Reserved for grouping users (e.g. "Social Media", "Tráfego Pago").
 *  Not surfaced in the UI yet, but kept so tasks/projects can scope to a team later. */
export interface Team extends BaseDoc {
  name: string
  memberIds: string[]
}

export interface Project extends BaseDoc {
  name: string
  clientId?: string
  description?: string
  archived: boolean
}
