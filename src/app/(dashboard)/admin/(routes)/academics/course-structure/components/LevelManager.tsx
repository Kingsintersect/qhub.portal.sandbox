"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLevels, useCreateLevel, useUpdateLevel } from "@/hooks/useCourseStructure";
import { useCourseStructureStore } from "@/store/dashboard/courseStructureStore";
import { curriculumLevelSchema, type CurriculumLevelFormValues } from "@/schemas/school.schema";
import type { CurriculumLevel } from "@/types/school";

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
    ArrowRight,
    ArrowLeft,
    Pencil,
    Loader2,
} from "lucide-react";

export function LevelManager() {
    const {
        selectedDepartmentId,
        selectedDepartmentName,
        selectedFacultyName,
        clearSelectedDepartment,
        setSelectedLevel,
    } = useCourseStructureStore();

    const { data, isLoading } = useLevels(selectedDepartmentId);
    const createLevel = useCreateLevel();
    const updateLevel = useUpdateLevel();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const levels = data?.data ?? [];

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CurriculumLevelFormValues>({
        resolver: zodResolver(curriculumLevelSchema),
        defaultValues: { name: "", numeric_value: 100 },
    });

    const onSubmit = async (values: CurriculumLevelFormValues) => {
        if (editingId) {
            await updateLevel.mutateAsync({ id: editingId, payload: values });
            setEditingId(null);
        } else {
            await createLevel.mutateAsync({
                ...values,
                department_id: selectedDepartmentId!,
            });
        }
        reset({ name: "", numeric_value: 100 });
        setShowForm(false);
    };

    const startEdit = (level: CurriculumLevel) => {
        setEditingId(level.id);
        reset({ name: level.name, numeric_value: level.numeric_value });
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        reset({ name: "", numeric_value: 100 });
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

    const isPending = createLevel.isPending || updateLevel.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearSelectedDepartment}
                        title="Back to departments"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Levels</h2>
                        <p className="text-sm text-muted-foreground">
                            {selectedFacultyName} &rarr;{" "}
                            <span className="font-medium text-foreground">
                                {selectedDepartmentName}
                            </span>
                        </p>
                    </div>
                </div>
                <Button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
                    <Plus className="size-4" data-icon="inline-start" />
                    New Level
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
                                <CardTitle>{editingId ? "Edit Level" : "Create Level"}</CardTitle>
                                <CardDescription>
                                    {editingId
                                        ? "Update the level details below."
                                        : "Add a new academic level (e.g., 100 Level, 200 Level)."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lvl-name">Level Name</Label>
                                        <Input
                                            id="lvl-name"
                                            placeholder="100 Level"
                                            aria-invalid={!!errors.name}
                                            {...register("name")}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lvl-value">Numeric Value</Label>
                                        <Input
                                            id="lvl-value"
                                            type="number"
                                            min={100}
                                            step={100}
                                            placeholder="100"
                                            aria-invalid={!!errors.numeric_value}
                                            {...register("numeric_value", { valueAsNumber: true })}
                                        />
                                        {errors.numeric_value && (
                                            <p className="text-sm text-destructive">
                                                {errors.numeric_value.message}
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
                                        {editingId ? "Save Changes" : "Create Level"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Level List */}
            {!levels.length && !showForm ? (
                <EmptyState
                    icon={Layers}
                    title="No levels yet"
                    description="Add academic levels to this department (e.g., 100 Level, 200 Level)."
                    action={
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="size-4" data-icon="inline-start" />
                            Add First Level
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {levels.map((level, index) => (
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {level.numeric_value}
                                        </span>
                                        {level.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {level.semesters_count} semester
                                        {level.semesters_count !== 1 ? "s" : ""}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            className="flex-1"
                                            onClick={() =>
                                                setSelectedLevel(level.id, level.name)
                                            }
                                        >
                                            Semesters
                                            <ArrowRight className="size-4" data-icon="inline-end" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => startEdit(level)}
                                            title="Edit level"
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
