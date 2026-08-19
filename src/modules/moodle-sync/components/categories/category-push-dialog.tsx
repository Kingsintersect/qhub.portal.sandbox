"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import Modal from "@/components/custom/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PermissionGate } from "@/lib/permissions/PermissionGate"
import { PushCategoryDtoSchema } from "../../schemas/category.schema"
import { usePushCategory } from "../../hooks/use-sync-mutations"
import type { PushCategoryDto } from "../../types"

const ENTITY_TYPES: PushCategoryDto["entityType"][] = [
  "faculty",
  "department",
  "program",
  "level",
  "semester",
]

export function CategoryPushDialog() {
  const [open, setOpen] = useState(false)
  const pushCategory = usePushCategory()

  const form = useForm<PushCategoryDto>({
    resolver: zodResolver(PushCategoryDtoSchema),
    defaultValues: {
      entityType: "faculty",
      entityId: 0,
      parentMoodleCategoryId: undefined,
    },
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      await pushCategory.mutateAsync(values)
      toast.success("Entity pushed to Moodle")
      setOpen(false)
      form.reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to push entity")
    }
  })

  return (
    <PermissionGate require={{ resource: "moodle-sync", action: "push" }}>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        <UploadCloud size={13} />
        Push Entity
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Push Entity to Moodle"
        subtitle="Manually push a faculty, program, level, or semester by its portal ID."
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pushCategory.isPending}
            >
              Cancel
            </Button>
            <Button onClick={submit} disabled={pushCategory.isPending}>
              {pushCategory.isPending && (
                <Loader2
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
              )}
              Push
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Entity Type</Label>
            <Controller
              control={form.control}
              name="entityType"
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-1.5">
                  {ENTITY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => field.onChange(type)}
                      className={
                        field.value === type
                          ? "rounded-lg border border-primary bg-primary/10 px-2 py-1.5 text-xs font-medium text-primary capitalize"
                          : "rounded-lg border border-border px-2 py-1.5 text-xs text-muted-foreground capitalize hover:bg-muted"
                      }
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="entity-id">Entity ID</Label>
            <Input
              id="entity-id"
              type="number"
              min={1}
              {...form.register("entityId", { valueAsNumber: true })}
            />
            {form.formState.errors.entityId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.entityId.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="parent-category-id">
              Parent Moodle Category ID (optional)
            </Label>
            <Input
              id="parent-category-id"
              type="number"
              min={1}
              placeholder="Leave empty for a top-level category"
              {...form.register("parentMoodleCategoryId", {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>
      </Modal>
    </PermissionGate>
  )
}
