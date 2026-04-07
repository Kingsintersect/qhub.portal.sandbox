import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/clients/apiClient'
import { delay, type AcademicSession } from '../store/setup-store'
import { dummySessions } from '../store/dummy-data'

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

// ── API Calls with Dummy Data ──────────────────────────────────────────────────

// const fetchSessions = async () => {
//     await delay()
//     return { data: dummySessions }
// }

// const fetchSession = async (id: string) => {
//     await delay()
//     const session = dummySessions.find(s => s.id === id)
//     if (!session) throw new Error('Session not found')
//     return { data: session }
// }

// const createSession = async (payload: CreateSessionPayload) => {
//     await delay()
//     const newSession: AcademicSession = {
//         id: String(Date.now()),
//         name: payload.name,
//         start_date: payload.start_date,
//         end_date: payload.end_date,
//         is_active: payload.is_active || false,
//     }
//     dummySessions.push(newSession)
//     return { data: newSession }
// }

// const updateSession = async ({ id, ...payload }: UpdateSessionPayload) => {
//     await delay()
//     const index = dummySessions.findIndex(s => s.id === id)
//     if (index === -1) throw new Error('Session not found')

//     const updatedSession = {
//         ...dummySessions[index],
//         ...payload,
//     }
//     dummySessions[index] = updatedSession
//     return { data: updatedSession }
// }

// const deleteSession = async (id: string) => {
//     await delay()
//     const index = dummySessions.findIndex(s => s.id === id)
//     if (index !== -1) {
//         dummySessions.splice(index, 1)
//     }
//     return { data: undefined }
// }

// const activateSession = async (id: string) => {
//     await delay()
//     // Deactivate all sessions first
//     dummySessions.forEach(session => {
//         session.is_active = session.id === id
//     })

//     const activatedSession = dummySessions.find(s => s.id === id)
//     if (!activatedSession) throw new Error('Session not found')

//     return { data: activatedSession }
// }

// const generateFeeAccounts = async (sessionId: string) => {
//     await delay(1000) // Simulate longer processing time
//     // Simulate generating fee accounts (e.g., creating fee records for students)
//     const generated = Math.floor(Math.random() * 500) + 100 // Random number between 100-600
//     return { data: { generated } }
// }

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

