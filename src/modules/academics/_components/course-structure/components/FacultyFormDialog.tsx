"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import Modal from "@/components/custom/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateFaculty, useUpdateFaculty } from "@/hooks/useCourseStructure"
import { facultySchema, type FacultyFormValues } from "@/schemas/school.schema"
import type { Faculty } from "@/types/school"

interface FacultyFormDialogProps {
  open: boolean
  onClose: () => void
  faculty?: Faculty | null
}

export function FacultyFormDialog({
  open,
  onClose,
  faculty,
}: FacultyFormDialogProps) {
  const isEditing = !!faculty
  const createFaculty = useCreateFaculty()
  const updateFaculty = useUpdateFaculty()
  const isPending = createFaculty.isPending || updateFaculty.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    defaultValues: { name: "", code: "" },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: faculty?.name ?? "",
      code: faculty?.code ?? "",
      description: faculty?.description ?? "",
      deanUserId: faculty?.deanUserId ?? undefined,
      email: faculty?.email ?? "",
      phoneNumber: faculty?.phoneNumber ?? "",
    })
  }, [open, faculty, reset])

  const onSubmit = async (values: FacultyFormValues) => {
    try {
      if (isEditing) {
        await updateFaculty.mutateAsync({ id: faculty.id, payload: values })
        toast.success("Faculty updated")
      } else {
        await createFaculty.mutateAsync(values)
        toast.success("Faculty created")
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save faculty")
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Faculty" : "Create Faculty"}
      subtitle="e.g., Faculty of Science (code: SCI)"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending && (
              <Loader2
                className="size-4 animate-spin"
                data-icon="inline-start"
              />
            )}
            {isEditing ? "Save Changes" : "Create Faculty"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="faculty-name">Faculty Name</Label>
            <Input
              id="faculty-name"
              placeholder="Faculty of Science"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="faculty-code">Code</Label>
            <Input
              id="faculty-code"
              placeholder="SCI"
              aria-invalid={!!errors.code}
              {...register("code")}
              disabled={isEditing}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Code can&apos;t be changed after creation.
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="faculty-description">Description</Label>
          <Textarea
            id="faculty-description"
            rows={2}
            {...register("description")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="faculty-email">Email</Label>
            <Input
              id="faculty-email"
              type="email"
              placeholder="science@qhub.edu"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="faculty-phone">Phone</Label>
            <Input
              id="faculty-phone"
              placeholder="+2348012345678"
              {...register("phoneNumber")}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="faculty-dean">
            Dean — User ID
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (optional — see Users → Staff/Lecturers for the id)
            </span>
          </Label>
          <Input
            id="faculty-dean"
            type="number"
            min={1}
            placeholder="e.g. 42"
            {...register("deanUserId", { valueAsNumber: true })}
          />
        </div>
      </div>
    </Modal>
  )
}
