import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'

export type RequestOptions = {
    access_token?: boolean
    headers?: Record<string, string>
    params?: Record<string, unknown>
    timeout?: number
}

export class ApiClientError extends Error {
    public original?: unknown
    public status?: number
    public data?: unknown

    constructor(message: string, original?: unknown, status?: number, data?: unknown) {
        super(message)
        this.name = 'ApiClientError'
        this.original = original
        this.status = status
        this.data = data
    }
}

/**
 * ApiClient
 * - wraps axios
 * - reads token from memory/local/session when opts.access_token === true
 * - exposes setAccessToken/clearAccessToken and setBaseURL helpers
 */
export class ApiClient {
    private axios: AxiosInstance
    private memoryToken: string | null = null

    constructor(baseURL = '', timeout = 10000) {
        this.axios = axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    /**
     * Set token programmatically.
     * persistence: 'memory' | 'local' | 'session'
     * - 'memory' keeps token in memory (default)
     * - 'local' persists to localStorage
     * - 'session' persists to sessionStorage
     */
    setAccessToken(token: string | null, persistence: 'memory' | 'local' | 'session' = 'memory'): void {
        this.memoryToken = token
        if (typeof window === 'undefined') return
        try {
            if (persistence === 'local') {
                if (token) localStorage.setItem('access_token', token)
                else localStorage.removeItem('access_token')
            } else if (persistence === 'session') {
                if (token) sessionStorage.setItem('access_token', token)
                else sessionStorage.removeItem('access_token')
            }
        } catch {
            // ignore storage errors (e.g., disabled storage)
        }
    }

    clearAccessToken(): void {
        this.memoryToken = null
        if (typeof window !== 'undefined') {
            try { localStorage.removeItem('access_token') } catch { }
            try { sessionStorage.removeItem('access_token') } catch { }
        }
    }

    setBaseURL(url: string): void {
        this.axios.defaults.baseURL = url
    }

    // internal: pick token from memory then storages
    private pickAuthToken(): string | null {
        if (this.memoryToken) return this.memoryToken
        if (typeof window === 'undefined') return null
        try {
            return localStorage.getItem('access_token') ?? sessionStorage.getItem('access_token') ?? null
        } catch {
            return null
        }
    }

    // central request method
    private async request<TResponse>(
        method: AxiosRequestConfig['method'],
        url: string,
        data?: unknown,
        opts: RequestOptions = {}
    ): Promise<TResponse> {
        try {
            const headers: Record<string, string> = { ...(opts.headers ?? {}) }
            if (opts.access_token) {
                const token = this.pickAuthToken()
                if (token) headers['Authorization'] = `Bearer ${token}`
            }

            const res = await this.axios.request<TResponse>({
                url,
                method,
                data,
                params: opts.params,
                headers,
                timeout: opts.timeout ?? this.axios.defaults.timeout,
            } as AxiosRequestConfig)

            return res.data
        } catch (error: unknown) {
            // Normalize error
            let message = 'An unexpected error occurred.'
            let status: number | undefined
            let data: unknown | undefined
            if (axios.isAxiosError(error)) {
                const axiosErr = error as AxiosError & { response?: { status?: number; data?: unknown } }
                status = axiosErr.response?.status
                data = axiosErr.response?.data
                if (axiosErr.response?.data && typeof axiosErr.response.data === 'object' && axiosErr.response.data !== null) {
                    // try to extract a message field if present
                    const maybeMsg = (axiosErr.response.data as { message?: unknown }).message
                    if (typeof maybeMsg === 'string') message = maybeMsg
                    else if (axiosErr.response?.statusText) message = axiosErr.response.statusText
                    else message = `Server error (${status ?? 'unknown'})`
                } else if (typeof axiosErr.response?.data === 'string') {
                    message = axiosErr.response.data
                } else if (axiosErr.message) {
                    message = axiosErr.message
                }
            } else if (error instanceof Error) {
                message = error.message
            } else if (typeof error === 'string') {
                message = error
            }

            const apiError = new ApiClientError(message, error, status, data)
            throw apiError
        }
    }

    // convenience methods (generic)
    async get<TResponse>(url: string, opts?: RequestOptions): Promise<TResponse> {
        return this.request<TResponse>('GET', url, undefined, opts)
    }

    async post<TResponse>(url: string, body?: unknown, opts?: RequestOptions): Promise<TResponse> {
        return this.request<TResponse>('POST', url, body, opts)
    }

    async put<TResponse>(url: string, body?: unknown, opts?: RequestOptions): Promise<TResponse> {
        return this.request<TResponse>('PUT', url, body, opts)
    }

    async delete<TResponse>(url: string, opts?: RequestOptions): Promise<TResponse> {
        return this.request<TResponse>('DELETE', url, undefined, opts)
    }
}

// default singleton instance (you can import and use directly)
const apiClient = new ApiClient('', 10000)
export default apiClient