import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/clients/apiClient'
import type { Semester } from '../store/setup-store'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreateSemesterPayload {
    academic_session_id: string
    name: string
    sequence_no: number
    is_active?: boolean
}

export interface UpdateSemesterPayload extends Partial<Omit<CreateSemesterPayload, 'academic_session_id'>> {
    id: string
    academic_session_id: string
}

// ── Query Keys ─────────────────────────────────────────────────────────────────

export const semesterKeys = {
    all: ['semesters'] as const,
    bySession: (sessionId: string) => [...semesterKeys.all, 'session', sessionId] as const,
    detail: (id: string) => [...semesterKeys.all, 'detail', id] as const,
}

// ── API Calls ──────────────────────────────────────────────────────────────────

const fetchSemestersBySession = (sessionId: string) =>
    apiClient.get<Semester[]>(`/api/academic-sessions/${sessionId}/semesters`, { access_token: true })

const createSemester = (payload: CreateSemesterPayload) =>
    apiClient.post<Semester>(
        `/api/academic-sessions/${payload.academic_session_id}/semesters`,
        payload,
        { access_token: true }
    )

const updateSemester = ({ id, academic_session_id, ...payload }: UpdateSemesterPayload) =>
    apiClient.put<Semester>(
        `/api/academic-sessions/${academic_session_id}/semesters/${id}`,
        payload,
        { access_token: true }
    )

const deleteSemester = ({ id, academic_session_id }: { id: string; academic_session_id: string }) =>
    apiClient.delete<void>(
        `/api/academic-sessions/${academic_session_id}/semesters/${id}`,
        { access_token: true }
    )

// ── Hooks ──────────────────────────────────────────────────────────────────────

export const useSemesters = (sessionId: string) =>
    useQuery({
        queryKey: semesterKeys.bySession(sessionId),
        queryFn: () => fetchSemestersBySession(sessionId),
        enabled: !!sessionId,
    })

export const useCreateSemester = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createSemester,
        onSuccess: (_, vars) =>
            qc.invalidateQueries({ queryKey: semesterKeys.bySession(vars.academic_session_id) }),
    })
}

export const useUpdateSemester = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updateSemester,
        onSuccess: (_, vars) =>
            qc.invalidateQueries({ queryKey: semesterKeys.bySession(vars.academic_session_id) }),
    })
}

export const useDeleteSemester = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteSemester,
        onSuccess: (_, vars) =>
            qc.invalidateQueries({ queryKey: semesterKeys.bySession(vars.academic_session_id) }),
    })
}