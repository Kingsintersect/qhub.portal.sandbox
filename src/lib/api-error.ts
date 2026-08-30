/**
 * Reading what the API actually said.
 *
 * `apiClient` normalises every failure into an `ApiClientError`, which carries
 * the server's message on `.message` and the whole response body on `.data`.
 * It is NOT an axios error and has no `.response`.
 *
 * Eleven modules each kept a private copy of this helper that read
 * `error.response.data.message` — a shape `ApiClientError` does not have — so
 * every one of them silently fell through to its generic fallback. The backend
 * has spent a lot of care on refusals that say exactly what went wrong and
 * what to do next ("No per-student rate is agreed for X. Set the negotiated
 * rate on its subscription first."), and none of it was reaching anybody.
 *
 * There is deliberately one copy of this now.
 */

interface ApiErrorShape {
  message?: unknown
  status?: unknown
  data?: {
    message?: unknown
    error?: { code?: unknown } & Record<string, unknown>
  }
  // Tolerated so a genuine axios error passed in by mistake still resolves,
  // rather than silently falling back the way the old copies did.
  response?: { data?: { message?: unknown } }
}

/** The server's own words, or `fallback` when it did not give any. */
export function errorMessage(error: unknown, fallback: string): string {
  const e = error as ApiErrorShape | null

  const body = e?.data?.message
  if (typeof body === "string" && body !== "") return body

  const legacy = e?.response?.data?.message
  if (typeof legacy === "string" && legacy !== "") return legacy

  // ApiClientError copies the server message onto `.message` when it can, so
  // this is usually the same string — but only when the body actually had one,
  // which is why it is checked after the body and before the fallback.
  const top = e?.message
  if (
    typeof top === "string" &&
    top !== "" &&
    top !== "An unexpected error occurred."
  ) {
    return top
  }

  return fallback
}

/**
 * The typed code from a `{ error: { code } }` envelope, when there is one.
 *
 * Used to tell one refusal apart from another — a moved roll is handled by
 * re-previewing rather than by shouting at the operator.
 */
export function errorCode(error: unknown): string | null {
  const code = (error as ApiErrorShape | null)?.data?.error?.code

  return typeof code === "string" ? code : null
}

/** The HTTP status, when the failure reached the server at all. */
export function errorStatus(error: unknown): number | null {
  const status = (error as ApiErrorShape | null)?.status

  return typeof status === "number" ? status : null
}

/** The typed error envelope itself, for callers that need its other fields. */
export function errorEnvelope<T = Record<string, unknown>>(
  error: unknown
): T | null {
  const envelope = (error as ApiErrorShape | null)?.data?.error

  return envelope === undefined ? null : (envelope as T)
}
