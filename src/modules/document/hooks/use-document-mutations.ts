"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { documentService } from "../services/document.service"
import { documentKeys } from "./query-keys"
import type {
  RejectDocumentDto,
  UpdateDocumentDto,
  UploadDocumentDto,
  VerifyDocumentDto,
} from "../types"

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UploadDocumentDto) => documentService.uploadDocument(dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: documentKeys.all })
      qc.invalidateQueries({
        queryKey: documentKeys.byStudent(variables.studentId),
      })
    },
  })
}

export function useUpdateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateDocumentDto }) =>
      documentService.updateDocument(id, dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: documentKeys.all })
      qc.invalidateQueries({ queryKey: documentKeys.detail(variables.id) })
    },
  })
}

export function useVerifyDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: VerifyDocumentDto }) =>
      documentService.verifyDocument(id, dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: documentKeys.all })
      qc.invalidateQueries({ queryKey: documentKeys.detail(variables.id) })
    },
  })
}

export function useRejectDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: RejectDocumentDto }) =>
      documentService.rejectDocument(id, dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: documentKeys.all })
      qc.invalidateQueries({ queryKey: documentKeys.detail(variables.id) })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => documentService.deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: documentKeys.all }),
  })
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async ({ id, fileName }: { id: number; fileName: string }) => {
      const blob = await documentService.downloadDocument(id)
      const url = URL.createObjectURL(blob)
      const a = globalThis.document.createElement("a")
      a.href = url
      a.download = fileName
      globalThis.document.body.appendChild(a)
      a.click()
      globalThis.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })
}
