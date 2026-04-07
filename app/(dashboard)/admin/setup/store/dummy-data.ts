// ── Dummy Data ──────────────────────────────────────────────────────────────────

import { AcademicSession, FeeStructure, Semester } from "./setup-store"

// Sample academic sessions
export const dummySessions: AcademicSession[] = [
    {
        id: '1',
        name: '2023-2024 Academic Year',
        start_date: '2023-09-01',
        end_date: '2024-06-15',
        is_active: true,
    },
    {
        id: '2',
        name: '2024-2025 Academic Year',
        start_date: '2024-09-01',
        end_date: '2025-06-15',
        is_active: false,
    },
    {
        id: '3',
        name: '2025-2026 Academic Year',
        start_date: '2025-09-01',
        end_date: '2026-06-15',
        is_active: false,
    },
]

// Sample semesters
export const dummySemesters: Record<string, Semester[]> = {
    '1': [
        { id: '101', academic_session_id: '1', name: 'Fall 2023', sequence_no: 1, is_active: true },
        { id: '102', academic_session_id: '1', name: 'Spring 2024', sequence_no: 2, is_active: false },
    ],
    '2': [
        { id: '201', academic_session_id: '2', name: 'Fall 2024', sequence_no: 1, is_active: true },
        { id: '202', academic_session_id: '2', name: 'Spring 2025', sequence_no: 2, is_active: false },
    ],
    '3': [
        { id: '301', academic_session_id: '3', name: 'Fall 2025', sequence_no: 1, is_active: true },
        { id: '302', academic_session_id: '3', name: 'Spring 2026', sequence_no: 2, is_active: false },
    ],
}

// Sample fee structures
export const dummyFeeStructures: Record<string, FeeStructure[]> = {
    '1': [
        {
            id: '1001',
            academic_session_id: '1',
            semester_id: '101',
            program_id: 'CS001',
            level: '100',
            total_amount: 250000,
            description: 'Computer Science - Level 100',
        },
        {
            id: '1002',
            academic_session_id: '1',
            semester_id: '101',
            program_id: 'CS001',
            level: '200',
            total_amount: 260000,
            description: 'Computer Science - Level 200',
        },
        {
            id: '1003',
            academic_session_id: '1',
            semester_id: '102',
            program_id: 'CS001',
            level: '100',
            total_amount: 250000,
            description: 'Computer Science - Level 100',
        },
    ],
    '2': [
        {
            id: '2001',
            academic_session_id: '2',
            semester_id: '201',
            program_id: 'CS001',
            level: '100',
            total_amount: 275000,
            description: 'Computer Science - Level 100',
        },
        {
            id: '2002',
            academic_session_id: '2',
            semester_id: '201',
            program_id: 'CS001',
            level: '200',
            total_amount: 285000,
            description: 'Computer Science - Level 200',
        },
    ],
}
