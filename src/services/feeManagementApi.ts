import apiClient from "@/lib/clients/apiClient";
import type {
    AcademicSession,
    Semester,
    FeeStructure,
    Program,
    CreateAcademicSessionPayload,
    UpdateAcademicSessionPayload,
    CreateSemesterPayload,
    CreateFeeStructurePayload,
    GenerateFeeAccountsPayload,
    GenerateFeeAccountsResponse,
    ApiListResponse,
    ApiSingleResponse,
} from "@/types/school";

const AUTH = { access_token: true };

// ── Academic Sessions ───────────────────────

export const academicSessionApi = {
    list: () =>
        apiClient.get<ApiListResponse<AcademicSession>>(
            "/api/v1/academic-sessions",
            AUTH
        ),

    getById: (id: string) =>
        apiClient.get<ApiSingleResponse<AcademicSession>>(
            `/api/v1/academic-sessions/${id}`,
            AUTH
        ),

    create: (payload: CreateAcademicSessionPayload) =>
        apiClient.post<ApiSingleResponse<AcademicSession>>(
            "/api/v1/academic-sessions",
            payload,
            AUTH
        ),

    update: (id: string, payload: UpdateAcademicSessionPayload) =>
        apiClient.put<ApiSingleResponse<AcademicSession>>(
            `/api/v1/academic-sessions/${id}`,
            payload,
            AUTH
        ),

    delete: (id: string) =>
        apiClient.delete<{ message: string }>(
            `/api/v1/academic-sessions/${id}`,
            AUTH
        ),

    activate: (id: string) =>
        apiClient.put<ApiSingleResponse<AcademicSession>>(
            `/api/v1/academic-sessions/${id}/activate`,
            {},
            AUTH
        ),
};

// ── Semesters ───────────────────────────────

export const semesterApi = {
    listBySession: (sessionId: string) =>
        apiClient.get<ApiListResponse<Semester>>(
            `/api/v1/academic-sessions/${sessionId}/semesters`,
            AUTH
        ),

    create: (payload: CreateSemesterPayload) =>
        apiClient.post<ApiSingleResponse<Semester>>(
            "/api/v1/semesters",
            payload,
            AUTH
        ),

    update: (id: string, payload: Partial<CreateSemesterPayload>) =>
        apiClient.put<ApiSingleResponse<Semester>>(
            `/api/v1/semesters/${id}`,
            payload,
            AUTH
        ),

    delete: (id: string) =>
        apiClient.delete<{ message: string }>(`/api/v1/semesters/${id}`, AUTH),

    activate: (id: string) =>
        apiClient.put<ApiSingleResponse<Semester>>(
            `/api/v1/semesters/${id}/activate`,
            {},
            AUTH
        ),
};

// ── Fee Structures ──────────────────────────

export const feeStructureApi = {
    listBySession: (sessionId: string) =>
        apiClient.get<ApiListResponse<FeeStructure>>(
            `/api/v1/academic-sessions/${sessionId}/fee-structures`,
            AUTH
        ),

    create: (payload: CreateFeeStructurePayload) =>
        apiClient.post<ApiSingleResponse<FeeStructure>>(
            "/api/v1/fee-structures",
            payload,
            AUTH
        ),

    update: (id: string, payload: Partial<CreateFeeStructurePayload>) =>
        apiClient.put<ApiSingleResponse<FeeStructure>>(
            `/api/v1/fee-structures/${id}`,
            payload,
            AUTH
        ),

    delete: (id: string) =>
        apiClient.delete<{ message: string }>(
            `/api/v1/fee-structures/${id}`,
            AUTH
        ),
};

// ── Programs (lookup) ───────────────────────

export const programApi = {
    list: () =>
        apiClient.get<ApiListResponse<Program>>("/api/v1/programs", AUTH),
};

// ── Student Fee Account Generation ──────────

export const feeAccountApi = {
    generate: (payload: GenerateFeeAccountsPayload) =>
        apiClient.post<GenerateFeeAccountsResponse>(
            "/api/v1/fee-accounts/generate",
            payload,
            AUTH
        ),
};
