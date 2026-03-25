'use client'
import apiClient, { ApiClientError } from '@/lib/clients/apiClient'
import { useQuery } from '@tanstack/react-query'

// Strongly typed API responses
export interface StatsResponse {
    students: number
    faculties: number
    research_grants: number
    alumni: number
}

export interface Department {
    slug: string
    name: string
    desc: string
    programs?: string[]
}

export function useStats() {
    return useQuery<StatsResponse, ApiClientError>({
        queryKey: ['stats'],
        queryFn: async () => {
            return apiClient.get<StatsResponse>('/api/stats', { access_token: false })
        },
        staleTime: 1000 * 20,
        retry: 1,
    })
}

export function useDepartments() {
    return useQuery<Department[], ApiClientError>({
        queryKey: ['departments'],
        queryFn: async () => {
            return apiClient.get<Department[]>('/api/departments', { access_token: false })
        },
        staleTime: 1000 * 60,
        retry: 1,
    })
}

export function useDepartment(slug?: string) {
    return useQuery<Department, ApiClientError>({
        queryKey: ['department', slug],
        queryFn: async () => {
            if (!slug) throw new Error('Missing department slug')
            return apiClient.get<Department>(`/api/departments/${slug}`, { access_token: false })
        },
        enabled: !!slug,
        staleTime: 1000 * 60,
        retry: 1,
    })
}