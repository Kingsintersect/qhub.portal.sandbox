/** Per-institution controls the platform holds rather than the institution. */

export interface InstitutionFeature {
  key: string
  label: string
  category: string
  dependencies: string[]
  /** What the catalogue intended. Not necessarily what is in force. */
  defaultEnabled: boolean
  /** What the institution can actually reach right now. */
  enabled: boolean
  /**
   * Whether a flag row exists. False means the state was inherited rather than
   * decided — the portal reads a missing flag as enabled.
   */
  explicit: boolean
}

export interface MaintenanceNotice {
  message: string | null
  startsAt: string | null
  endsAt: string | null
  /** True once the window has opened; before that it is only a warning. */
  active: boolean
}
