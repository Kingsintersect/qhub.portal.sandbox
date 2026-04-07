import { create } from 'zustand'

export type SetupStep = 'session' | 'semesters' | 'fee-structures' | 'generate'

export interface AcademicSession {
    id: string
    name: string
    start_date: string
    end_date: string
    is_active: boolean
}

export interface Semester {
    id: string
    academic_session_id: string
    name: string
    sequence_no: number
    is_active: boolean
}

export interface FeeStructure {
    id: string
    academic_session_id: string
    semester_id: string
    program_id: string
    level: string
    total_amount: number
    description: string
}

interface SetupStore {
    currentStep: SetupStep
    selectedSession: AcademicSession | null
    selectedSemester: Semester | null

    setCurrentStep: (step: SetupStep) => void
    setSelectedSession: (session: AcademicSession | null) => void
    setSelectedSemester: (semester: Semester | null) => void
    goToNextStep: () => void
    goToPrevStep: () => void
    reset: () => void
}

// Helper function to simulate API delay
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

const STEPS: SetupStep[] = ['session', 'semesters', 'fee-structures', 'generate']

export const useSetupStore = create<SetupStore>((set, get) => ({
    currentStep: 'session',
    selectedSession: null,
    selectedSemester: null,

    setCurrentStep: (step) => set({ currentStep: step }),
    setSelectedSession: (session) => set({ selectedSession: session }),
    setSelectedSemester: (semester) => set({ selectedSemester: semester }),

    goToNextStep: () => {
        const idx = STEPS.indexOf(get().currentStep)
        if (idx < STEPS.length - 1) set({ currentStep: STEPS[idx + 1] })
    },

    goToPrevStep: () => {
        const idx = STEPS.indexOf(get().currentStep)
        if (idx > 0) set({ currentStep: STEPS[idx - 1] })
    },

    reset: () =>
        set({ currentStep: 'session', selectedSession: null, selectedSemester: null }),
}))