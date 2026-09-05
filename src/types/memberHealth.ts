import type { Timestamp } from 'firebase/firestore'

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
export type BloodType = (typeof BLOOD_TYPES)[number]

/** Confidential health record for a team member. Stored at
 *  `memberHealth/{teamMemberId}` (same id as the roster doc). Firestore rules
 *  restrict BOTH read and write to admins — this never reaches other accounts.
 *  The non-confidential subset below is mirrored to `memberEmergency/{id}` on
 *  every save so the rest of the team can pull it up in an emergency without
 *  seeing the full record. */
export interface MemberHealth {
  // Informações básicas de saúde
  bloodType?: BloodType
  allergies?: string
  medicationAllergies?: string
  healthConditions?: string
  continuousMedications?: string
  // Em caso de emergência
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactWhatsapp?: string
  emergencyAltPhone?: string
  // Plano de saúde
  hasHealthPlan?: boolean
  healthPlanName?: string
  healthPlanCardNumber?: string
  // Observações médicas adicionais
  medicalNotes?: string

  updatedAt?: Timestamp
  updatedBy?: string
}

/** Non-confidential subset visible to every internal team member via the
 *  "Ver informações de emergência" button. Mirrored from MemberHealth on save. */
export interface MemberEmergency {
  bloodType?: BloodType
  allergies?: string
  emergencyContactName?: string
  emergencyContactRelationship?: string
  emergencyContactWhatsapp?: string
  updatedAt?: Timestamp
}

/** Which MemberHealth keys get copied into the public emergency mirror. */
export const EMERGENCY_KEYS = [
  'bloodType',
  'allergies',
  'emergencyContactName',
  'emergencyContactRelationship',
  'emergencyContactWhatsapp',
] as const satisfies readonly (keyof MemberHealth)[]
