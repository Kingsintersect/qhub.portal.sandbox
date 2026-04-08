// "use client";

// import { useState } from "react";
// import {
//     useFeeStructures,
//     usePrograms,
//     useCreateFeeStructure,
//     useDeleteFeeStructure,
// } from "../hooks/useFeeStructures";
// import { useSemesters } from "../hooks/useSemesters";
// import { useFeeSetupStore } from "../store/feeSetupStore";
// import type { CreateFeeStructurePayload } from "../types";

// import {
//     Card,
//     CardHeader,
//     CardTitle,
//     CardDescription,
//     CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { EmptyState } from "./EmptyState";
// import {
//     DollarSign,
//     Plus,
//     Trash2,
//     ArrowRight,
//     ArrowLeft,
//     Loader2,
// } from "lucide-react";

// const LEVEL_OPTIONS = [100, 200, 300, 400, 500, 600, 700];

// export function FeeStructureManager() {
//     const {
//         selectedSessionId,
//         selectedSessionName,
//         setCurrentStep,
//     } = useFeeSetupStore();

//     const { data: feeStructures, isLoading } =
//         useFeeStructures(selectedSessionId);
//     const { data: semesters } = useSemesters(selectedSessionId);
//     const { data: programs } = usePrograms();
//     const createFee = useCreateFeeStructure();
//     const deleteFee = useDeleteFeeStructure(selectedSessionId!);

//     const [showForm, setShowForm] = useState(false);
//     const [form, setForm] = useState({
//         semester_id: "",
//         program_id: "",
//         level: 100,
//         total_amount: 0,
//         description: "",
//     });

//     const handleCreate = async () => {
//         if (
//             !form.semester_id ||
//             !form.program_id ||
//             !form.total_amount ||
//             !selectedSessionId
//         )
//             return;

//         const payload: CreateFeeStructurePayload = {
//             academic_session_id: selectedSessionId,
//             ...form,
//         };
//         await createFee.mutateAsync(payload);
//         setForm({
//             semester_id: "",
//             program_id: "",
//             level: 100,
//             total_amount: 0,
//             description: "",
//         });
//         setShowForm(false);
//     };

//     // Build lookup maps for display
//     const semesterMap = new Map(semesters?.map((s) => [s.id, s.name]) ?? []);
//     const programMap = new Map(programs?.map((p) => [p.id, p.name]) ?? []);

//     const formatCurrency = (amount: number) =>
//         new Intl.NumberFormat("en-NG", {
//             style: "currency",
//             currency: "NGN",
//             minimumFractionDigits: 0,
//         }).format(amount);

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center py-20">
//                 <Loader2 className="size-6 animate-spin text-primary" />
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                     <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => setCurrentStep("semesters")}
//                         title="Back to semesters"
//                     >
//                         <ArrowLeft className="size-4" />
//                     </Button>
//                     <div>
//                         <h2 className="text-lg font-semibold text-foreground">
//                             Fee Structures
//                         </h2>
//                         <p className="text-sm text-muted-foreground">
//                             Session:{" "}
//                             <span className="font-medium text-foreground">
//                                 {selectedSessionName}
//                             </span>
//                         </p>
//                     </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     <Button variant="outline" onClick={() => setShowForm(!showForm)}>
//                         <Plus className="size-4" data-icon="inline-start" />
//                         Add Fee
//                     </Button>
//                     <Button
//                         onClick={() => setCurrentStep("generate")}
//                         disabled={!feeStructures?.length}
//                     >
//                         Next: Generate Accounts
//                         <ArrowRight className="size-4" data-icon="inline-end" />
//                     </Button>
//                 </div>
//             </div>

//             {/* Create Form */}
//             {showForm && (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Add Fee Structure</CardTitle>
//                         <CardDescription>
//                             Set the fee amount for a specific program, level, and semester.
//                         </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                             {/* Semester */}
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium text-foreground">
//                                     Semester
//                                 </label>
//                                 <select
//                                     value={form.semester_id}
//                                     onChange={(e) =>
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             semester_id: e.target.value,
//                                         }))
//                                     }
//                                     className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                                 >
//                                     <option value="">Select semester</option>
//                                     {semesters
//                                         ?.sort((a, b) => a.sequence_no - b.sequence_no)
//                                         .map((sem) => (
//                                             <option key={sem.id} value={sem.id}>
//                                                 {sem.name}
//                                             </option>
//                                         ))}
//                                 </select>
//                             </div>

//                             {/* Program */}
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium text-foreground">
//                                     Program
//                                 </label>
//                                 <select
//                                     value={form.program_id}
//                                     onChange={(e) =>
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             program_id: e.target.value,
//                                         }))
//                                     }
//                                     className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                                 >
//                                     <option value="">Select program</option>
//                                     {programs?.map((prog) => (
//                                         <option key={prog.id} value={prog.id}>
//                                             {prog.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Level */}
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium text-foreground">
//                                     Level
//                                 </label>
//                                 <select
//                                     value={form.level}
//                                     onChange={(e) =>
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             level: parseInt(e.target.value),
//                                         }))
//                                     }
//                                     className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                                 >
//                                     {LEVEL_OPTIONS.map((lvl) => (
//                                         <option key={lvl} value={lvl}>
//                                             {lvl} Level
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {/* Amount */}
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium text-foreground">
//                                     Total Amount (₦)
//                                 </label>
//                                 <input
//                                     type="number"
//                                     min={0}
//                                     step={1000}
//                                     value={form.total_amount || ""}
//                                     onChange={(e) =>
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             total_amount: parseFloat(e.target.value) || 0,
//                                         }))
//                                     }
//                                     placeholder="150000"
//                                     className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                                 />
//                             </div>

//                             {/* Description */}
//                             <div className="space-y-1.5 sm:col-span-2">
//                                 <label className="text-sm font-medium text-foreground">
//                                     Description
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={form.description}
//                                     onChange={(e) =>
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             description: e.target.value,
//                                         }))
//                                     }
//                                     placeholder="Fresh student fees — Computer Science, 100 Level, 1st Semester"
//                                     className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                                 />
//                             </div>
//                         </div>
//                         <div className="mt-4 flex justify-end gap-2">
//                             <Button variant="outline" onClick={() => setShowForm(false)}>
//                                 Cancel
//                             </Button>
//                             <Button
//                                 onClick={handleCreate}
//                                 disabled={createFee.isPending}
//                             >
//                                 {createFee.isPending && (
//                                     <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
//                                 )}
//                                 Add Fee Structure
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>
//             )}

//             {/* Fee Structure Table */}
//             {!feeStructures?.length && !showForm ? (
//                 <EmptyState
//                     icon={DollarSign}
//                     title="No fee structures configured"
//                     description="Define how much each program/level pays per semester."
//                     action={
//                         <Button onClick={() => setShowForm(true)}>
//                             <Plus className="size-4" data-icon="inline-start" />
//                             Add First Fee Structure
//                         </Button>
//                     }
//                 />
//             ) : (
//                 <Card>
//                     <CardContent className="p-0">
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-sm">
//                                 <thead>
//                                     <tr className="border-b border-border bg-muted/50">
//                                         <th className="px-4 py-3 text-left font-medium text-muted-foreground">
//                                             Semester
//                                         </th>
//                                         <th className="px-4 py-3 text-left font-medium text-muted-foreground">
//                                             Program
//                                         </th>
//                                         <th className="px-4 py-3 text-left font-medium text-muted-foreground">
//                                             Level
//                                         </th>
//                                         <th className="px-4 py-3 text-right font-medium text-muted-foreground">
//                                             Amount
//                                         </th>
//                                         <th className="px-4 py-3 text-left font-medium text-muted-foreground">
//                                             Description
//                                         </th>
//                                         <th className="px-4 py-3 text-center font-medium text-muted-foreground">
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {feeStructures?.map((fee) => (
//                                         <tr
//                                             key={fee.id}
//                                             className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
//                                         >
//                                             <td className="px-4 py-3">
//                                                 {semesterMap.get(fee.semester_id) ?? fee.semester_id}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 {programMap.get(fee.program_id) ?? fee.program_id}
//                                             </td>
//                                             <td className="px-4 py-3">{fee.level} Level</td>
//                                             <td className="px-4 py-3 text-right font-medium">
//                                                 {formatCurrency(fee.total_amount)}
//                                             </td>
//                                             <td className="px-4 py-3 text-muted-foreground">
//                                                 {fee.description || "—"}
//                                             </td>
//                                             <td className="px-4 py-3 text-center">
//                                                 <Button
//                                                     variant="destructive"
//                                                     size="icon-xs"
//                                                     onClick={() => deleteFee.mutate(fee.id)}
//                                                 >
//                                                     <Trash2 className="size-3.5" />
//                                                 </Button>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </CardContent>
//                 </Card>
//             )}
//         </div>
//     );
// }


// RUNNING DUMMY DATA FROM HERE
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useFeeStructures,
    usePrograms,
    useCreateFeeStructure,
    useDeleteFeeStructure,
} from "../hooks/useFeeStructures";
import { useFeeSetupStore } from "../../../store/feeSetupStore";
import type { CreateFeeStructurePayload } from "../../../types";
import { feeStructureSchema, type FeeStructureFormValues } from "../../../schemas";

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
    ArrowRight,
    ArrowLeft,
    Loader2,
} from "lucide-react";
// import { useSemesters } from "../../hooks/useSemesters";
import { useAcademicSessions } from "../../../hooks/useAcademicSessions";

const LEVEL_OPTIONS = [100, 200, 300, 400, 500, 600, 700];

export function FeeStructureManager() {
    const { selectedSessionId, selectedSessionName, setCurrentStep } =
        useFeeSetupStore();

    const { data: feeStructures, isLoading } =
        useFeeStructures(selectedSessionId);
    const { data: sessions, isLoading: isLoadingSessions } = useAcademicSessions();
    // const { data: semesters } = useSemesters(selectedSessionId);
    const { data: programs } = usePrograms();
    const createFee = useCreateFeeStructure();
    const deleteFee = useDeleteFeeStructure(selectedSessionId!);

    const [showForm, setShowForm] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FeeStructureFormValues>({
        resolver: zodResolver(feeStructureSchema),
        defaultValues: {
            academic_session_id: "",
            program_id: "",
            level: 100,
            total_amount: 0,
            description: "",
        },
    });

    const onSubmit = async (data: FeeStructureFormValues) => {
        const payload: CreateFeeStructurePayload = {
            semester_id: "",
            ...data,
        };
        await createFee.mutateAsync(payload);
        reset();
        setShowForm(false);
    };

    const sessionMap = new Map(sessions?.map((s) => [s.id, s.name]) ?? []);
    const programMap = new Map(programs?.map((p) => [p.id, p.name]) ?? []);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
        }).format(amount);

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
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentStep("fee-structures")}
                        title="Back to fee structures"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Fee Structures
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Session:{" "}
                            <span className="font-medium text-foreground">
                                {selectedSessionName}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setShowForm(!showForm)}>
                        <Plus className="size-4" data-icon="inline-start" />
                        Add Fee
                    </Button>
                    <Button
                        onClick={() => setCurrentStep("generate")}
                        disabled={!feeStructures?.length}
                    >
                        Next: Generate Accounts
                        <ArrowRight className="size-4" data-icon="inline-end" />
                    </Button>
                </div>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Fee Structure</CardTitle>
                        <CardDescription>
                            Set the fee amount for a specific program, level, and semester.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="academic_session_id">Academic Session</Label>
                                <select
                                    id="academic_session_id"
                                    {...register("academic_session_id")}
                                    aria-invalid={!!errors.academic_session_id}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive"
                                >
                                    <option value="">Select Academic Session</option>
                                    {sessions
                                        ?.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                                        .map((sem) => (
                                            <option key={sem.id} value={sem.id}>
                                                {sem.name}
                                            </option>
                                        ))}
                                </select>
                                {errors.academic_session_id && (
                                    <p className="text-sm text-destructive">{errors.academic_session_id.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="program_id">Program</Label>
                                <select
                                    id="program_id"
                                    {...register("program_id")}
                                    aria-invalid={!!errors.program_id}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive"
                                >
                                    <option value="">Select program</option>
                                    {programs?.map((prog) => (
                                        <option key={prog.id} value={prog.id}>
                                            {prog.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.program_id && (
                                    <p className="text-sm text-destructive">{errors.program_id.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="level">Level</Label>
                                <select
                                    id="level"
                                    {...register("level", { valueAsNumber: true })}
                                    aria-invalid={!!errors.level}
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive"
                                >
                                    {LEVEL_OPTIONS.map((lvl) => (
                                        <option key={lvl} value={lvl}>
                                            {lvl} Level
                                        </option>
                                    ))}
                                </select>
                                {errors.level && (
                                    <p className="text-sm text-destructive">{errors.level.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="total_amount">Total Amount (₦)</Label>
                                <Input
                                    id="total_amount"
                                    type="number"
                                    min={0}
                                    step={1000}
                                    placeholder="150000"
                                    aria-invalid={!!errors.total_amount}
                                    {...register("total_amount", { valueAsNumber: true })}
                                />
                                {errors.total_amount && (
                                    <p className="text-sm text-destructive">{errors.total_amount.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Fresh student fees — Computer Science, 100 Level"
                                    {...register("description")}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit(onSubmit)} disabled={createFee.isPending}>
                                {createFee.isPending && (
                                    <Loader2
                                        className="size-4 animate-spin"
                                        data-icon="inline-start"
                                    />
                                )}
                                Add Fee Structure
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Fee Structure Table */}
            {!feeStructures?.length && !showForm ? (
                <EmptyState
                    icon={DollarSign}
                    title="No fee structures configured"
                    description="Define how much each program/level pays per semester."
                    action={
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="size-4" data-icon="inline-start" />
                            Add First Fee Structure
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
                                            Academic Session
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            Program
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
                                    {feeStructures?.map((fee) => (
                                        <tr
                                            key={fee.id}
                                            className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3">
                                                {sessionMap.get(fee.academic_session_id) ?? fee.academic_session_id}
                                            </td>
                                            <td className="px-4 py-3">
                                                {programMap.get(fee.program_id) ?? fee.program_id}
                                            </td>
                                            <td className="px-4 py-3">{fee.level} Level</td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatCurrency(fee.total_amount)}
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
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}