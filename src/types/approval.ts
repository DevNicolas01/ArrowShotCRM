import type { BaseDoc } from './common'

export type ApprovalAction = 'approved' | 'change_requested'

export interface Approval extends BaseDoc {
  contentId: string
  clientId: string
  action: ApprovalAction
  comment?: string
  /** future: public token used for external client approval links */
  publicToken?: string
}
