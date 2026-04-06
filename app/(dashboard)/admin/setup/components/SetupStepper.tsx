'use client'

import { cn } from '@/lib/utils'
import { Check, CalendarDays, BookOpen, DollarSign, Users } from 'lucide-react'
import type { SetupStep } from '../store/setup-store'

interface Step {
    id: SetupStep
    label: string
    description: string
    icon: React.ElementType
}

const STEPS: Step[] = [
    {
        id: 'session',
        label: 'Academic Session',
        description: 'Create & manage sessions',
        icon: CalendarDays,
    },
    {
        id: 'semesters',
        label: 'Semesters',
        description: 'Add semesters to session',
        icon: BookOpen,
    },
    {
        id: 'fee-structures',
        label: 'Fee Structures',
        description: 'Configure program fees',
        icon: DollarSign,
    },
    {
        id: 'generate',
        label: 'Generate Accounts',
        description: 'Create student fee accounts',
        icon: Users,
    },
]

interface SetupStepperProps {
    currentStep: SetupStep
    onStepClick?: (step: SetupStep) => void
    completedSteps?: SetupStep[]
}

export function SetupStepper({ currentStep, onStepClick, completedSteps = [] }: SetupStepperProps) {
    const currentIndex = STEPS.findIndex((s) => s.id === currentStep)

    return (
        <nav aria-label="Setup progress" className="w-full">
            <ol className="flex items-center gap-0">
                {STEPS.map((step, idx) => {
                    const isCompleted = completedSteps.includes(step.id) || idx < currentIndex
                    const isCurrent = step.id === currentStep
                    const isClickable = isCompleted || isCurrent

                    return (
                        <li key={step.id} className="flex flex-1 items-center">
                            {/* Step circle + content */}
                            <button
                                type="button"
                                disabled={!isClickable}
                                onClick={() => isClickable && onStepClick?.(step.id)}
                                className={cn(
                                    'group flex flex-col items-center gap-2 transition-opacity',
                                    isClickable ? 'cursor-pointer' : 'cursor-default opacity-50'
                                )}
                            >
                                <div
                                    className={cn(
                                        'relative flex h-9 w-9 items-center justify-center rounded-full ring-2 transition-all duration-200',
                                        isCompleted
                                            ? 'border-destructive ring-primary text-primary-foreground'
                                            : isCurrent
                                                ? 'bg-background ring-primary text-primary'
                                                : 'bg-muted ring-border text-muted-foreground'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4" strokeWidth={2.5} />
                                    ) : (
                                        <step.icon className="h-4 w-4" />
                                    )}
                                    {isCurrent && (
                                        <span className="absolute -inset-1 animate-ping rounded-full border-destructive opacity-20" />
                                    )}
                                </div>

                                <div className="hidden sm:block text-center">
                                    <p
                                        className={cn(
                                            'text-xs font-semibold leading-none',
                                            isCurrent
                                                ? 'text-primary'
                                                : isCompleted
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            </button>

                            {/* Connector line */}
                            {idx < STEPS.length - 1 && (
                                <div className="mx-2 h-px flex-1 transition-colors duration-300"
                                    style={{
                                        background: idx < currentIndex
                                            ? 'var(--primary)'
                                            : 'var(--border)',
                                    }}
                                />
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}