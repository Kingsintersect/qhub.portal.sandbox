import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/clients/apiClient'
import type { AcademicSession } from '../store/setup-store'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CreateSessionPayload {
    name: string
    start_date: string
    end_date: string
    is_active?: boolean
}

export interface UpdateSessionPayload extends Partial<CreateSessionPayload> {
    id: string
}

// ── Query Keys ─────────────────────────────────────────────────────────────────

export const sessionKeys = {
    all: ['academic-sessions'] as const,
    list: () => [...sessionKeys.all, 'list'] as const,
    detail: (id: string) => [...sessionKeys.all, 'detail', id] as const,
}

// ── API Calls ──────────────────────────────────────────────────────────────────

const fetchSessions = () =>
    apiClient.get<AcademicSession[]>('/api/academic-sessions', { access_token: true })

const fetchSession = (id: string) =>
    apiClient.get<AcademicSession>(`/api/academic-sessions/${id}`, { access_token: true })

const createSession = (payload: CreateSessionPayload) =>
    apiClient.post<AcademicSession>('/api/academic-sessions', payload, { access_token: true })

const updateSession = ({ id, ...payload }: UpdateSessionPayload) =>
    apiClient.put<AcademicSession>(`/api/academic-sessions/${id}`, payload, { access_token: true })

const deleteSession = (id: string) =>
    apiClient.delete<void>(`/api/academic-sessions/${id}`, { access_token: true })

const activateSession = (id: string) =>
    apiClient.put<AcademicSession>(`/api/academic-sessions/${id}/activate`, {}, { access_token: true })

const generateFeeAccounts = (sessionId: string) =>
    apiClient.post<{ generated: number }>(`/api/academic-sessions/${sessionId}/generate-fee-accounts`, {}, { access_token: true })

// ── Hooks ──────────────────────────────────────────────────────────────────────

export const useAcademicSessions = () =>
    useQuery({ queryKey: sessionKeys.list(), queryFn: fetchSessions })

export const useAcademicSession = (id: string) =>
    useQuery({ queryKey: sessionKeys.detail(id), queryFn: () => fetchSession(id), enabled: !!id })

export const useCreateSession = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createSession,
        onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.list() }),
    })
}

export const useUpdateSession = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updateSession,
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: sessionKeys.list() })
            qc.invalidateQueries({ queryKey: sessionKeys.detail(vars.id) })
        },
    })
}

export const useDeleteSession = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteSession,
        onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.list() }),
    })
}

export const useActivateSession = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: activateSession,
        onSuccess: () => qc.invalidateQueries({ queryKey: sessionKeys.list() }),
    })
}

export const useGenerateFeeAccounts = () =>
    useMutation({ mutationFn: generateFeeAccounts })