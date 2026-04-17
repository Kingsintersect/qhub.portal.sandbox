"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useCurriculumSemesters,
    useCreateCurriculumSemester,
    useUpdateCurriculumSemester,
} from "@/hooks/useCourseStructure";
import { useCourseStructureStore } from "@/store/dashboard/courseStructureStore";
import { curriculumSemesterSchema, type CurriculumSemesterFormValues } from "@/schemas/school.schema";
import type { CurriculumSemester } from "@/types/school";

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
    BookOpen,
    Plus,
    ArrowLeft,
    Pencil,
    Loader2,
} from "lucide-react";

export function CurriculumSemesterManager() {
    const {
        selectedLevelId,
        selectedLevelName,
        selectedDepartmentId,
        selectedDepartmentName,
        selectedFacultyName,
        clearSelectedLevel,
    } = useCourseStructureStore();

    const { data, isLoading } = useCurriculumSemesters(selectedLevelId);
    const createSemester = useCreateCurriculumSemester();
    const updateSemester = useUpdateCurriculumSemester();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const semesters = [...(data?.data ?? [])].sort(
        (a, b) => a.sequence_no - b.sequence_no
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CurriculumSemesterFormValues>({
        resolver: zodResolver(curriculumSemesterSchema),
        defaultValues: { name: "", sequence_no: 1 },
    });

    const onSubmit = async (values: CurriculumSemesterFormValues) => {
        if (editingId) {
            await updateSemester.mutateAsync({ id: editingId, payload: values });
            setEditingId(null);
        } else {
            await createSemester.mutateAsync({
                ...values,
                level_id: selectedLevelId!,
                department_id: selectedDepartmentId!,
            });
        }
        reset({ name: "", sequence_no: (semesters.length ?? 0) + 2 });
        setShowForm(false);
    };

    const startEdit = (sem: CurriculumSemester) => {
        setEditingId(sem.id);
        reset({ name: sem.name, sequence_no: sem.sequence_no });
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        reset({ name: "", sequence_no: 1 });
    };

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-20"
            >
                <Loader2 className="size-6 animate-spin text-primary" />
            </motion.div>
        );
    }

    const isPending = createSemester.isPending || updateSemester.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearSelectedLevel}
                        title="Back to levels"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Semesters</h2>
                        <p className="text-sm text-muted-foreground">
                            {selectedFacultyName} &rarr; {selectedDepartmentName} &rarr;{" "}
                            <span className="font-medium text-foreground">
                                {selectedLevelName}
                            </span>
                        </p>
                    </div>
                </div>
                <Button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
                    <Plus className="size-4" data-icon="inline-start" />
                    Add Semester
                </Button>
            </div>

            {/* Create / Edit Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingId ? "Edit Semester" : "Add Semester"}</CardTitle>
                                <CardDescription>
                                    {editingId
                                        ? "Update the semester details below."
                                        : "Define a semester and its sequence order."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="sem-name">Semester Name</Label>
                                        <Input
                                            id="sem-name"
                                            placeholder="1st Semester"
                                            aria-invalid={!!errors.name}
                                            {...register("name")}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="sem-seq">Sequence Order</Label>
                                        <Input
                                            id="sem-seq"
                                            type="number"
                                            min={1}
                                            aria-invalid={!!errors.sequence_no}
                                            {...register("sequence_no", { valueAsNumber: true })}
                                        />
                                        {errors.sequence_no && (
                                            <p className="text-sm text-destructive">
                                                {errors.sequence_no.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <Button variant="outline" onClick={cancelForm}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
                                        {isPending && (
                                            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                                        )}
                                        {editingId ? "Save Changes" : "Add Semester"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Semester List */}
            {!semesters.length && !showForm ? (
                <EmptyState
                    icon={BookOpen}
                    title="No semesters yet"
                    description="Add semesters to this level (e.g., 1st Semester, 2nd Semester)."
                    action={
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="size-4" data-icon="inline-start" />
                            Add First Semester
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {semesters.map((sem, index) => (
                        <motion.div
                            key={sem.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {sem.sequence_no}
                                        </span>
                                        {sem.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {sem.courses_count} course
                                        {sem.courses_count !== 1 ? "s" : ""}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <span className="flex-1 text-sm text-muted-foreground">
                                            Sequence: {sem.sequence_no}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => startEdit(sem)}
                                            title="Edit semester"
                                        >
                                            <Pencil className="size-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
