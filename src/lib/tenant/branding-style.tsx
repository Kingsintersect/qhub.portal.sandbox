"use client"

import { useTenant } from "@/lib/tenant/tenant-context"

/**
 * Applies the institution's colours to the portal.
 *
 * The design system is already driven by CSS custom properties (--primary,
 * --accent, --sidebar in globals.css), so theming an institution is a matter of
 * overriding those at :root rather than threading colours through components.
 * Anything the institution has not set simply falls through to the default
 * palette.
 */
export function TenantBrandingStyle() {
  const tenant = useTenant()
  const colors = tenant?.branding?.colors
  const fontFamily = tenant?.branding?.fontFamily

  const declarations: string[] = []

  if (colors?.primary && isHexColor(colors.primary)) {
    const foreground = readableForeground(colors.primary)

    // --ring and --sidebar-primary track the primary colour; leaving them on
    // the default would make focus rings and the active nav item clash with
    // the institution's own brand.
    declarations.push(
      `--primary: ${colors.primary}`,
      `--primary-foreground: ${foreground}`,
      `--ring: ${colors.primary}`,
      `--sidebar-primary: ${colors.primary}`,
      `--sidebar-primary-foreground: ${foreground}`
    )
  }

  if (colors?.accent && isHexColor(colors.accent)) {
    declarations.push(
      `--accent: ${colors.accent}`,
      `--accent-foreground: ${readableForeground(colors.accent)}`
    )
  }

  if (colors?.sidebar && isHexColor(colors.sidebar)) {
    declarations.push(
      `--sidebar: ${colors.sidebar}`,
      `--sidebar-foreground: ${readableForeground(colors.sidebar)}`
    )
  }

  if (fontFamily && isSafeFontFamily(fontFamily)) {
    declarations.push(`--font-sans: ${fontFamily}`)
  }

  if (declarations.length === 0) {
    return null
  }

  // Values are validated above rather than trusted: they arrive from the API
  // and land inside a style element, so anything unvalidated would be an
  // injection point.
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root{${declarations.join(";")}}`,
      }}
    />
  )
}

function isHexColor(value: string): boolean {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)
}

/** Letters, spaces, commas, hyphens and quotes only — no braces or semicolons. */
function isSafeFontFamily(value: string): boolean {
  return /^[\w\s,'"-]{1,80}$/.test(value)
}

/**
 * Black or white, whichever stays readable on the given colour.
 *
 * Without this an institution picking a pale brand colour gets white text on a
 * near-white button — the kind of thing a colour picker invites and nobody
 * notices until it ships.
 */
function readableForeground(hex: string): string {
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex

  const r = parseInt(full.slice(1, 3), 16) / 255
  const g = parseInt(full.slice(3, 5), 16) / 255
  const b = parseInt(full.slice(5, 7), 16) / 255

  // Relative luminance, per WCAG.
  const channel = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4

  const luminance =
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

  return luminance > 0.45 ? "#111111" : "#ffffff"
}
