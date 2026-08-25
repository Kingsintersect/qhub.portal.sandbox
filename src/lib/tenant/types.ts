/** Colour roles the portal knows how to theme with. */
export type TenantBrandColors = {
  primary?: string
  accent?: string
  sidebar?: string
}

export type TenantBrandingConfig = {
  colors?: TenantBrandColors
  fontFamily?: string | null
}

/** Public branding for an institution — safe to show a signed-out visitor. */
export type TenantBranding = {
  name: string
  slug: string
  logoUrl: string | null
  supportEmail: string | null
  supportPhone: string | null
  tagline?: string | null
  websiteUrl?: string | null
  branding?: TenantBrandingConfig | null
}
