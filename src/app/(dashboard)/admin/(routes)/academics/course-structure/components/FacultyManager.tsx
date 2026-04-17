"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFaculties, useCreateFaculty, useUpdateFaculty } from "@/hooks/useCourseStructure";
import { useCourseStructureStore } from "@/store/dashboard/courseStructureStore";
import { facultySchema, type FacultyFormValues } from "@/schemas/school.schema";
import type { Faculty } from "@/types/school";

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
    Building2,
    Plus,
    ArrowRight,
    Pencil,
    Loader2,
} from "lucide-react";

export function FacultyManager() {
    const { data, isLoading } = useFaculties();
    const createFaculty = useCreateFaculty();
    const updateFaculty = useUpdateFaculty();
    const { setSelectedFaculty } = useCourseStructureStore();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const faculties = data?.data ?? [];

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FacultyFormValues>({
        resolver: zodResolver(facultySchema),
        defaultValues: { name: "", code: "", description: "", email: "", phone_number: "" },
    });

    const onSubmit = async (values: FacultyFormValues) => {
        if (editingId) {
            await updateFaculty.mutateAsync({ id: editingId, payload: values });
            setEditingId(null);
        } else {
            await createFaculty.mutateAsync(values);
        }
        reset();
        setShowForm(false);
    };

    const startEdit = (faculty: Faculty) => {
        setEditingId(faculty.id);
        reset({
            name: faculty.name,
            code: faculty.code,
            description: faculty.description,
            email: faculty.email,
            phone_number: faculty.phone_number,
        });
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        reset({ name: "", code: "", description: "", email: "", phone_number: "" });
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

    const isPending = createFaculty.isPending || updateFaculty.isPending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Faculties</h2>
                    <p className="text-sm text-muted-foreground">
                        Create a faculty or select one to manage its departments.
                    </p>
                </div>
                <Button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
                    <Plus className="size-4" data-icon="inline-start" />
                    New Faculty
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
                                <CardTitle>{editingId ? "Edit Faculty" : "Create Faculty"}</CardTitle>
                                <CardDescription>
                                    {editingId
                                        ? "Update faculty details below."
                                        : "Provide details for the new faculty."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="name">Faculty Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Faculty of Science"
                                            aria-invalid={!!errors.name}
                                            {...register("name")}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="code">Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="SCI"
                                            aria-invalid={!!errors.code}
                                            {...register("code")}
                                        />
                                        {errors.code && (
                                            <p className="text-sm text-destructive">{errors.code.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="science@uni.edu.ng"
                                            aria-invalid={!!errors.email}
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-destructive">{errors.email.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone_number">Phone</Label>
                                        <Input
                                            id="phone_number"
                                            placeholder="01-4560001"
                                            {...register("phone_number")}
                                        />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            placeholder="Brief description of the faculty"
                                            {...register("description")}
                                        />
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
                                        {editingId ? "Save Changes" : "Create Faculty"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Faculty List */}
            {!faculties.length && !showForm ? (
                <EmptyState
                    icon={Building2}
                    title="No faculties yet"
                    description="Create your first faculty to begin building the course structure."
                    action={
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="size-4" data-icon="inline-start" />
                            Create First Faculty
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {faculties.map((faculty, index) => (
                        <motion.div
                            key={faculty.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="relative">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="size-4 text-primary" />
                                        {faculty.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Code: {faculty.code} — {faculty.departments_count} department
                                        {faculty.departments_count !== 1 ? "s" : ""}
                                    </CardDescription>
                                    <CardAction>
                                        {faculty.is_active && (
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
                                            onClick={() =>
                                                setSelectedFaculty(faculty.id, faculty.name)
                                            }
                                        >
                                            Departments
                                            <ArrowRight className="size-4" data-icon="inline-end" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => startEdit(faculty)}
                                            title="Edit faculty"
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
