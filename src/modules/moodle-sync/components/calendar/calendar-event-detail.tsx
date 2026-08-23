"use client"

import { format } from "date-fns"
import { ExternalLink, Video, BookOpen, Globe, Bell } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Modal from "@/components/custom/Modal"
import { Button } from "@/components/ui/button"
import type { CalendarEventResponse } from "../../types"

const EVENT_TYPE_META: Record<
  CalendarEventResponse["eventType"],
  { icon: LucideIcon; label: string; classes: string }
> = {
  zoom: { icon: Video, label: "Zoom", classes: "bg-primary/10 text-primary" },
  course: {
    icon: BookOpen,
    label: "Course",
    classes: "bg-success/10 text-success",
  },
  site: {
    icon: Globe,
    label: "Site-wide",
    classes: "bg-muted text-muted-foreground",
  },
  user: {
    icon: Bell,
    label: "Notice",
    classes: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
}

interface CalendarEventDetailProps {
  event: CalendarEventResponse | null
  onClose: () => void
}

export function CalendarEventDetail({
  event,
  onClose,
}: CalendarEventDetailProps) {
  if (!event) return null
  const meta = EVENT_TYPE_META[event.eventType]
  const Icon = meta.icon

  return (
    <Modal open={!!event} onClose={onClose} title={event.name} size="md">
      <div className="space-y-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.classes}`}
        >
          <Icon size={12} />
          {meta.label}
        </span>

        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}

        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Starts: </span>
            {format(new Date(event.startDate), "PPP p")}
          </p>
          {event.endDate && (
            <p>
              <span className="text-muted-foreground">Ends: </span>
              {format(new Date(event.endDate), "PPP p")}
            </p>
          )}
          {event.course && (
            <p>
              <span className="text-muted-foreground">Course: </span>
              {event.course.courseOffering.course.code} —{" "}
              {event.course.courseOffering.course.title}
            </p>
          )}
        </div>

        {event.meetingUrl && (
          <Button asChild className="w-full gap-2">
            <a
              href={event.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} />
              Join Meeting
            </a>
          </Button>
        )}
      </div>
    </Modal>
  )
}
