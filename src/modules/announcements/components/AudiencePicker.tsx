"use client"

import { useAudiencePreview } from "@/modules/announcements/hooks/use-announcements"
import type { AnnouncementAudience } from "@/modules/announcements/types"
import { useInstitutions } from "@/modules/institutions/hooks/use-institutions"

const AUDIENCES: Array<{ value: AnnouncementAudience; label: string }> = [
  { value: "ALL", label: "Every institution" },
  { value: "CATEGORY", label: "By programme type" },
  { value: "SELECTED", label: "Specific institutions" },
]

const CATEGORIES = [
  { value: "DEGREE", label: "Degree" },
  { value: "POSTGRADUATE", label: "Postgraduate" },
  { value: "CERTIFICATE", label: "Certificate" },
  { value: "SECONDARY_SCHOOL", label: "Secondary school" },
]

/**
 * Who an announcement goes to, with the answer shown before it is sent.
 *
 * The live preview is the point of this component. "By programme type" and
 * "every institution" are both one click away from reaching the whole estate,
 * and an operator should see the names and the count while choosing, not
 * discover the blast radius afterwards.
 */
export function AudiencePicker({
  audience,
  category,
  tenantIds,
  onChange,
  disabled,
}: {
  audience: AnnouncementAudience
  category: string | null
  tenantIds: number[]
  onChange: (next: {
    audience: AnnouncementAudience
    category: string | null
    tenantIds: number[]
  }) => void
  disabled?: boolean
}) {
  const institutions = useInstitutions({ perPage: 100 })

  const preview = useAudiencePreview({
    audience,
    audienceCategory: category,
    tenantIds,
  })

  const rows = institutions.data?.data ?? []

  return (
    <div>
      <div
        style={{
          display: "flex",
          background: "var(--panel)",
          borderRadius: 11,
          padding: 3,
          width: "fit-content",
        }}
      >
        {AUDIENCES.map((option) => {
          const on = audience === option.value

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({
                  audience: option.value,
                  category: option.value === "CATEGORY" ? category : null,
                  tenantIds: option.value === "SELECTED" ? tenantIds : [],
                })
              }
              style={{
                fontSize: 12.5,
                fontWeight: on ? 600 : 400,
                color: on ? "var(--txt)" : "var(--txt3)",
                background: on ? "var(--card)" : "transparent",
                boxShadow: on ? "var(--shadow-sm)" : "none",
                padding: "7px 14px",
                borderRadius: 9,
                border: "none",
                cursor: disabled === true ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {audience === "CATEGORY" && (
        <div
          style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}
        >
          {CATEGORIES.map((option) => {
            const on = category === option.value

            return (
              <button
                key={option.value}
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange({ audience, category: option.value, tenantIds: [] })
                }
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "8px 13px",
                  borderRadius: 9,
                  color: on ? "var(--accent)" : "var(--txt2)",
                  background: on ? "var(--accent-soft)" : "transparent",
                  border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                  cursor: disabled === true ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}

      {audience === "SELECTED" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 10,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {rows.map((institution) => {
            const on = tenantIds.includes(institution.id)

            return (
              <button
                key={institution.id}
                type="button"
                disabled={disabled}
                aria-pressed={on}
                onClick={() =>
                  onChange({
                    audience,
                    category: null,
                    tenantIds: on
                      ? tenantIds.filter((id) => id !== institution.id)
                      : [...tenantIds, institution.id],
                  })
                }
                style={{
                  border: `1px solid ${on ? "var(--accent)" : "var(--line-strong)"}`,
                  background: on ? "var(--accent-soft)" : "transparent",
                  borderRadius: 11,
                  padding: "10px 13px",
                  cursor: disabled === true ? "default" : "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: on ? "var(--accent)" : "var(--txt)",
                  }}
                >
                  {institution.name}
                </div>
                <div
                  className="qhub-mono"
                  style={{
                    fontSize: 11.5,
                    color: "var(--txt4)",
                    marginTop: 2,
                  }}
                >
                  {institution.slug}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ fontSize: 11.5, color: "var(--txt4)", marginTop: 8 }}>
        {audienceNote(
          audience,
          preview.data?.count ?? null,
          preview.data?.institutions ?? []
        )}
      </div>
    </div>
  )
}

/**
 * The blast radius, in words.
 *
 * Named institutions up to a point, then a count — reading eighty names is
 * not comprehension, but seeing three is.
 */
function audienceNote(
  audience: AnnouncementAudience,
  count: number | null,
  institutions: Array<{ id: number; name: string }>
): string {
  if (count === null) {
    return audience === "ALL"
      ? "Every institution QHub hosts."
      : "Pick who this reaches."
  }

  if (count === 0) return "This reaches nobody as configured."

  const suffix =
    audience === "ALL"
      ? " — including any onboarded while this is still live."
      : audience === "SELECTED"
        ? " — fixed at publish, so later arrivals are not included."
        : "."

  if (institutions.length > 0 && institutions.length <= 3) {
    return `Reaches ${institutions.map((i) => i.name).join(", ")}${suffix}`
  }

  return `Reaches ${count} institution${count === 1 ? "" : "s"}${suffix}`
}
