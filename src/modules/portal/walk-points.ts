/**
 * The canvas's chart-line generator, ported exactly.
 *
 * It looks like noise but it is a seeded linear congruential generator, so the
 * same seed always draws the same line. That matters here for a reason beyond
 * fidelity: a genuinely random walk would produce different points on the
 * server and the client, and React would report a hydration mismatch on every
 * load of the dashboard.
 */
export function walkPoints(
  seed: number,
  count: number,
  amp: number,
  base: number
): string {
  let h = seed
  const pts: string[] = []

  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) % 2147483648
    const v =
      base +
      Math.sin(i / 2.2) * amp * 18 +
      ((h % 100) / 100) * amp * 22 -
      amp * 11
    pts.push(
      `${Math.round(i * (640 / (count - 1)))},${Math.round(
        Math.max(14, Math.min(190, v))
      )}`
    )
  }

  return pts.join(" ")
}
