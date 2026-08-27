"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

/**
 * One confirm dialog for the whole console.
 *
 * Product rule 3: every consequential action takes one more beat than a
 * harmless one, and the dialog states what happens, to whom, and whether it
 * can be undone. Having one shared dialog rather than a confirmation invented
 * per button is what makes that rule hold — an inline "are you sure?" written
 * at each call site drifts in wording and eventually gets skipped.
 */
export type ConfirmRequest = {
  title: string
  /** Says what happens, to whom, and whether it is reversible. */
  body: string
  /** The affirmative label. Names the act: "Suspend", not "OK". */
  label: string
  /** Red treatment for anything destructive or hard to reverse. */
  danger?: boolean
}

type ConfirmFn = (request: ConfirmRequest) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext)

  if (!confirm) {
    throw new Error("useConfirm must be used inside ConfirmProvider.")
  }

  return confirm
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((next) => {
    setRequest(next)

    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value)
    resolver.current = null
    setRequest(null)
  }, [])

  // Escape cancels. A modal that traps somebody is its own kind of bug.
  useEffect(() => {
    if (!request) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false)
    }

    document.addEventListener("keydown", onKey)

    return () => document.removeEventListener("keydown", onKey)
  }, [request, settle])

  const value = useMemo(() => confirm, [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {request && (
        // Carries `qhub-console` because this renders as a SIBLING of the
        // console, not inside it — the provider wraps the shell. Without the
        // class it inherits neither the design tokens (so --surface-solid and
        // every colour below resolve to nothing) nor the zoom, and the dialog
        // comes out unpainted and at the wrong scale.
        <div
          className="qhub-console"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => settle(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(8,12,18,.5)",
              border: "none",
              padding: 0,
              cursor: "default",
            }}
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={request.title}
            style={{
              position: "relative",
              width: 460,
              maxWidth: "calc(100vw / var(--zoom) - 32px)",
              background: "var(--surface-solid)",
              border: "1px solid var(--line-strong)",
              borderRadius: 18,
              boxShadow: "0 30px 80px rgba(8,12,18,.4)",
              padding: 24,
              color: "var(--txt)",
              fontFamily:
                "var(--font-geist), Geist, 'Helvetica Neue', sans-serif",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "-0.015em",
              }}
            >
              {request.title}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "var(--txt2)",
                lineHeight: 1.6,
                marginTop: 10,
              }}
            >
              {request.body}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() => settle(false)}
                style={{
                  border: "1px solid var(--line-strong)",
                  borderRadius: 10,
                  background: "transparent",
                  color: "var(--txt2)",
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "9px 16px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                autoFocus
                onClick={() => settle(true)}
                style={{
                  background: request.danger ? "var(--neg)" : "var(--accent)",
                  color: "#fff",
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "9px 18px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {request.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
