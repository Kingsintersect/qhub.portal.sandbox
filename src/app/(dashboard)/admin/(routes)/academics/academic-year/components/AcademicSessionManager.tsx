"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useAcademicSessions,
    useCreateSession,
    useDeleteSession,
    useActivateSession,
} from "@/hooks/useAcademicSessions";
import { useAcademicSessionSetupStore } from "@/store/dashboard/academicSessionSetupStore";
import { academicSessionSchema, type AcademicSessionFormValues } from "@/schemas/school.schema";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "./EmptyState";
import {
    CalendarDays,
    Plus,
    Trash2,
    ArrowRight,
    Power,
    Loader2,
} from "lucide-react";

export function AcademicSessionManager() {
    const { data: sessions, isLoading } = useAcademicSessions();
    const createSession = useCreateSession();
    const deleteSession = useDeleteSession();
    const activateSession = useActivateSession();

    const { setSelectedSession, setCurrentStep } = useAcademicSessionSetupStore();

    const [showForm, setShowForm] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AcademicSessionFormValues>({
        resolver: zodResolver(academicSessionSchema),
        defaultValues: { name: "", start_date: "", end_date: "", is_active: false },
    });

    const onSubmit = async (data: AcademicSessionFormValues) => {
        await createSession.mutateAsync(data);
        reset();
        setShowForm(false);
    };

    const handleSelect = (id: string, name: string) => {
        setSelectedSession(id, name);
        setCurrentStep("semesters");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Academic Sessions
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Create a new session or select an existing one to configure.
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="size-4" data-icon="inline-start" />
                    New Session
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create Academic Session</CardTitle>
                        <CardDescription>
                            e.g., 2024/2025 — September 2024 to August 2025
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Session Name</Label>
                                <Input
                                    id="name"
                                    placeholder="2024/2025"
                                    aria-invalid={!!errors.name}
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    aria-invalid={!!errors.start_date}
                                    {...register("start_date")}
                                />
                                {errors.start_date && (
                                    <p className="text-sm text-destructive">{errors.start_date.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    aria-invalid={!!errors.end_date}
                                    {...register("end_date")}
                                />
                                {errors.end_date && (
                                    <p className="text-sm text-destructive">{errors.end_date.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                disabled={createSession.isPending}
                            >
                                {createSession.isPending && (
                                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                                )}
                                Create Session
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Session List */}
            {!sessions?.length && !showForm ? (
                <EmptyState
                    icon={CalendarDays}
                    title="No academic sessions yet"
                    description="Create your first academic session to get started with fee configuration."
                    action={
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="size-4" data-icon="inline-start" />
                            Create First Session
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sessions?.map((session) => (
                        <Card key={session.id} className="relative">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="size-4 text-primary" />
                                    {session.name}
                                </CardTitle>
                                <CardDescription>
                                    {new Date(session.start_date).toLocaleDateString("en-NG", {
                                        month: "short",
                                        year: "numeric",
                                    })}{" "}
                                    —{" "}
                                    {new Date(session.end_date).toLocaleDateString("en-NG", {
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </CardDescription>
                                <CardAction>
                                    {session.is_active && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                            <span className="size-1.5 rounded-full bg-primary" />
                                            Active
                                        </span>
                                    )}
                                </CardAction>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleSelect(session.id, session.name)}
                                    >
                                        Configure
                                        <ArrowRight className="size-4" data-icon="inline-end" />
                                    </Button>
                                    {!session.is_active && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => activateSession.mutate(session.id)}
                                            title="Activate session"
                                        >
                                            <Power className="size-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => deleteSession.mutate(session.id)}
                                        title="Delete session"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}