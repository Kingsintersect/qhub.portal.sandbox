"use client"

import { Loader2, Users } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useAudiencePreview } from "@/modules/announcements/hooks/use-announcements"
import type { AnnouncementAudience } from "@/modules/announcements/types"
import { useInstitutions } from "@/modules/institutions/hooks/use-institutions"

const AUDIENCES: Array<{
  value: AnnouncementAudience
  label: string
  hint: string
}> = [
  {
    value: "ALL",
    label: "Every institution",
    hint: "Including any onboarded while this is still live.",
  },
  {
    value: "CATEGORY",
    label: "By programme type",
    hint: "Institutions running the selected programme.",
  },
  {
    value: "SELECTED",
    label: "Specific institutions",
    hint: "Exactly the ones you pick, fixed at publish.",
  },
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

  const toggle = (id: number) =>
    onChange({
      audience,
      category,
      tenantIds: tenantIds.includes(id)
        ? tenantIds.filter((value) => value !== id)
        : [...tenantIds, id],
    })

  return (
    <div className="space-y-3">
      <div
        className="grid gap-2 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Audience"
      >
        {AUDIENCES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={audience === option.value}
            disabled={disabled}
            onClick={() =>
              onChange({
                audience: option.value,
                category: null,
                tenantIds: [],
              })
            }
            className={cn(
              "rounded-lg border p-3 text-left transition-colors disabled:opacity-50",
              audience === option.value
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <span className="block text-sm font-medium text-foreground">
              {option.label}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {option.hint}
            </span>
          </button>
        ))}
      </div>

      {audience === "CATEGORY" && (
        <div className="space-y-1.5">
          <Label htmlFor="audience-category">Programme type</Label>
          <Select
            value={category ?? ""}
            onValueChange={(value) =>
              onChange({ audience, category: value, tenantIds: [] })
            }
            disabled={disabled}
          >
            <SelectTrigger id="audience-category" className="w-full sm:w-64">
              <SelectValue placeholder="Choose a programme type" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {audience === "SELECTED" && (
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
          {institutions.isPending && (
            <p className="p-2 text-sm text-muted-foreground">
              Loading institutions…
            </p>
          )}

          {institutions.data?.data.map((institution) => (
            <label
              key={institution.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
            >
              <Checkbox
                checked={tenantIds.includes(institution.id)}
                onCheckedChange={() => toggle(institution.id)}
                disabled={disabled}
              />
              <span className="text-sm text-foreground">
                {institution.name}
              </span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                {institution.slug}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm">
        {preview.isFetching ? (
          <Loader2
            className="size-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : (
          <Users className="size-4 text-muted-foreground" aria-hidden="true" />
        )}

        <span aria-live="polite" className="text-muted-foreground">
          {preview.data
            ? preview.data.count === 0
              ? "This reaches no institutions yet."
              : `Reaches ${preview.data.count} institution${preview.data.count === 1 ? "" : "s"}: ${preview.data.institutions
                  .slice(0, 4)
                  .map((institution) => institution.name)
                  .join(
                    ", "
                  )}${preview.data.count > 4 ? `, and ${preview.data.count - 4} more` : ""}`
            : "Choose an audience to see who it reaches."}
        </span>
      </div>
    </div>
  )
}
