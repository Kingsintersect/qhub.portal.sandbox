'use client'

import { useState } from 'react'
import { Users, CheckCircle2, ArrowLeft, Zap, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { SectionHeader } from './SectionHeader'
import { useSetupStore } from '../store/setup-store'
import { useGenerateFeeAccounts } from '../services/academic-sessions'
import { useFeeStructures } from '../services/fee-structures'
import { useSemesters } from '../services/semesters'
import { cn } from '@/lib/utils'

export function GenerateAccountsPanel() {
    const { selectedSession, setCurrentStep, reset } = useSetupStore()
    const sessionId = selectedSession?.id ?? ''

    const { data: fees } = useFeeStructures(sessionId)
    const { data: semesters } = useSemesters(sessionId)

    const { mutateAsync: generate, isPending } = useGenerateFeeAccounts()
    const [result, setResult] = useState<{ generated: number } | null>(null)

    const handleGenerate = async () => {
        try {
            const res = await generate(sessionId)
            setResult(res)
            toast.success(`${res.generated} fee accounts generated successfully`)
        } catch (err: unknown) {
            toast.error((err as Error).message ?? 'Generation failed')
        }
    }

    const handleStartOver = () => {
        reset()
        setResult(null)
    }

    // Summary stats
    const uniquePrograms = new Set(fees?.map((f) => f.program_id) ?? []).size
    const uniqueLevels = new Set(fees?.map((f) => f.level) ?? []).size
    const semesterCount = semesters?.length ?? 0

    return (
        <div className="space-y-6">
            {/* Context banner */}
            <div className="flex items-center gap-2 rounded-lg bg-[oklch(0.97_0.05_165/0.25)] px-3 py-2 text-xs text-primary ring-1 ring-[oklch(0.8_0.1_165/0.3)]">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>Session: <strong>{selectedSession?.name}</strong></span>
            </div>

            <SectionHeader
                icon={Users}
                title="Generate Student Fee Accounts"
                description="Create fee accounts for all enrolled students based on the configured fee structures."
            />

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Semesters', value: semesterCount, color: 'oklch(0.837_0.128_66.29)' },
                    { label: 'Programs', value: uniquePrograms, color: 'oklch(0.508_0.118_165.612)' },
                    { label: 'Levels', value: uniqueLevels, color: 'oklch(0.705_0.213_47.604)' },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-border bg-card px-4 py-4 text-center"
                    >
                        <p
                            className="text-2xl font-bold tabular-nums"
                            style={{ color: item.color }}
                        >
                            {item.value}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Warning / info */}
            {!fees?.length ? (
                <div className="flex items-start gap-3 rounded-xl border border-[oklch(0.837_0.128_66.29/0.4)] bg-[oklch(0.837_0.128_66.29/0.08)] px-4 py-3.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.553_0.195_38.402)]" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">No fee structures found</p>
                        <p className="text-xs text-muted-foreground">
                            Please go back and configure fee structures before generating accounts.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-3 rounded-xl border border-[oklch(0.8_0.1_165/0.4)] bg-[oklch(0.97_0.05_165/0.15)] px-4 py-3.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            {fees.length} fee structure{fees.length !== 1 ? 's' : ''} ready
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Fee accounts will be generated for all enrolled students matching these configurations.
                            Existing accounts will not be duplicated.
                        </p>
                    </div>
                </div>
            )}

            {/* Success state */}
            {result && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.97_0.05_165/0.3)] ring-2 ring-primary">
                        <CheckCircle2 className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-foreground">
                            {result.generated.toLocaleString()} accounts generated
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Student fee accounts for <strong>{selectedSession?.name}</strong> have been created.
                        </p>
                    </div>
                    <Button
                        onClick={handleStartOver}
                        variant="outline"
                        size="sm"
                        className="mt-2 border-border text-foreground"
                    >
                        Setup Another Session
                    </Button>
                </div>
            )}

            {/* Actions */}
            {!result && (
                <div className="flex items-center justify-between pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep('fee-structures')}
                        className="gap-1.5 border-border text-foreground"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back
                    </Button>

                    <Button
                        size="sm"
                        disabled={isPending || !fees?.length}
                        onClick={handleGenerate}
                        className={cn(
                            'gap-1.5 border-destructive text-primary-foreground hover:opacity-90',
                            isPending && 'cursor-wait'
                        )}
                    >
                        <Zap className={cn('h-3.5 w-3.5', isPending && 'animate-pulse')} />
                        {isPending ? 'Generating…' : 'Generate Fee Accounts'}
                    </Button>
                </div>
            )}
        </div>
    )
}