"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useOtherFees,
    useCreateOtherFee,
    useDeleteOtherFee,
} from "../hooks/useOtherFees";
import { useAcademicSessions } from "../../../hooks/useAcademicSessions";
import { useSemesters } from "../../../hooks/useSemesters";
import { otherFeeSchema, type OtherFeeFormValues } from "../../../schemas";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "./EmptyState";
import {
    DollarSign,
    Plus,
    Trash2,
    Loader2,
    CalendarDays,
} from "lucide-react";

const LEVEL_OPTIONS = [0, 100, 200, 300, 400, 500, 600, 700];

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
    }).format(amount);

export function OtherFeesManager() {
    const { data: sessions, isLoading: isLoadingSessions } = useAcademicSessions();

    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const { data: otherFees, isLoading } = useOtherFees(selectedSessionId || null);
    const { data: semesters } = useSemesters(selectedSessionId || null);
    const createFee = useCreateOtherFee();
    const deleteFee = useDeleteOtherFee(selectedSessionId);

    const [showForm, setShowForm] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<OtherFeeFormValues>({
        resolver: zodResolver(otherFeeSchema),
        defaultValues: {
            academic_session_id: "",
            semester_id: "",
            level: 0,
            name: "",
            amount: 0,
            description: "",
        },
    });

    const onSubmit = async (data: OtherFeeFormValues) => {
        await createFee.mutateAsync({
            ...data,
            academic_session_id: selectedSessionId,
        });
        reset();
        setShowForm(false);
    };

    // Build lookup map for semester names
    const semesterMap = new Map(semesters?.map((s) => [s.id, s.name]) ?? []);

    const displaySemester = (semesterId: string) => {
        if (!semesterId) return "All Semesters";
        return semesterMap.get(semesterId) ?? semesterId;
    };

    const displayLevel = (level: number) => {
        if (level === 0) return "All Levels";
        return `${level} Level`;
    };

    const totalAmount = otherFees?.reduce((sum, f) => sum + f.amount, 0) ?? 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Other Fees
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Configure miscellaneous fees — library, lab, sports, and other charges.
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    disabled={!selectedSessionId}
                >
                    <Plus className="size-4" data-icon="inline-start" />
                    Add Fee
                </Button>
            </div>

            {/* Session Selector */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="size-4 text-muted-foreground" />
                            <Label htmlFor="other-session">Academic Session</Label>
                        </div>
                        <select
                            id="other-session"
                            value={selectedSessionId}
                            onChange={(e) => setSelectedSessionId(e.target.value)}
                            className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">Select a session</option>
                            {sessions
                                ?.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                                .map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.is_active ? "(Active)" : ""}
                                    </option>
                                ))}
                        </select>
                        {isLoadingSessions && (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* No session selected */}
            {!selectedSessionId && (
                <EmptyState
                    icon={CalendarDays}
                    title="Select a session"
                    description="Choose an academic session above to view or configure other fees."
                />
            )}

            {/* Loading */}
            {selectedSessionId && isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-6 animate-spin text-primary" />
                </div>
            )}

            {/* Create Form */}
            {selectedSessionId && showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Other Fee</CardTitle>
                        <CardDescription>
                            Define a miscellaneous fee with its target semester, level, and amount.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="other-fee-name">Fee Name</Label>
                                <Input
                                    id="other-fee-name"
                                    placeholder="e.g., Library Fee"
                                    aria-invalid={!!errors.name}
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="other-fee-amount">Amount (₦)</Label>
                                <Input
                                    id="other-fee-amount"
                                    type="number"
                                    min={0}
                                    step={500}
                                    placeholder="5000"
                                    aria-invalid={!!errors.amount}
                                    {...register("amount", { valueAsNumber: true })}
                                />
                                {errors.amount && (
                                    <p className="text-sm text-destructive">{errors.amount.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="other-fee-semester">Semester</Label>
                                <select
                                    id="other-fee-semester"
                                    {...register("semester_id")}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">All Semesters</option>
                                    {semesters
                                        ?.sort((a, b) => a.sequence_no - b.sequence_no)
                                        .map((sem) => (
                                            <option key={sem.id} value={sem.id}>
                                                {sem.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="other-fee-level">Level</Label>
                                <select
                                    id="other-fee-level"
                                    {...register("level", { valueAsNumber: true })}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {LEVEL_OPTIONS.map((lvl) => (
                                        <option key={lvl} value={lvl}>
                                            {lvl === 0 ? "All Levels" : `${lvl} Level`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="other-fee-desc">Description</Label>
                                <Input
                                    id="other-fee-desc"
                                    placeholder="Brief description of the fee"
                                    {...register("description")}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                disabled={createFee.isPending}
                            >
                                {createFee.isPending && (
                                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                                )}
                                Add Fee
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Fee List */}
            {selectedSessionId && !isLoading && (
                <>
                    {!otherFees?.length && !showForm ? (
                        <EmptyState
                            icon={DollarSign}
                            title="No other fees configured"
                            description="Add miscellaneous fees like library, lab coat, sports, etc."
                            action={
                                <Button onClick={() => setShowForm(true)}>
                                    <Plus className="size-4" data-icon="inline-start" />
                                    Add First Fee
                                </Button>
                            }
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Fee Name
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Semester
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Level
                                                </th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                                    Amount
                                                </th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {otherFees?.map((fee) => (
                                                <tr
                                                    key={fee.id}
                                                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {fee.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {displaySemester(fee.semester_id)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {displayLevel(fee.level)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {formatCurrency(fee.amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {fee.description || "—"}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Button
                                                            variant="destructive"
                                                            size="icon-xs"
                                                            onClick={() => deleteFee.mutate(fee.id)}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Total row */}
                                            <tr className="bg-muted/30 font-semibold">
                                                <td className="px-4 py-3" colSpan={3}>
                                                    Total Other Fees
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatCurrency(totalAmount)}
                                                </td>
                                                <td colSpan={2} />
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
