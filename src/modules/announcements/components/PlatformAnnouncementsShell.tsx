"use client"

import { useState } from "react"
import { Megaphone, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import { AnnouncementComposer } from "@/modules/announcements/components/AnnouncementComposer"
import { SeverityBadge } from "@/modules/announcements/components/SeverityBadge"
import {
  useAnnouncements,
  useDeleteAnnouncement,
  usePublishAnnouncement,
} from "@/modules/announcements/hooks/use-announcements"
import type { PlatformAnnouncement } from "@/modules/announcements/types"

const FILTERS = [
  { label: "All", value: "" },
  { label: "Live", value: "live" },
  { label: "Drafts", value: "draft" },
]

function audienceLabel(announcement: PlatformAnnouncement): string {
  if (announcement.audience === "ALL") return "Every institution"
  if (announcement.audience === "CATEGORY") {
    return `Programme: ${(announcement.audienceCategory ?? "").toLowerCase().replace(/_/g, " ")}`
  }
  return "Selected institutions"
}

export function PlatformAnnouncementsShell() {
  const { can } = usePlatformPermissions()
  const [status, setStatus] = useState("")
  const [composing, setComposing] = useState(false)

  const { data, isPending } = useAnnouncements(status ? { status } : {})
  const publish = usePublishAnnouncement()
  const remove = useDeleteAnnouncement()

  const canManage = can("announcements.manage")
  const announcements = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Announcements
          </h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `${data.meta.liveCount} live · ${data.meta.draftCount} draft`
              : "Notices to the institutions QHub hosts."}
          </p>
        </div>

        {canManage && (
          <Button onClick={() => setComposing(true)}>
            <Plus className="mr-2 size-4" aria-hidden="true" />
            New announcement
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-1" role="group" aria-label="Filter">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            aria-pressed={status === filter.value}
            onClick={() => setStatus(filter.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              status === filter.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isPending && announcements.length === 0 && (
        <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-border p-12 text-center">
          <Megaphone
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            Nothing announced yet.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="rounded-lg border border-border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={announcement.severity} />
                  <span className="text-sm font-medium text-foreground">
                    {announcement.title}
                  </span>
                  {announcement.isLive ? (
                    <span className="rounded-full border border-emerald-400 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-900 dark:text-emerald-300">
                      Live
                    </span>
                  ) : (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {announcement.isPublished ? "Expired" : "Draft"}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 line-clamp-2 text-sm whitespace-pre-wrap text-muted-foreground">
                  {announcement.body}
                </p>

                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{audienceLabel(announcement)}</span>
                  {announcement.publishedAt && (
                    <span>
                      Published{" "}
                      {new Date(announcement.publishedAt).toLocaleString()}
                    </span>
                  )}
                  {announcement.expiresAt && (
                    <span>
                      Until {new Date(announcement.expiresAt).toLocaleString()}
                    </span>
                  )}
                  {announcement.notifiedCount !== null && (
                    <span>{announcement.notifiedCount} staff notified</span>
                  )}
                  {announcement.author && <span>by {announcement.author}</span>}
                </p>
              </div>

              {canManage && (
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={publish.isPending}
                    onClick={() =>
                      publish.mutate({
                        id: announcement.id,
                        publish: !announcement.isPublished,
                      })
                    }
                  >
                    {announcement.isPublished ? "Withdraw" : "Publish"}
                  </Button>

                  {/* Drafts only — the API refuses to delete anything an
                      institution has already been shown. */}
                  {!announcement.isPublished && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete draft "${announcement.title}"`}
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(announcement.id)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnnouncementComposer open={composing} onOpenChange={setComposing} />
    </div>
  )
}
