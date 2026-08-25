/**
 * Money crossing the API is always an integer count of MINOR units — kobo,
 * cents — named `*Minor` on every field. Nothing in the app divides by 100 by
 * hand; conversion happens here and only for display.
 *
 * The exponent is asked of Intl rather than assumed to be 2. Most currencies
 * have two decimal places, but not all do, and a hardcoded /100 would show a
 * ¥1,000 invoice as ¥10.
 */
function fractionDigits(currency: string): number {
  try {
    return (
      new Intl.NumberFormat("en", {
        style: "currency",
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2
    )
  } catch {
    // An unrecognised code should not take the page down; two places is the
    // overwhelmingly common case.
    return 2
  }
}

/** Minor units to a display string in that currency. */
export function formatMinor(minor: number, currency: string): string {
  const digits = fractionDigits(currency)

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(minor / 10 ** digits)
  } catch {
    return `${currency} ${(minor / 10 ** digits).toFixed(digits)}`
  }
}

/** A major-unit string from a form ("1250.50") to minor units. */
export function toMinor(major: string, currency: string): number {
  const digits = fractionDigits(currency)
  const value = Number.parseFloat(major)

  if (!Number.isFinite(value)) return 0

  // Rounded, not truncated: "10.005" entered against a two-place currency
  // should become 1001, not 1000.
  return Math.round(value * 10 ** digits)
}

/** Minor units to the plain number a form input should hold. */
export function toMajorInput(minor: number, currency: string): string {
  const digits = fractionDigits(currency)
  return (minor / 10 ** digits).toFixed(digits)
}
