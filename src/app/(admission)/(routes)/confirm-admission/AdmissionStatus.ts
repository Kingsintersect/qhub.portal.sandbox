// types/admission.ts
export type AdmissionStatus =
    | 'APPLIED'
    | 'IN_PROGRESS'
    | 'ADMITTED'
    | 'REJECTED'
    | 'ENROLLED';

export interface AdmissionData {
    id: string;
    studentId: string;
    program: string;
    status: AdmissionStatus;
    admissionDate: string;
    deadline: string;
    documents: AdmissionDocument[];
}

export interface AdmissionDocument {
    name: string;
    status: 'PENDING' | 'SUBMITTED' | 'VERIFIED';
    required: boolean;
}