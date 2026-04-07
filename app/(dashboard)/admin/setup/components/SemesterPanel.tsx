'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpen, Plus, Pencil, Trash2, ArrowLeft, ChevronRight, Hash } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

import { StatusBadge } from './StatusBadge'
import { EmptyState } from './EmptyState'
import { ConfirmDialog } from './ConfirmDialog'
import { SectionHeader } from './SectionHeader'

import {
    useSemesters,
    useCreateSemester,
    useUpdateSemester,
    useDeleteSemester,
} from '../services/semesters'
import type { Semester } from '../store/setup-store'
import { useSetupStore } from '../store/setup-store'

// ── Schema ─────────────────────────────────────────────────────────────────────

const semesterSchema = z.object({
    name: z.string().min(1, 'Name is required').max(30),
    sequence_no: z.number().int().min(1, 'Sequence must be ≥ 1'),
    is_active: z.boolean(),
})

type SemesterFormValues = z.infer<typeof semesterSchema>

// ── Form Dialog ────────────────────────────────────────────────────────────────

interface SemesterFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sessionId: string
    editing?: Semester | null
}

function SemesterFormDialog({ open, onOpenChange, sessionId, editing }: SemesterFormDialogProps) {
    const { mutateAsync: create, isPending: creating } = useCreateSemester()
    const { mutateAsync: update, isPending: updating } = useUpdateSemester()
    const [isActive, setIsActive] = useState(editing?.is_active ?? false)

    const form = useForm<SemesterFormValues>({
        resolver: zodResolver(semesterSchema),
        defaultValues: editing
            ? { name: editing.name, sequence_no: editing.sequence_no, is_active: editing.is_active }
            : { name: '', sequence_no: 1, is_active: false },
    })

    const onSubmit = async (values: SemesterFormValues) => {
        try {
            if (editing) {
                await update({ id: editing.id, academic_session_id: sessionId, ...values })
                toast.success('Semester updated')
            } else {
                await create({ academic_session_id: sessionId, ...values })
                toast.success('Semester created')
            }
            onOpenChange(false)
            form.reset()
        } catch (err: unknown) {
            toast.error((err as Error).message ?? 'Something went wrong')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                        {editing ? 'Edit Semester' : 'Add Semester'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="sem-name" className="text-foreground">Semester Name</Label>
                        <Input
                            id="sem-name"
                            placeholder="e.g. 1st Semester"
                            className="border-input bg-background text-foreground"
                            {...form.register('name')}
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="seq" className="text-foreground">Sequence Order</Label>
                        <Input
                            id="seq"
                            type="number"
                            min={1}
                            placeholder="1"
                            className="border-input bg-background text-foreground"
                            {...form.register('sequence_no')}
                        />
                        <p className="text-xs text-muted-foreground">
                            Determines chronological order within the session
                        </p>
                        {form.formState.errors.sequence_no && (
                            <p className="text-xs text-destructive">{form.formState.errors.sequence_no.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted px-4 py-3">
                        <p className="text-sm font-medium text-foreground">Active Semester</p>
                        <Switch
                            checked={isActive}
                            onCheckedChange={(v) => {
                                setIsActive(v)
                                form.setValue('is_active', v)
                            }}
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
                            {creating || updating ? 'Saving…' : editing ? 'Update' : 'Add Semester'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ── Main Panel ─────────────────────────────────────────────────────────────────

export function SemesterPanel() {
    const { selectedSession, setCurrentStep, setSelectedSemester } = useSetupStore()
    const sessionId = selectedSession?.id ?? ''

    const { data: semesters, isLoading } = useSemesters(sessionId)
    const { mutateAsync: deleteSemester, isPending: deleting } = useDeleteSemester()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Semester | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Semester | null>(null)

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await deleteSemester({ id: deleteTarget.id, academic_session_id: sessionId })
            toast.success('Semester deleted')
            setDeleteTarget(null)
        } catch (err: unknown) {
            toast.error((err as Error).message ?? 'Failed to delete')
        }
    }

    const handleProceed = () => {
        setCurrentStep('fee-structures')
    }

    const sortedSemesters = [...(semesters ?? [])].sort((a, b) => a.sequence_no - b.sequence_no)

    return (
        <div className="space-y-5">
            {/* Context banner */}
            <div className="flex items-center gap-2 rounded-lg bg-[oklch(0.97_0.05_165/0.25)] px-3 py-2 text-xs text-primary ring-1 ring-[oklch(0.8_0.1_165/0.3)]">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span>Session: <strong>{selectedSession?.name}</strong></span>
            </div>

            <SectionHeader
                icon={BookOpen}
                title="Semesters"
                description="Define semesters for this session in chronological order."
                action={
                    <Button
                        size="sm"
                        onClick={() => { setEditing(null); setDialogOpen(true) }}
                        className="gap-1.5 border-destructive text-primary-foreground hover:opacity-90"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Semester
                    </Button>
                }
            />

            {isLoading ? (
                <div className="space-y-2">
                    {[0, 1].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted" />)}
                </div>
            ) : !sortedSemesters.length ? (
                <EmptyState
                    icon={BookOpen}
                    title="No semesters added"
                    description="Add at least one semester to this academic session."
                    action={{ label: 'Add Semester', onClick: () => setDialogOpen(true) }}
                />
            ) : (
                <ul className="space-y-2">
                    {sortedSemesters.map((sem) => (
                        <li
                            key={sem.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.837_0.128_66.29/0.15)] text-[oklch(0.553_0.195_38.402)]">
                                    <Hash className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-foreground">{sem.name}</p>
                                        <Badge
                                            variant="outline"
                                            className="h-4 px-1.5 text-[10px] border-border text-muted-foreground"
                                        >
                                            Seq {sem.sequence_no}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Sequence #{sem.sequence_no}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <StatusBadge active={sem.is_active} />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => { setEditing(sem); setDialogOpen(true) }}
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setDeleteTarget(sem)}
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep('session')}
                    className="gap-1.5 border-border text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                </Button>
                <Button
                    size="sm"
                    disabled={!sortedSemesters.length}
                    onClick={handleProceed}
                    className="gap-1.5 border-destructive text-primary-foreground hover:opacity-90"
                >
                    Next: Fee Structures
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Dialogs */}
            <SemesterFormDialog
                open={dialogOpen}
                onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null) }}
                sessionId={sessionId}
                editing={editing}
            />
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
                title="Delete Semester?"
                description={`"${deleteTarget?.name}" will be permanently deleted.`}
                onConfirm={handleDelete}
                loading={deleting}
            />
        </div>
    )
}