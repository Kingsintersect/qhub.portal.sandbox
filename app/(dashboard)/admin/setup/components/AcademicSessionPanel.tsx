'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, Plus, Pencil, Trash2, Zap, ChevronRight } from 'lucide-react'
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

import { StatusBadge } from './StatusBadge'
import { EmptyState } from './EmptyState'
import { ConfirmDialog } from './ConfirmDialog'
import { SectionHeader } from './SectionHeader'

import {
    useAcademicSessions,
    useCreateSession,
    useUpdateSession,
    useDeleteSession,
    useActivateSession,
    type CreateSessionPayload,
} from '../services/academic-sessions'
import type { AcademicSession } from '../store/setup-store'
import { useSetupStore } from '../store/setup-store'

// ── Schema ─────────────────────────────────────────────────────────────────────

const sessionSchema = z
    .object({
        name: z.string().min(1, 'Session name is required').max(50),
        start_date: z.string().min(1, 'Start date is required'),
        end_date: z.string().min(1, 'End date is required'),
        is_active: z.boolean(),
    })
    .refine((d) => new Date(d.end_date) > new Date(d.start_date), {
        message: 'End date must be after start date',
        path: ['end_date'],
    })

type SessionFormValues = z.infer<typeof sessionSchema>

// ── Session Form Dialog ────────────────────────────────────────────────────────

interface SessionFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    editing?: AcademicSession | null
}

function SessionFormDialog({ open, onOpenChange, editing }: SessionFormDialogProps) {
    const { mutateAsync: create, isPending: creating } = useCreateSession()
    const { mutateAsync: update, isPending: updating } = useUpdateSession()

    const form = useForm<SessionFormValues>({
        resolver: zodResolver(sessionSchema),
        defaultValues: editing
            ? {
                name: editing.name,
                start_date: editing.start_date,
                end_date: editing.end_date,
                is_active: editing.is_active,
            }
            : { name: '', start_date: '', end_date: '', is_active: false },
    })

    const onSubmit = async (values: SessionFormValues) => {
        try {
            if (editing) {
                await update({ id: editing.id, ...values })
                toast.success('Session updated successfully')
            } else {
                await create(values as CreateSessionPayload)
                toast.success('Session created successfully')
            }
            onOpenChange(false)
            form.reset()
        } catch (err: unknown) {
            toast.error((err as Error).message ?? 'Something went wrong')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                        {editing ? 'Edit Academic Session' : 'New Academic Session'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-foreground">Session Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. 2025/2026"
                            className="border-input bg-background text-foreground"
                            {...form.register('name')}
                        />
                        {form.formState.errors.name && (
                            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="start_date" className="text-foreground">Start Date</Label>
                            <Input
                                id="start_date"
                                type="date"
                                className="border-input bg-background text-foreground"
                                {...form.register('start_date')}
                            />
                            {form.formState.errors.start_date && (
                                <p className="text-xs text-destructive">{form.formState.errors.start_date.message}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="end_date" className="text-foreground">End Date</Label>
                            <Input
                                id="end_date"
                                type="date"
                                className="border-input bg-background text-foreground"
                                {...form.register('end_date')}
                            />
                            {form.formState.errors.end_date && (
                                <p className="text-xs text-destructive">{form.formState.errors.end_date.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-foreground">Set as Active</p>
                            <p className="text-xs text-muted-foreground">
                                Only one session can be active at a time
                            </p>
                        </div>
                        <Switch
                            checked={form.watch('is_active')}
                            onCheckedChange={(v) => form.setValue('is_active', v)}
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
                            {creating || updating ? 'Saving…' : editing ? 'Update Session' : 'Create Session'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ── Main Panel ─────────────────────────────────────────────────────────────────

export function AcademicSessionPanel() {
    const { data: sessions, isLoading } = useAcademicSessions()
    const { mutateAsync: deleteSession, isPending: deleting } = useDeleteSession()
    const { mutateAsync: activateSession } = useActivateSession()

    const { setSelectedSession, setCurrentStep } = useSetupStore()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<AcademicSession | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<AcademicSession | null>(null)

    const handleEdit = (session: AcademicSession) => {
        setEditing(session)
        setDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await deleteSession(deleteTarget.id)
            toast.success('Session deleted')
            setDeleteTarget(null)
        } catch (err: unknown) {
            toast.error((err as Error).message ?? 'Failed to delete')
        }
    }

    const handleActivate = async (session: AcademicSession) => {
        try {
            await activateSession(session.id)
            toast.success(`"${session.name}" is now the active session`)
        } catch (err: unknown) {
            toast.error((err as Error).message ?? 'Failed to activate')
        }
    }

    const handleProceed = (session: AcademicSession) => {
        setSelectedSession(session)
        setCurrentStep('semesters')
    }

    return (
        <div className="space-y-5">
            <SectionHeader
                icon={CalendarDays}
                title="Academic Sessions"
                description="Manage academic years. Select a session to continue setup."
                action={
                    <Button
                        size="sm"
                        onClick={() => { setEditing(null); setDialogOpen(true) }}
                        className="gap-1.5 border-destructive text-primary-foreground hover:opacity-90"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New Session
                    </Button>
                }
            />

            {/* List */}
            {isLoading ? (
                <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted" />
                    ))}
                </div>
            ) : !sessions?.length ? (
                <EmptyState
                    icon={CalendarDays}
                    title="No academic sessions yet"
                    description="Start by creating your first academic session to begin the setup process."
                    action={{ label: 'Create Session', onClick: () => setDialogOpen(true) }}
                />
            ) : (
                <ul className="space-y-2">
                    {sessions.map((session) => (
                        <li
                            key={session.id}
                            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-shadow hover:shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.97_0.05_165/0.25)]">
                                    <CalendarDays className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{session.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(session.start_date).toLocaleDateString()} –{' '}
                                        {new Date(session.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <StatusBadge active={session.is_active} />

                                {!session.is_active && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        title="Set as active"
                                        onClick={() => handleActivate(session)}
                                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    >
                                        <Zap className="h-3.5 w-3.5" />
                                    </Button>
                                )}

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(session)}
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setDeleteTarget(session)}
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={() => handleProceed(session)}
                                    className="ml-1 h-7 gap-1 border-destructive text-primary-foreground text-xs hover:opacity-90"
                                >
                                    Select
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Dialogs */}
            <SessionFormDialog
                open={dialogOpen}
                onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null) }}
                editing={editing}
            />
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(v) => !v && setDeleteTarget(null)}
                title="Delete Academic Session?"
                description={`"${deleteTarget?.name}" and all associated data will be permanently removed.`}
                onConfirm={handleDelete}
                loading={deleting}
            />
        </div>
    )
}