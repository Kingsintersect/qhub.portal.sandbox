'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DollarSign, Plus, Pencil, Trash2, ArrowLeft, ChevronRight, Filter } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

import { EmptyState } from './EmptyState'
import { ConfirmDialog } from './ConfirmDialog'
import { SectionHeader } from './SectionHeader'

import { useSemesters } from '../services/semesters'
import {
    useFeeStructures,
    usePrograms,
    useCreateFeeStructure,
    useUpdateFeeStructure,
    useDeleteFeeStructure,
} from '../services/fee-structures'
import type { FeeStructure } from '../store/setup-store'
import { useSetupStore } from '../store/setup-store'

// ── Constants ──────────────────────────────────────────────────────────────────

const LEVELS = [
    '100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level',
]

// ── Schema ─────────────────────────────────────────────────────────────────────

const feeSchema = z.object({
    semester_id: z.string().min(1, 'Semester is required'),
    program_id: z.string().min(1, 'Program is required'),
    level: z.string().min(1, 'Level is required'),
    total_amount: z.number().min(0, 'Amount must be ≥ 0'),
    description: z.string().max(200),
})

type FeeFormValues = z.infer<typeof feeSchema>

// ── Form Dialog ────────────────────────────────────────────────────────────────

interface FeeFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sessionId: string
    editing?: FeeStructure | null
}

function FeeFormDialog({ open, onOpenChange, sessionId, editing }: FeeFormDialogProps) {
    const { data: semesters } = useSemesters(sessionId)
    const { data: programs } = usePrograms()
    const { mutateAsync: create, isPending: creating } = useCreateFeeStructure()
    const { mutateAsync: update, isPending: updating } = useUpdateFeeStructure()

    const form = useForm<FeeFormValues>({
        resolver: zodResolver(feeSchema),
        defaultValues: editing
            ? {
                semester_id: editing.semester_id,
                program_id: editing.program_id,
                level: editing.level,
                total_amount: editing.total_amount,
                description: editing.description,
            }
            : { semester_id: '', program_id: '', level: '', total_amount: 0, description: '' },
    })

    const onSubmit = async (values: FeeFormValues) => {
        try {
            if (editing) {
                await update({ id: editing.id, academic_session_id: sessionId, ...values })
                toast.success('Fee structure updated')
            } else {
                await create({ academic_session_id: sessionId, ...values } as Parameters<typeof create>[0])
                toast.success('Fee structure created')
            }
            onOpenChange(false)
            form.reset()
        } catch (err: unknown) {
            toast.error((err as Error).message ?? 'Something went wrong')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                        {editing ? 'Edit Fee Structure' : 'Add Fee Structure'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Semester */}
                        <div className="space-y-1.5">
                            <Label className="text-foreground">Semester</Label>
                            <Select
                                value={form.watch('semester_id')}
                                onValueChange={(v) => form.setValue('semester_id', v)}
                            >
                                <SelectTrigger className="border-input bg-background">
                                    <SelectValue placeholder="Select semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesters?.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.semester_id && (
                                <p className="text-xs text-destructive">{form.formState.errors.semester_id.message}</p>
                            )}
                        </div>

                        {/* Level */}
                        <div className="space-y-1.5">
                            <Label className="text-foreground">Level</Label>
                            <Select
                                value={form.watch('level')}
                                onValueChange={(v) => form.setValue('level', v)}
                            >
                                <SelectTrigger className="border-input bg-background">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEVELS.map((l) => (
                                        <SelectItem key={l} value={l}>{l}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.level && (
                                <p className="text-xs text-destructive">{form.formState.errors.level.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Program */}
                    <div className="space-y-1.5">
                        <Label className="text-foreground">Program</Label>
                        <Select
                            value={form.watch('program_id')}
                            onValueChange={(v) => form.setValue('program_id', v)}
                        >
                            <SelectTrigger className="border-input bg-background">
                                <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                                {programs?.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.program_id && (
                            <p className="text-xs text-destructive">{form.formState.errors.program_id.message}</p>
                        )}
                    </div>

                    {/* Total Amount */}
                    <div className="space-y-1.5">
                        <Label htmlFor="amount" className="text-foreground">Total Amount (₦)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₦</span>
                            <Input
                                id="amount"
                                type="number"
                                min={0}
                                step={100}
                                className="border-input bg-background pl-7 text-foreground"
                                {...form.register('total_amount')}
                            />
                        </div>
                        {form.formState.errors.total_amount && (
                            <p className="text-xs text-destructive">{form.formState.errors.total_amount.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="desc" className="text-foreground">Description <span className="text-muted-foreground">(optional)</span></Label>
                        <Textarea
                            id="desc"
                            rows={2}
                            placeholder="Brief description of what this fee covers…"
                            className="resize-none border-input bg-background text-foreground"
                            {...form.register('description')}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-border text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creating || updating}
                            className="border-destructive text-primary-foreground hover:opacity-90"
                        >
                            {creating || updating ? 'Saving…' : editing ? 'Update' : 'Add Fee Structure'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ── Fee Row ────────────────────────────────────────────────────────────────────

function FeeRow({
    fee,
    programs,
    semesters,
    onEdit,
    onDelete,
}: {
    fee: FeeStructure
    programs: { id: string; name: string; code: string }[]
    semesters: { id: string; name: string }[]
    onEdit: () => void
    onDelete: () => void
}) {
    const program = programs.find((p) => p.id === fee.program_id)
    const semester = semesters.find((s) => s.id === fee.semester_id)

    return (
        <tr className="border-b border-border transition-colors hover:bg-muted/50]">
            <td className="px-4 py-3 text-sm font-medium text-foreground">
                {semester?.name ?? fee.semester_id}
            </td>
            <td className="px-4 py-3 text-sm text-foreground">
                {program ? `${program.name} (${program.code})` : fee.program_id}
            </td>
            <td className="px-4 py-3 text-sm text-foreground">{fee.level}</td>
            <td className="px-4 py-3 text-sm font-semibold text-foreground">
                ₦{fee.total_amount.toLocaleString()}
            </td>
            <td className="px-4 py-3 text-xs text-muted-foreground max-w-50 truncate">
                {fee.description || '—'}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onEdit}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onDelete}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    )
}

// ── Main Panel ─────────────────────────────────────────────────────────────────

export function FeeStructurePanel() {
    const { selectedSession, setCurrentStep } = useSetupStore()
    const sessionId = selectedSession?.id ?? ''

    const [filterSemesterId, setFilterSemesterId] = useState<string>('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<FeeStructure | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<FeeStructure | null>(null)

    const { data: semesters = [] } = useSemesters(sessionId)
    const { data: programs = [] } = usePrograms()
    const { data: fees, isLoading } = useFeeStructures(
        sessionId,
        filterSemesterId !== 'all' ? filterSemesterId : undefined
    )
    const { mutateAsync: deleteFee, isPending: deleting } = useDeleteFeeStructure()

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await deleteFee({ id: deleteTarget.id, academic_session_id: sessionId })
            toast.success('Fee structure deleted')
            setDeleteTarget(null)
        } catch (err: unknown) {
            toast.error((err as Error).message ?? 'Failed to delete')
        }
    }

    return (
        <div className="space-y-5">
            {/* Context banner */}
            <div className="flex items-center gap-2 rounded-lg bg-[oklch(0.97_0.05_165/0.25)] px-3 py-2 text-xs text-primary ring-1 ring-[oklch(0.8_0.1_165/0.3)]">
                <DollarSign className="h-3.5 w-3.5 shrink-0" />
                <span>Session: <strong>{selectedSession?.name}</strong></span>
            </div>

            <SectionHeader
                icon={DollarSign}
                title="Fee Structures"
                description="Configure fees per program, level, and semester."
                action={
                    <div className="flex items-center gap-2">
                        {/* Filter by semester */}
                        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                            <select
                                value={filterSemesterId}
                                onChange={(e) => setFilterSemesterId(e.target.value)}
                                className="bg-transparent text-xs text-foreground outline-none"
                            >
                                <option value="all">All Semesters</option>
                                {semesters.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => { setEditing(null); setDialogOpen(true) }}
                            className="gap-1.5 border-destructive text-primary-foreground hover:opacity-90"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Fee
                        </Button>
                    </div>
                }
            />

            {isLoading ? (
                <div className="space-y-2">
                    {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg bg-muted" />)}
                </div>
            ) : !fees?.length ? (
                <EmptyState
                    icon={DollarSign}
                    title="No fee structures configured"
                    description="Add fee structures for each program and academic level."
                    action={{ label: 'Add Fee Structure', onClick: () => setDialogOpen(true) }}
                />
            ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted">
                                {['Semester', 'Program', 'Level', 'Amount', 'Description', ''].map((h) => (
                                    <th key={h} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-card">
                            {fees.map((fee) => (
                                <FeeRow
                                    key={fee.id}
                                    fee={fee}
                                    programs={programs}
                                    semesters={semesters}
                                    onEdit={() => { setEditing(fee); setDialogOpen(true) }}
                                    onDelete={() => setDeleteTarget(fee)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Nav */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep('semesters')}
                    className="gap-1.5 border-border text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                </Button>
                <Button
                    size="sm"
                    disabled={!fees?.length}
                    onClick={() => setCurrentStep('generate')}
                    className="gap-1.5 border-destructive text-primary-foreground hover:opacity-90"
                >
                    Next: Generate Accounts
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Dialogs */}
            <FeeFormDialog
                open={dialogOpen}
                onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null) }}
                sessionId={sessionId}
                editing={editing}
            />
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
                title="Delete Fee Structure?"
                description="This fee structure will be permanently removed."
                onConfirm={handleDelete}
                loading={deleting}
            />
        </div>
    )
}