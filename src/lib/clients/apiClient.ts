import { API_BASE_URL } from '@/config/global.config'
import {
   mutationOptions,
   queryOptions,
   type MutationOptions,
   type QueryKey,
   type QueryOptions,
} from '@tanstack/react-query'
import axios, {
   AxiosError,
   AxiosHeaders,
   type AxiosInstance,
   type AxiosRequestConfig,
   type InternalAxiosRequestConfig,
   type AxiosResponse,
} from 'axios'

export type TokenPersistence = 'memory' | 'local' | 'session'

export type RequestOptions = {
   access_token?: boolean
   headers?: Record<string, string>
   params?: Record<string, unknown>
   timeout?: number
   skipAuthRefresh?: boolean
   meta?: Record<string, unknown>
}

type RequestMethod = NonNullable<AxiosRequestConfig['method']>

type ApiRequestConfig = AxiosRequestConfig & {
   _retry?: boolean
   _accessToken?: boolean
   _skipAuthRefresh?: boolean
   _requestMeta?: {
      startedAt: number
      meta?: Record<string, unknown>
   }
}

type ApiInternalRequestConfig = InternalAxiosRequestConfig & {
   _retry?: boolean
   _accessToken?: boolean
   _skipAuthRefresh?: boolean
   _requestMeta?: {
      startedAt: number
      meta?: Record<string, unknown>
   }
}

export type ApiClientHooks = {
   onRequest?: (config: ApiRequestConfig) => void | Promise<void>
   onResponse?: (response: AxiosResponse) => void | Promise<void>
   onResponseError?: (error: ApiClientError) => void | Promise<void>
   onUnauthorized?: (error: ApiClientError) => void | Promise<void>
   onForbidden?: (error: ApiClientError) => void | Promise<void>
   onTokenRefreshed?: (token: string | null) => void | Promise<void>
}

export type ApiRefreshHandler = (context: {
   error: AxiosError
   client: ApiClient
}) => Promise<string | null>

export type ApiLogger = (event: {
   phase: 'request' | 'response' | 'error' | 'refresh'
   method?: string
   url?: string
   status?: number
   durationMs?: number
   message?: string
   meta?: Record<string, unknown>
}) => void

export type ApiClientConfig = {
   baseURL?: string
   timeout?: number
   defaultHeaders?: Record<string, string>
   enableLogging?: boolean
   logger?: ApiLogger
   hooks?: ApiClientHooks
   refreshAccessToken?: ApiRefreshHandler
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

type QueryFactoryConfig<TResponse> = {
   queryKey: QueryKey
   queryFn: () => Promise<TResponse>
} & Omit<QueryOptions<TResponse, ApiClientError, TResponse, QueryKey>, 'queryKey' | 'queryFn'>

type MutationFactoryConfig<TResponse, TVariables> = {
   mutationKey?: QueryKey
   mutationFn: (variables: TVariables) => Promise<TResponse>
} & Omit<MutationOptions<TResponse, ApiClientError, TVariables, unknown>, 'mutationKey' | 'mutationFn'>

/**
 * ApiClient
 * - wraps axios
 * - supports token refresh, logging, and global lifecycle hooks
 * - exposes React Query option builders for a consistent data layer pattern
 */
export class ApiClient {
   private axios: AxiosInstance
   private memoryToken: string | null = null
   private config: Required<Pick<ApiClientConfig, 'enableLogging'>> & Omit<ApiClientConfig, 'enableLogging'>

   constructor(config: ApiClientConfig = {}) {
      this.config = {
         baseURL: config.baseURL ?? API_BASE_URL,
         timeout: config.timeout ?? 10000,
         defaultHeaders: config.defaultHeaders ?? {},
         enableLogging: config.enableLogging ?? false,
         logger: config.logger,
         hooks: config.hooks,
         refreshAccessToken: config.refreshAccessToken,
      }

      this.axios = axios.create({
         baseURL: this.config.baseURL,
         timeout: this.config.timeout,
         headers: {
            'Content-Type': 'application/json',
            ...this.config.defaultHeaders,
         },
      })

      this.registerInterceptors()
   }

   setConfig(config: Partial<ApiClientConfig>): void {
      this.config = {
         ...this.config,
         ...config,
         enableLogging: config.enableLogging ?? this.config.enableLogging,
         defaultHeaders: config.defaultHeaders ?? this.config.defaultHeaders,
         hooks: {
            ...this.config.hooks,
            ...config.hooks,
         },
      }

      if (config.baseURL) this.axios.defaults.baseURL = config.baseURL
      if (config.timeout) this.axios.defaults.timeout = config.timeout
      if (config.defaultHeaders) {
         Object.entries(config.defaultHeaders).forEach(([key, value]) => {
            this.axios.defaults.headers.common[key] = value
         })
      }
   }

   setHooks(hooks: Partial<ApiClientHooks>): void {
      this.setConfig({ hooks })
   }

   setRefreshHandler(refreshAccessToken?: ApiRefreshHandler): void {
      this.setConfig({ refreshAccessToken })
   }

   setLogger(logger?: ApiLogger, enableLogging = true): void {
      this.setConfig({ logger, enableLogging })
   }

   /**
    * Set token programmatically.
    * persistence: 'memory' | 'local' | 'session'
    */
   setAccessToken(token: string | null, persistence: TokenPersistence = 'memory'): void {
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

   setDefaultHeader(key: string, value: string | null): void {
      if (!value) {
         delete this.axios.defaults.headers.common[key]
         return
      }
      this.axios.defaults.headers.common[key] = value
   }

   getAxiosInstance(): AxiosInstance {
      return this.axios
   }

   buildQueryOptions<TResponse>(config: QueryFactoryConfig<TResponse>) {
      return queryOptions(config)
   }

   buildMutationOptions<TResponse, TVariables = void>(config: MutationFactoryConfig<TResponse, TVariables>) {
      return mutationOptions(config)
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

   private emitLog(event: Parameters<NonNullable<ApiLogger>>[0]): void {
      if (!this.config.enableLogging || !this.config.logger) return
      this.config.logger(event)
   }

   private normalizeError(error: unknown): ApiClientError {
      let message = 'An unexpected error occurred.'
      let status: number | undefined
      let data: unknown | undefined

      if (axios.isAxiosError(error)) {
         const axiosErr = error as AxiosError & { response?: { status?: number; data?: unknown } }
         status = axiosErr.response?.status
         data = axiosErr.response?.data

         if (axiosErr.response?.data && typeof axiosErr.response.data === 'object' && axiosErr.response.data !== null) {
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

      return new ApiClientError(message, error, status, data)
   }

   private registerInterceptors(): void {
      this.axios.interceptors.request.use(async (config) => {
         const requestConfig = config as ApiInternalRequestConfig
         requestConfig._requestMeta = {
            startedAt: Date.now(),
            meta: requestConfig._requestMeta?.meta,
         }

         if (requestConfig._accessToken) {
            const token = this.pickAuthToken()
            if (token) {
               const headers = new AxiosHeaders(requestConfig.headers as AxiosHeaders | Record<string, string> | undefined)
               headers.set('Authorization', `Bearer ${token}`)
               requestConfig.headers = headers
            }
         }

         await this.config.hooks?.onRequest?.(requestConfig)

         this.emitLog({
            phase: 'request',
            method: requestConfig.method?.toUpperCase(),
            url: requestConfig.url,
            meta: requestConfig._requestMeta?.meta,
         })

         return requestConfig
      })

      this.axios.interceptors.response.use(
         async (response) => {
            const requestConfig = response.config as ApiRequestConfig
            const durationMs = requestConfig._requestMeta
               ? Date.now() - requestConfig._requestMeta.startedAt
               : undefined

            await this.config.hooks?.onResponse?.(response)

            this.emitLog({
               phase: 'response',
               method: response.config.method?.toUpperCase(),
               url: response.config.url,
               status: response.status,
               durationMs,
               meta: requestConfig._requestMeta?.meta,
            })

            return response
         },
         async (error: AxiosError) => {
            const requestConfig = (error.config ?? {}) as ApiRequestConfig

            if (
               error.response?.status === 401 &&
               requestConfig._accessToken &&
               !requestConfig._retry &&
               !requestConfig._skipAuthRefresh &&
               this.config.refreshAccessToken
            ) {
               requestConfig._retry = true

               try {
                  const refreshedToken = await this.config.refreshAccessToken({
                     error,
                     client: this,
                  })

                  this.setAccessToken(refreshedToken, 'memory')
                  await this.config.hooks?.onTokenRefreshed?.(refreshedToken)

                  this.emitLog({
                     phase: 'refresh',
                     method: requestConfig.method?.toUpperCase(),
                     url: requestConfig.url,
                     message: refreshedToken ? 'token refreshed' : 'token refresh returned empty token',
                     meta: requestConfig._requestMeta?.meta,
                  })

                  if (refreshedToken) {
                     const headers = new AxiosHeaders(requestConfig.headers as AxiosHeaders | Record<string, string> | undefined)
                     headers.set('Authorization', `Bearer ${refreshedToken}`)
                     requestConfig.headers = headers
                     return this.axios.request(requestConfig)
                  }
               } catch (refreshError) {
                  const normalizedRefreshError = this.normalizeError(refreshError)
                  await this.config.hooks?.onUnauthorized?.(normalizedRefreshError)
                  await this.config.hooks?.onResponseError?.(normalizedRefreshError)
                  throw normalizedRefreshError
               }
            }

            const normalizedError = this.normalizeError(error)
            const durationMs = requestConfig._requestMeta
               ? Date.now() - requestConfig._requestMeta.startedAt
               : undefined

            if (normalizedError.status === 401) {
               await this.config.hooks?.onUnauthorized?.(normalizedError)
            }

            if (normalizedError.status === 403) {
               await this.config.hooks?.onForbidden?.(normalizedError)
            }

            await this.config.hooks?.onResponseError?.(normalizedError)

            this.emitLog({
               phase: 'error',
               method: requestConfig.method?.toUpperCase(),
               url: requestConfig.url,
               status: normalizedError.status,
               durationMs,
               message: normalizedError.message,
               meta: requestConfig._requestMeta?.meta,
            })

            throw normalizedError
         }
      )
   }

   // central request method
   private async request<TResponse, TBody = unknown>(
      method: RequestMethod,
      url: string,
      data?: TBody,
      opts: RequestOptions = {}
   ): Promise<TResponse> {
      const headers = AxiosHeaders.from(opts.headers ?? {})

      const response = await this.axios.request<TResponse>({
         url,
         method,
         data,
         params: opts.params,
         headers,
         timeout: opts.timeout ?? this.axios.defaults.timeout,
         _accessToken: opts.access_token,
         _skipAuthRefresh: opts.skipAuthRefresh,
         _requestMeta: {
            startedAt: Date.now(),
            meta: opts.meta,
         },
      } as ApiRequestConfig)

      return response.data
   }

   // convenience methods (generic)
   async get<TResponse>(url: string, opts?: RequestOptions): Promise<TResponse> {
      return this.request<TResponse>('GET', url, undefined, opts)
   }

   async post<TResponse, TBody = unknown>(url: string, body?: TBody, opts?: RequestOptions): Promise<TResponse> {
      return this.request<TResponse, TBody>('POST', url, body, opts)
   }

   async put<TResponse, TBody = unknown>(url: string, body?: TBody, opts?: RequestOptions): Promise<TResponse> {
      return this.request<TResponse, TBody>('PUT', url, body, opts)
   }

   async patch<TResponse, TBody = unknown>(url: string, body?: TBody, opts?: RequestOptions): Promise<TResponse> {
      return this.request<TResponse, TBody>('PATCH', url, body, opts)
   }

   async delete<TResponse>(url: string, opts?: RequestOptions): Promise<TResponse> {
      return this.request<TResponse>('DELETE', url, undefined, opts)
   }
}

export function createApiQueryOptions<TResponse>(config: QueryFactoryConfig<TResponse>) {
   return queryOptions(config)
}

export function createApiMutationOptions<TResponse, TVariables = void>(
   config: MutationFactoryConfig<TResponse, TVariables>
) {
   return mutationOptions(config)
}

// default singleton instance (you can import and use directly)
const apiClient = new ApiClient({
   baseURL: API_BASE_URL,
   timeout: 10000,
})

export default apiClient