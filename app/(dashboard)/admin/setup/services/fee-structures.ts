import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/clients/apiClient'
import type { FeeStructure } from '../store/setup-store'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreateFeeStructurePayload {
  academic_session_id: string
  semester_id: string
  program_id: string
  level: string
  total_amount: number
  description: string
}

export interface UpdateFeeStructurePayload extends Partial<Omit<CreateFeeStructurePayload, 'academic_session_id'>> {
  id: string
  academic_session_id: string
}

export interface Program {
  id: string
  name: string
  code: string
}

// ── Query Keys ─────────────────────────────────────────────────────────────────

export const feeKeys = {
  all: ['fee-structures'] as const,
  bySession: (sessionId: string) => [...feeKeys.all, 'session', sessionId] as const,
  bySemester: (sessionId: string, semesterId: string) =>
    [...feeKeys.all, 'session', sessionId, 'semester', semesterId] as const,
  detail: (id: string) => [...feeKeys.all, 'detail', id] as const,
}

export const programKeys = {
  all: ['programs'] as const,
  list: () => [...programKeys.all, 'list'] as const,
}

// ── API Calls ──────────────────────────────────────────────────────────────────

const fetchFeeStructures = (sessionId: string, semesterId?: string) => {
  const params = semesterId ? { semester_id: semesterId } : {}
  return apiClient.get<FeeStructure[]>(
    `/api/academic-sessions/${sessionId}/fee-structures`,
    { access_token: true, params }
  )
}

const fetchPrograms = () =>
  apiClient.get<Program[]>('/api/programs', { access_token: true })

const createFeeStructure = (payload: CreateFeeStructurePayload) =>
  apiClient.post<FeeStructure>(
    `/api/academic-sessions/${payload.academic_session_id}/fee-structures`,
    payload,
    { access_token: true }
  )

const updateFeeStructure = ({ id, academic_session_id, ...payload }: UpdateFeeStructurePayload) =>
  apiClient.put<FeeStructure>(
    `/api/academic-sessions/${academic_session_id}/fee-structures/${id}`,
    payload,
    { access_token: true }
  )

const deleteFeeStructure = ({ id, academic_session_id }: { id: string; academic_session_id: string }) =>
  apiClient.delete<void>(
    `/api/academic-sessions/${academic_session_id}/fee-structures/${id}`,
    { access_token: true }
  )

// ── Hooks ──────────────────────────────────────────────────────────────────────

export const useFeeStructures = (sessionId: string, semesterId?: string) =>
  useQuery({
    queryKey: semesterId
      ? feeKeys.bySemester(sessionId, semesterId)
      : feeKeys.bySession(sessionId),
    queryFn: () => fetchFeeStructures(sessionId, semesterId),
    enabled: !!sessionId,
  })

export const usePrograms = () =>
  useQuery({ queryKey: programKeys.list(), queryFn: fetchPrograms })

export const useCreateFeeStructure = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createFeeStructure,
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: feeKeys.bySession(vars.academic_session_id) }),
  })
}

export const useUpdateFeeStructure = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateFeeStructure,
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: feeKeys.bySession(vars.academic_session_id) }),
  })
}

export const useDeleteFeeStructure = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteFeeStructure,
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: feeKeys.bySession(vars.academic_session_id) }),
  })
}