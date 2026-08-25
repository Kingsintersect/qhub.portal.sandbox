"use client"

import { useState } from "react"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AudiencePicker } from "@/modules/announcements/components/AudiencePicker"
import {
  useCreateAnnouncement,
  usePublishAnnouncement,
} from "@/modules/announcements/hooks/use-announcements"
import type {
  AnnouncementAudience,
  AnnouncementSeverity,
} from "@/modules/announcements/types"

/**
 * Write an announcement and, optionally, send it in the same step.
 *
 * "Save as draft" and "Publish now" are separate buttons rather than a
 * checkbox: publishing reaches other organisations and cannot be quietly
 * undone from their point of view, so it should take a deliberate click that
 * says what it does.
 */
export function AnnouncementComposer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateAnnouncement()
  const publish = usePublishAnnouncement()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [severity, setSeverity] = useState<AnnouncementSeverity>("INFO")
  const [audience, setAudience] = useState<AnnouncementAudience>("ALL")
  const [category, setCategory] = useState<string | null>(null)
  const [tenantIds, setTenantIds] = useState<number[]>([])
  const [expiresAt, setExpiresAt] = useState("")
  const [notifyStaff, setNotifyStaff] = useState(false)

  const busy = create.isPending || publish.isPending

  const audienceReady =
    audience === "ALL" ||
    (audience === "CATEGORY" && Boolean(category)) ||
    (audience === "SELECTED" && tenantIds.length > 0)

  const ready =
    title.trim().length > 0 && body.trim().length > 0 && audienceReady

  const reset = () => {
    setTitle("")
    setBody("")
    setSeverity("INFO")
    setAudience("ALL")
    setCategory(null)
    setTenantIds([])
    setExpiresAt("")
    setNotifyStaff(false)
  }

  const submit = async (thenPublish: boolean) => {
    if (!ready) return

    const announcement = await create.mutateAsync({
      title: title.trim(),
      body: body.trim(),
      severity,
      audience,
      audienceCategory: category,
      tenantIds,
      // A datetime-local value has no zone; sending it as-is lets the API read
      // it in the server's zone rather than guessing here.
      expiresAt: expiresAt || null,
      notifyStaff,
    })

    if (thenPublish) {
      await publish.mutateAsync({ id: announcement.id, publish: true })
    }

    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New announcement</DialogTitle>
          <DialogDescription>
            This goes to the institutions QHub hosts, not to their students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Scheduled maintenance on Sunday"
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="announcement-body">Message</Label>
            <Textarea
              id="announcement-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
              placeholder="What is happening, when, and what it means for them."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="announcement-severity">Severity</Label>
              <Select
                value={severity}
                onValueChange={(value) =>
                  setSeverity(value as AnnouncementSeverity)
                }
              >
                <SelectTrigger id="announcement-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="announcement-expires">
                Stops showing (optional)
              </Label>
              <Input
                id="announcement-expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Audience</Label>
            <AudiencePicker
              audience={audience}
              category={category}
              tenantIds={tenantIds}
              disabled={busy}
              onChange={(next) => {
                setAudience(next.audience)
                setCategory(next.category)
                setTenantIds(next.tenantIds)
              }}
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Switch
              checked={notifyStaff}
              onCheckedChange={setNotifyStaff}
              aria-label="Also notify institution staff"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">
                Also notify institution staff
              </span>
              <span className="block text-xs text-muted-foreground">
                Drops this into the inbox of each institution&apos;s admins and
                staff. Students are never included.
              </span>
            </span>
          </label>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => submit(false)}
            disabled={!ready || busy}
          >
            Save as draft
          </Button>

          <Button onClick={() => submit(true)} disabled={!ready || busy}>
            {busy ? (
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Send className="mr-2 size-4" aria-hidden="true" />
            )}
            Publish now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
