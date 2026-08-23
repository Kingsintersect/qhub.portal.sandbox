"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Modal from "@/components/custom/Modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useCreateEnrollment } from "../hooks/use-enrollment-mutations"
import { courseOfferingQueryOptions } from "@/services/courseOfferingApi"
import { useAcademicCalendar } from "@/modules/timetable/hooks/useAcademicCalendar"

interface SelfEnrollDialogProps {
  open: boolean
  onClose: () => void
  studentId: number
  alreadyEnrolledOfferingIds: number[]
}

export function SelfEnrollDialog({
  open,
  onClose,
  studentId,
  alreadyEnrolledOfferingIds,
}: SelfEnrollDialogProps) {
  const { data: offeringsRes, isLoading: offeringsLoading } = useQuery(
    courseOfferingQueryOptions.list()
  )
  const { data: calendar } = useAcademicCalendar()
  const createMutation = useCreateEnrollment()

  const [offeringId, setOfferingId] = useState<number | null>(null)
  const [semesterId, setSemesterId] = useState<number | null>(null)

  const openOfferings = (offeringsRes?.data ?? []).filter(
    (o) => o.status === "OPEN" && !alreadyEnrolledOfferingIds.includes(o.id)
  )
  const semesters = calendar?.semesters ?? []

  const handleSubmit = async () => {
    if (!offeringId || !semesterId) return
    await createMutation.mutateAsync({ studentId, offeringId, semesterId })
    setOfferingId(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Register for a Course"
      subtitle="Enroll yourself in an open course offering"
    >
      <div className="space-y-4 p-5">
        {createMutation.isError && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {createMutation.error?.status === 409
              ? "You're already enrolled in that course, or it's full."
              : (createMutation.error?.message ?? "Registration failed.")}
          </p>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs">Course Offering</Label>
          <Select
            value={offeringId ? String(offeringId) : undefined}
            onValueChange={(v) => setOfferingId(Number(v))}
            disabled={offeringsLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  offeringsLoading ? "Loading…" : "Select an open course"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {openOfferings.map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>
                  {o.course_code} — {o.course_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {openOfferings.length === 0 && !offeringsLoading && (
            <p className="text-[11px] text-muted-foreground">
              No open offerings available to register for right now.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Semester</Label>
          <Select
            value={semesterId ? String(semesterId) : undefined}
            onValueChange={(v) => setSemesterId(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={!offeringId || !semesterId || createMutation.isPending}
            className="min-w-24 gap-2"
          >
            {createMutation.isPending && (
              <Loader2 size={13} className="animate-spin" />
            )}
            Register
          </Button>
        </div>
      </div>
    </Modal>
  )
}
