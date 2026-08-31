"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api-error"
import { mediaService } from "@/modules/platform-media/services/media.service"

export const mediaKeys = {
  all: ["platform-media"] as const,
  list: (params: unknown) => ["platform-media", "list", params] as const,
  courses: (tenantId: number | null, search: string) =>
    ["platform-media", "courses", tenantId, search] as const,
  tutors: (tenantId: number | null, search: string) =>
    ["platform-media", "tutors", tenantId, search] as const,
}

export function useMediaLibrary(params: {
  institution?: number | ""
  kind?: string
  search?: string
  perPage?: number
}) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: () => mediaService.list(params),
    // A newly uploaded video sits at PROCESSING until the encoder reports
    // back, so the shelf refreshes rather than stranding it there.
    refetchInterval: 15_000,
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mediaService.upload,
    onSuccess: (item) => {
      toast.success(`${item.title} uploaded`, {
        description:
          item.status === "PROCESSING"
            ? "Processing now — it appears once encoding finishes."
            : "Ready.",
      })
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all })
    },
    onError: (error) =>
      toast.error("Could not upload that", {
        description: errorMessage(error, "Nothing was saved."),
      }),
  })
}

/**
 * A school's courses, searched.
 *
 * Only runs once an institution is picked: the catalogue belongs to one
 * school, and there is nothing to search before that choice is made.
 */
export function useCourseSearch(tenantId: number | null, search: string) {
  return useQuery({
    queryKey: mediaKeys.courses(tenantId, search),
    queryFn: () => mediaService.courses(tenantId as number, search),
    enabled: tenantId !== null,
  })
}

export function useTutorSearch(tenantId: number | null, search: string) {
  return useQuery({
    queryKey: mediaKeys.tutors(tenantId, search),
    queryFn: () => mediaService.tutors(tenantId as number, search),
    enabled: tenantId !== null,
  })
}
