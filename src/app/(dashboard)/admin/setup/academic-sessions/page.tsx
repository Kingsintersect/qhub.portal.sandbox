"use client";

import { useAcademicSessionSetupStore } from "../../store/academicSessionSetupStore";
import { SetupStepper } from "./components/SetupStepper";
import { AcademicSessionManager } from "./components/AcademicSessionManager";
import { SemesterManager } from "./components/SemesterManager";

export default function AcademicSessionPage() {
    const { currentStep } = useAcademicSessionSetupStore();

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Page title */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Academic Sessions
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manage academic sessions and their semester periods.
                </p>
            </div>

            {/* Stepper */}
            <SetupStepper />

            {/* Step content */}
            {currentStep === "sessions" && <AcademicSessionManager />}
            {currentStep === "semesters" && <SemesterManager />}
        </div>
    );
}