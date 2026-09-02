"use client"

import { useSyncExternalStore } from "react"

import { errorCode, errorEnvelope } from "@/lib/api-error"

/**
 * What to do when the console refuses an action for want of a permission.
 *
 * A bare "Forbidden" tells an operator they cannot do the thing, which they
 * had already worked out. Naming the permission tells them what to ask for —
 * and on a console where permissions are editable two screens away, that is
 * the difference between a dead end and a next step.
 *
 * The id comes from the refusal as a field rather than being parsed out of
 * the sentence: the sentence is for a human and will be reworded.
 */

/** Reads a refusal, or null if this error was not a permission refusal. */
export function missingPermission(error: unknown): string | null {
  if (errorCode(error) !== "MISSING_PERMISSION") return null

  const envelope = errorEnvelope<{ permission?: string }>(error)

  return envelope?.permission ?? null
}

/*
 * A refusal can come from any mutation on a view, so it is held outside them
 * rather than in each one. A toast would be the easy alternative and the wrong
 * one: this is a banner in the draft because the answer — go and tick that box
 * on a role — takes longer to act on than a toast stays on screen.
 */
let refused: string | null = null
const listeners = new Set<() => void>()

function publish(next: string | null) {
  refused = next
  listeners.forEach((l) => l())
}

/** Call from a mutation's onError. Ignores anything that is not a refusal. */
export function reportRefusal(error: unknown): void {
  const permission = missingPermission(error)

  if (permission !== null) publish(permission)
}

export function clearRefusal(): void {
  publish(null)
}

export function useRefusal(): string | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)

      return () => listeners.delete(listener)
    },
    () => refused,
    // The server render has no refusal to show; one can only happen after a
    // click.
    () => null
  )
}

export function MissingPermissionBanner({
  permission,
  onDismiss,
}: {
  permission: string
  onDismiss: () => void
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--neg-bg)",
        border: "1px solid var(--neg)",
        borderRadius: 12,
        padding: "12px 16px",
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--neg)"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden="true"
        style={{ flex: "0 0 15px" }}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5v.5" />
      </svg>

      <div style={{ fontSize: 13, color: "var(--txt)" }}>
        Missing permission:{" "}
        <span
          className="qhub-mono"
          style={{ fontSize: 12, fontWeight: 500, color: "var(--neg)" }}
        >
          {permission}
        </span>
      </div>

      <div style={{ fontSize: 12, color: "var(--txt3)" }}>
        That action needs a permission this account does not hold — tick that
        box on a role this account has.
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          marginLeft: "auto",
          fontSize: 13,
          color: "var(--txt3)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "2px 6px",
          fontFamily: "inherit",
        }}
      >
        ✕
      </button>
    </div>
  )
}
