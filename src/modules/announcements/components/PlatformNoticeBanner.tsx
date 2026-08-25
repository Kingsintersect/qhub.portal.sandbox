"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  severityStyles,
  SeverityBadge,
} from "@/modules/announcements/components/SeverityBadge"
import {
  useDismissNotice,
  useInstitutionNotices,
} from "@/modules/announcements/hooks/use-announcements"

/**
 * Notices from the QHub team, shown to everyone signed in at an institution.
 *
 * Only undismissed ones appear here. The full list, including what has been
 * dismissed, stays available on the institution's own notices page — dismissing
 * should clear the interruption, not destroy the record.
 *
 * Renders nothing at all when there is nothing to say, including while loading:
 * a skeleton at the top of every dashboard would be a permanent visual cost for
 * something that is almost always empty.
 */
export function PlatformNoticeBanner() {
  const { data: notices } = useInstitutionNotices()
  const dismiss = useDismissNotice()

  const visible = (notices ?? []).filter((notice) => !notice.dismissed)

  if (visible.length === 0) {
    return null
  }

  return (
    <div className="space-y-2" role="region" aria-label="Notices from QHub">
      {visible.map((notice) => (
        <div
          key={notice.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border px-4 py-3",
            severityStyles(notice.severity).surface
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={notice.severity} />
              <span className="text-sm font-medium text-foreground">
                {notice.title}
              </span>
              <span className="text-xs text-muted-foreground">from QHub</span>
            </div>

            {/* Plain text, preserved as typed — never rendered as markup. */}
            <p className="mt-1 text-sm whitespace-pre-wrap text-foreground/90">
              {notice.body}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Dismiss "${notice.title}"`}
            onClick={() => dismiss.mutate(notice.id)}
            className="shrink-0"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  )
}
