'use client'

import { SetupStepper } from './components/SetupStepper'
import { AcademicSessionPanel } from './components/AcademicSessionPanel'
import { SemesterPanel } from './components/SemesterPanel'
import { FeeStructurePanel } from './components/FeeStructurePanel'
import { GenerateAccountsPanel } from './components/GenerateAccountsPanel'
import { useSetupStore } from './store/setup-store'

export default function SetupPage() {
    const { currentStep, setCurrentStep } = useSetupStore()

    const renderStep = () => {
        switch (currentStep) {
            case 'session':
                return <AcademicSessionPanel />
            case 'semesters':
                return <SemesterPanel />
            case 'fee-structures':
                return <FeeStructurePanel />
            case 'generate':
                return <GenerateAccountsPanel />
        }
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Initial Setup
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Configure academic sessions, semesters, and fee structures for your institution.
                </p>
            </div>

            {/* Stepper */}
            <div className="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
                <SetupStepper
                    currentStep={currentStep}
                    onStepClick={setCurrentStep}
                />
            </div>

            {/* Active step panel */}
            <div className="rounded-2xl border border-border bg-card px-6 py-6 shadow-sm">
                {renderStep()}
            </div>
        </div>
    )
}