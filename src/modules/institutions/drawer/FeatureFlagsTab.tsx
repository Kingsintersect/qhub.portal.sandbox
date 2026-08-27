"use client"

import { useMemo, useState } from "react"

import {
  useInstitutionFeatures,
  useSetFeature,
} from "@/modules/platform-controls/hooks/use-controls"
import type { InstitutionFeature } from "@/modules/platform-controls/types"

/**
 * Feature flags for one institution, lifted from the draft.
 *
 * The dependency graph is enforced server-side — enabling refuses while a
 * prerequisite is off, disabling refuses while a dependent is on — and the
 * refusal comes back as a sentence naming what is missing. That message is
 * shown as-is rather than reworded, because the server knows which feature
 * blocked it and this screen does not.
 */
export function FeatureFlagsTab({ tenantId }: { tenantId: number }) {
  const [query, setQuery] = useState("")
  const [refusal, setRefusal] = useState<string | null>(null)

  const { data: features, isPending } = useInstitutionFeatures(tenantId)
  const setFeature = useSetFeature(tenantId)

  const categories = useMemo(() => {
    const matching = (features ?? []).filter(
      (f) =>
        !query.trim() ||
        f.label.toLowerCase().includes(query.toLowerCase()) ||
        f.key.toLowerCase().includes(query.toLowerCase())
    )

    const grouped = new Map<string, InstitutionFeature[]>()

    for (const f of matching) {
      grouped.set(f.category, [...(grouped.get(f.category) ?? []), f])
    }

    return [...grouped.entries()]
  }, [features, query])

  const onCount = (features ?? []).filter((f) => f.enabled).length

  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 22px 0",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)" }}>
          Feature flags
        </div>
        <div style={{ fontSize: 12, color: "var(--txt3)" }}>
          {onCount} of {features?.length ?? 0} on · changes apply immediately
          and are logged
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--panel)",
            border: "1px solid var(--line-strong)",
            borderRadius: 10,
            padding: "7px 12px",
            width: 220,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--txt4)"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a feature…"
            aria-label="Find a feature"
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 12.5,
              color: "var(--txt)",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {refusal && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "12px 22px 0",
            background: "var(--warn-bg)",
            border: "1px solid var(--warn)",
            borderRadius: 11,
            padding: "10px 14px",
            fontSize: 12.5,
            color: "var(--txt)",
          }}
        >
          {refusal}
          <button
            type="button"
            onClick={() => setRefusal(null)}
            aria-label="Dismiss"
            style={{
              marginLeft: "auto",
              color: "var(--txt3)",
              background: "none",
              border: "none",
              padding: "0 4px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {isPending && (
        <div style={{ padding: "22px", fontSize: 13, color: "var(--txt3)" }}>
          Loading…
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 26px",
          padding: "14px 22px 20px",
        }}
      >
        {categories.map(([category, feats]) => (
          <div
            key={category}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid var(--line2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: ".03em",
                  color: "var(--txt)",
                }}
              >
                {category}
              </div>
              <div style={{ fontSize: 11, color: "var(--txt4)" }}>
                {feats.filter((f) => f.enabled).length}/{feats.length} on
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 7,
                marginTop: 8,
              }}
            >
              {feats.map((f) => (
                <div
                  key={f.key}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={f.enabled}
                    aria-label={f.label}
                    onClick={() =>
                      setFeature.mutate(
                        { key: f.key, enabled: !f.enabled },
                        {
                          onError: (e) =>
                            setRefusal(
                              (e as { message?: string } | null)?.message ??
                                "That change was refused."
                            ),
                          onSuccess: () => setRefusal(null),
                        }
                      )
                    }
                    style={{
                      position: "relative",
                      width: 34,
                      height: 18,
                      flex: "0 0 34px",
                      borderRadius: 999,
                      background: f.enabled
                        ? "var(--accent)"
                        : "var(--line-strong)",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition: "background .15s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: f.enabled ? 18 : 2,
                        width: 14,
                        height: 14,
                        borderRadius: 999,
                        background: "#fff",
                        transition: "left .15s",
                        boxShadow: "0 1px 3px rgba(8,12,18,.3)",
                      }}
                    />
                  </button>

                  <div style={{ fontSize: 12.5, color: "var(--txt2)" }}>
                    {f.label}
                  </div>

                  {/*
                    A state that differs from what the catalogue intended is
                    badged, so somebody can tell a deliberate exception from
                    the default without opening the catalogue.
                  */}
                  {f.enabled !== f.defaultEnabled && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: ".06em",
                        color: "var(--series2)",
                        background: "var(--warn-bg)",
                        padding: "2px 7px",
                        borderRadius: 6,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.enabled ? "ON · DEFAULT OFF" : "OFF · DEFAULT ON"}
                    </span>
                  )}

                  {f.dependencies.length > 0 && (
                    <div
                      style={{
                        marginLeft: "auto",
                        fontSize: 10.5,
                        color: "var(--txt4)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      needs {f.dependencies.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
