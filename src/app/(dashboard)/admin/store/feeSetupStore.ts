import { create } from "zustand";

export type SetupStep =
    | "fee-structures"
    | "generate";

interface FeeSetupState {
    currentStep: SetupStep;
    setCurrentStep: (step: SetupStep) => void;

    selectedSessionId: string | null;
    selectedSessionName: string | null;
    setSelectedSession: (id: string, name: string) => void;
    clearSelectedSession: () => void;

    reset: () => void;
}

export const useFeeSetupStore = create<FeeSetupState>()((set) => ({
    currentStep: "fee-structures",
    setCurrentStep: (step) => set({ currentStep: step }),

    selectedSessionId: null,
    selectedSessionName: null,
    setSelectedSession: (id, name) =>
        set({ selectedSessionId: id, selectedSessionName: name }),
    clearSelectedSession: () =>
        set({
            selectedSessionId: null,
            selectedSessionName: null,
            currentStep: "fee-structures",
        }),

    reset: () =>
        set({
            currentStep: "fee-structures",
            selectedSessionId: null,
            selectedSessionName: null,
        }),
}));
