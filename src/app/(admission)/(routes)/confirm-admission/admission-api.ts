interface UpdateStatusPayload {
    status: 'ADMITTED';
    email: string;
}

interface UpdateStatusResponse {
    success: boolean;
    message?: string;
    error?: string;
    data?: {
        status: string;
        updatedAt: string;
        studentId: string;
        formDataReceived: boolean;
    };
}

export async function updateAdmissionStatus(
    payload: UpdateStatusPayload
): Promise<UpdateStatusResponse> {
    try {
        const response = await fetch('/api/admission/status', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.error || `HTTP error! status: ${response.status}`
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating admission status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}