// "use client";

// import { useState } from "react";
// import {
//     useSemesters,
//     useCreateSemester,
//     useDeleteSemester,
//     useActivateSemester,
// } from "../hooks/useSemesters";
// import { useFeeSetupStore } from "../store/feeSetupStore";
// import type { CreateSemesterPayload } from "../types";

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
//     Layers,
//     Plus,
//     Trash2,
//     Power,
//     ArrowRight,
//     ArrowLeft,
//     Loader2,
// } from "lucide-react";

// export function SemesterManager() {
//     const {
//         selectedSessionId,
//         selectedSessionName,
//         setCurrentStep,
//         clearSelectedSession,
//     } = useFeeSetupStore();

//     const { data: semesters, isLoading } = useSemesters(selectedSessionId);
//     const createSemester = useCreateSemester();
//     const deleteSemester = useDeleteSemester(selectedSessionId!);
//     const activateSemester = useActivateSemester(selectedSessionId!);

//     const [showForm, setShowForm] = useState(false);
//     const [form, setForm] = useState({
//         name: "",
//         sequence_no: 1,
//     });

//     const handleCreate = async () => {
//         if (!form.name || !selectedSessionId) return;
//         const payload: CreateSemesterPayload = {
//             academic_session_id: selectedSessionId,
//             name: form.name,
//             sequence_no: form.sequence_no,
//             is_active: false,
//         };
//         await createSemester.mutateAsync(payload);
//         setForm({ name: "", sequence_no: (semesters?.length ?? 0) + 2 });
//         setShowForm(false);
//     };

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center py-20">
//                 <Loader2 className="size-6 animate-spin text-primary" />
//             </div>
//         );
//     }

//     // Sort by sequence_no for display
//     const sorted = [...(semesters ?? [])].sort(
//         (a, b) => a.sequence_no - b.sequence_no
//     );

//     return (
//         <div className="space-y-6">
//             {/* Header with back + context */}
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                     <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={clearSelectedSession}
//                         title="Back to sessions"
//                     >
//                         <ArrowLeft className="size-4" />
//                     </Button>
//                     <div>
//                         <h2 className="text-lg font-semibold text-foreground">
//                             Semesters
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
//                         Add Semester
//                     </Button>
//                     <Button
//                         onClick={() => setCurrentStep("fee-structures")}
//                         disabled={!sorted.length}
//                     >
//                         Next: Fee Structures
//                         <ArrowRight className="size-4" data-icon="inline-end" />
//                     </Button>
//                 </div>
//             </div>

//             {/* Create Form */}
//             {showForm && (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Add Semester</CardTitle>
//                         <CardDescription>
//                             Define a semester period and its chronological order.
//                         </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="grid gap-4 sm:grid-cols-2">
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium text-foreground">
//                                     Semester Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     placeholder="1st Semester"
//                                     value={form.name}
//                                     onChange={(e) =>
//                                         setForm((prev) => ({ ...prev, name: e.target.value }))
//                                     }
//                                     className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                                 />
//                             </div>
//                             <div className="space-y-1.5">
//                                 <label className="text-sm font-medium text-foreground">
//                                     Sequence Order
//                                 </label>
//                                 <input
//                                     type="number"
//                                     min={1}
//                                     value={form.sequence_no}
//                                     onChange={(e) =>
//                                         setForm((prev) => ({
//                                             ...prev,
//                                             sequence_no: parseInt(e.target.value) || 1,
//                                         }))
//                                     }
//                                     className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                                 />
//                             </div>
//                         </div>
//                         <div className="mt-4 flex justify-end gap-2">
//                             <Button variant="outline" onClick={() => setShowForm(false)}>
//                                 Cancel
//                             </Button>
//                             <Button
//                                 onClick={handleCreate}
//                                 disabled={createSemester.isPending}
//                             >
//                                 {createSemester.isPending && (
//                                     <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
//                                 )}
//                                 Add Semester
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>
//             )}

//             {/* Semester List */}
//             {!sorted.length && !showForm ? (
//                 <EmptyState
//                     icon={Layers}
//                     title="No semesters defined"
//                     description="Add semesters to this session (e.g., 1st Semester, 2nd Semester)."
//                     action={
//                         <Button onClick={() => setShowForm(true)}>
//                             <Plus className="size-4" data-icon="inline-start" />
//                             Add First Semester
//                         </Button>
//                     }
//                 />
//             ) : (
//                 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//                     {sorted.map((semester) => (
//                         <Card key={semester.id}>
//                             <CardHeader>
//                                 <CardTitle className="flex items-center gap-2">
//                                     <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
//                                         {semester.sequence_no}
//                                     </span>
//                                     {semester.name}
//                                 </CardTitle>
//                                 <CardDescription>
//                                     Sequence: {semester.sequence_no} —{" "}
//                                     {semester.is_active ? (
//                                         <span className="font-medium text-primary">Active</span>
//                                     ) : (
//                                         "Inactive"
//                                     )}
//                                 </CardDescription>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="flex items-center gap-2">
//                                     {!semester.is_active && (
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             className="flex-1"
//                                             onClick={() => activateSemester.mutate(semester.id)}
//                                         >
//                                             <Power className="size-3.5" data-icon="inline-start" />
//                                             Activate
//                                         </Button>
//                                     )}
//                                     <Button
//                                         variant="destructive"
//                                         size="icon-sm"
//                                         onClick={() => deleteSemester.mutate(semester.id)}
//                                     >
//                                         <Trash2 className="size-3.5" />
//                                     </Button>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// RUNNING DYMMY DATA FROM HERE
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useSemesters,
    useCreateSemester,
    useDeleteSemester,
    useActivateSemester,
} from "@/hooks/useSemesters";
import type { CreateSemesterPayload } from "@/types/school";
// import { semesterSchema, type SemesterFormValues } from "../../schemas";

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
    Layers,
    Plus,
    Trash2,
    Power,
    ArrowLeft,
    Loader2,
} from "lucide-react";
import { useAcademicSessionSetupStore } from "@/store/dashboard/academicSessionSetupStore";
import { SemesterFormValues, semesterSchema } from "@/schemas/school.schema";

export function SemesterManager() {
    const {
        selectedSessionId,
        selectedSessionName,
        // setCurrentStep,
        clearSelectedSession,
    } = useAcademicSessionSetupStore();

    const { data: semesters, isLoading } = useSemesters(selectedSessionId);
    const createSemester = useCreateSemester();
    const deleteSemester = useDeleteSemester(selectedSessionId!);
    const activateSemester = useActivateSemester(selectedSessionId!);

    const [showForm, setShowForm] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SemesterFormValues>({
        resolver: zodResolver(semesterSchema),
        defaultValues: { name: "", sequence_no: 1 },
    });

    const onSubmit = async (data: SemesterFormValues) => {
        if (!selectedSessionId) return;
        const payload: CreateSemesterPayload = {
            academic_session_id: selectedSessionId,
            name: data.name,
            sequence_no: data.sequence_no,
            is_active: false,
        };
        await createSemester.mutateAsync(payload);
        reset({ name: "", sequence_no: (semesters?.length ?? 0) + 2 });
        setShowForm(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 animate-spin text-primary" />
            </div>
        );
    }

    const sorted = [...(semesters ?? [])].sort(
        (a, b) => a.sequence_no - b.sequence_no
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearSelectedSession}
                        title="Back to sessions"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Semesters
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
                        Add Semester
                    </Button>
                    {/* <Button
                        onClick={() => setCurrentStep("fee-structures")}
                        disabled={!sorted.length}
                    >
                        Next: Fee Structures
                        <ArrowRight className="size-4" data-icon="inline-end" />
                    </Button> */}
                </div>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Semester</CardTitle>
                        <CardDescription>
                            Define a semester period and its chronological order.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Semester Name</Label>
                                <Input
                                    id="name"
                                    placeholder="1st Semester"
                                    aria-invalid={!!errors.name}
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="sequence_no">Sequence Order</Label>
                                <Input
                                    id="sequence_no"
                                    type="number"
                                    min={1}
                                    aria-invalid={!!errors.sequence_no}
                                    {...register("sequence_no", { valueAsNumber: true })}
                                />
                                {errors.sequence_no && (
                                    <p className="text-sm text-destructive">{errors.sequence_no.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                disabled={createSemester.isPending}
                            >
                                {createSemester.isPending && (
                                    <Loader2
                                        className="size-4 animate-spin"
                                        data-icon="inline-start"
                                    />
                                )}
                                Add Semester
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Semester List */}
            {!sorted.length && !showForm ? (
                <EmptyState
                    icon={Layers}
                    title="No semesters defined"
                    description="Add semesters to this session (e.g., 1st Semester, 2nd Semester)."
                    action={
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="size-4" data-icon="inline-start" />
                            Add First Semester
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sorted.map((semester) => (
                        <Card key={semester.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                        {semester.sequence_no}
                                    </span>
                                    {semester.name}
                                </CardTitle>
                                <CardDescription>
                                    Sequence: {semester.sequence_no} —{" "}
                                    {semester.is_active ? (
                                        <span className="font-medium text-primary">Active</span>
                                    ) : (
                                        "Inactive"
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    {!semester.is_active && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => activateSemester.mutate(semester.id)}
                                        >
                                            <Power className="size-3.5" data-icon="inline-start" />
                                            Activate
                                        </Button>
                                    )}
                                    {semester.is_active && (
                                        <span className="flex-1 text-center text-xs font-medium text-primary">
                                            ● Currently Active
                                        </span>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="icon-sm"
                                        onClick={() => deleteSemester.mutate(semester.id)}
                                    >
                                        <Trash2 className="size-3.5" />
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