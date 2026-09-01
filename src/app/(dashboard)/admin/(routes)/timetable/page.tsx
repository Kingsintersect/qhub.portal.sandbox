"use client"

import { motion } from "framer-motion"
import {
  CalendarDays,
  LayoutGrid,
  List,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { PermissionGate } from "@/lib/permissions/PermissionGate"
import { Button } from "@/components/ui/button"
import { TimetableGrid } from "@/modules/timetable/components/TimetableGrid"
import { TimetableList } from "@/modules/timetable/components/TimetableList"
import { ScheduleFormDialog } from "@/modules/timetable/components/ScheduleFormDialog"
import {
  useAllSchedules,
  useDeleteSchedule,
} from "@/modules/timetable/hooks/useTimetable"
import { useTimetableUIStore } from "@/modules/timetable/store/useTimetableUIStore"
import type { TimetableSlot } from "@/modules/timetable/types/timetable.types"

export default function AdminTimetablePage() {
  const {
    viewMode,
    setViewMode,
    scheduleDialogOpen,
    editingScheduleId,
    openCreateDialog,
    openEditDialog,
    closeDialog,
  } = useTimetableUIStore()
  const { data, isLoading } = useAllSchedules()
  const deleteMutation = useDeleteSchedule()
  const slots = data?.data ?? []

  function handleDelete(slot: TimetableSlot) {
    if (confirm(`Delete ${slot.courseCode} on ${slot.dayOfWeek}?`)) {
      deleteMutation.mutate(slot.id)
    }
  }

  function slotActions(slot: TimetableSlot) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => openEditDialog(slot.id)}
        >
          <Pencil size={12} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => handleDelete(slot)}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    )
  }

  return (
    <PermissionGate
      require={{ resource: "timetable", action: "view" }}
      denyBehavior="screen"
    >
      <div className="space-y-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-start justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Class Schedules</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Manage all course timetable slots
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 gap-1 px-2.5 text-xs"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={13} />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 gap-1 px-2.5 text-xs"
                onClick={() => setViewMode("list")}
              >
                <List size={13} />
                List
              </Button>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
            >
              <Link href="/admin/timetable/venue-check">Venue Checker</Link>
            </Button>

            <PermissionGate
              require={{ resource: "timetable", action: "manage" }}
            >
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={openCreateDialog}
              >
                <Plus size={13} />
                Add Slot
              </Button>
            </PermissionGate>
          </div>
        </motion.div>

        {viewMode === "grid" ? (
          <TimetableGrid
            slots={slots}
            isLoading={isLoading}
            slotActions={slotActions}
          />
        ) : (
          <TimetableList
            slots={slots}
            isLoading={isLoading}
            slotActions={slotActions}
          />
        )}
      </div>

      <ScheduleFormDialog
        open={scheduleDialogOpen}
        onOpenChange={closeDialog}
        editingScheduleId={editingScheduleId}
      />
    </PermissionGate>
  )
}
