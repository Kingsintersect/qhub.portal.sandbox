// lib/db/admission-mock.ts
// Mock database functions for development

interface DBResult {
    success: boolean;
    error?: string;
    data?: Record<string, unknown>;
}

export async function updateAdmissionStatusInDB(
    userEmail: string,
    status: string
): Promise<DBResult> {
    console.log(`Mock: Updating admission status for user ${userEmail} to ${status}`);

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
        success: true,
        data: {
            status,
            updatedAt: new Date().toISOString(),
            studentId: `STU${Date.now().toString().slice(-6)}`,
        }
    };
}

export async function saveAdmissionFormData(
    userEmail: string,
    formData: unknown
): Promise<DBResult> {
    console.log(`Mock: Saving form data for user ${userEmail}:`, formData);

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
        success: true,
        data: {
            saved: true,
            timestamp: new Date().toISOString(),
        }
    };
}
