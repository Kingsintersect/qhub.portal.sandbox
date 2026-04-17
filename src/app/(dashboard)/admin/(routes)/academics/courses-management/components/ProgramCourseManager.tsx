"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programCourseAssignSchema, type ProgramCourseAssignFormValues } from "@/schemas/school.schema";
import {
    useCourses,
    useProgramCoursesByCourse,
    useAssignCourseToProgram,
    useUpdateProgramCourse,
    useRemoveProgramCourse,
} from "@/hooks/useCourseManagement";
import type { Course, ProgramCourse } from "@/types/school";
import Combobox from "@/components/custom/Combobox";
import StatusBadge from "@/components/custom/StatusBadge";
import Modal from "@/components/custom/Modal";
import { EmptyState } from "./EmptyState";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Link2,
    Plus,
    Trash2,
    Loader2,
    GraduationCap,
    ArrowRight,
    ArrowLeft,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";

// ── program options (mirrors seed data) ─────
const programOptions = [
    { value: "prog-1", label: "B.Sc. Computer Science", description: "CSC" },
    { value: "prog-2", label: "B.Sc. Mathematics", description: "MTH" },
    { value: "prog-3", label: "B.Eng. Mechanical Engineering", description: "MEE" },
];

export function ProgramCourseManager() {
    const { data: coursesData, isLoading: coursesLoading } = useCourses();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const courses = coursesData?.data ?? [];
    const courseOptions = useMemo(
        () =>
            [...courses]
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((c) => ({
                    value: c.id,
                    label: c.code,
                    description: c.title,
                })),
        [courses],
    );

    if (coursesLoading) {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold text-foreground">Program Mapping</h2>
                <p className="text-sm text-muted-foreground">
                    Select a course to view and manage its program assignments.
                </p>
            </div>

            {/* Course Selector */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <GraduationCap className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Select Course</span>
                        </div>
                        <Combobox
                            options={courseOptions}
                            value={selectedCourse?.id ?? null}
                            onChange={(v) => {
                                const course = courses.find((c) => c.id === String(v));
                                setSelectedCourse(course ?? null);
                            }}
                            placeholder="Search by course code or title…"
                            searchPlaceholder="Type course code or title…"
                            renderOption={(option) => (
                                <div>
                                    <span className="font-mono text-xs font-semibold">{option.label}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">{option.description}</span>
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>
            </motion.div>

            {/* Course Detail / Assignments */}
            <AnimatePresence mode="wait">
                {selectedCourse ? (
                    <motion.div
                        key={selectedCourse.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.25 }}
                    >
                        <CourseAssignments course={selectedCourse} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <EmptyState
                            icon={Link2}
                            title="No course selected"
                            description="Select a course above to view and manage which programs it belongs to."
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Course Assignments Sub-component ────────

function CourseAssignments({ course }: { course: Course }) {
    const { data, isLoading } = useProgramCoursesByCourse(course.id);
    const assignMut = useAssignCourseToProgram();
    const updateMut = useUpdateProgramCourse();
    const removeMut = useRemoveProgramCourse();

    const [showAssignModal, setShowAssignModal] = useState(false);

    const mappings = data?.data ?? [];

    // Programs already assigned (to exclude from assign form)
    const assignedProgramIds = useMemo(() => new Set(mappings.map((m) => m.program_id)), [mappings]);
    const availablePrograms = useMemo(
        () => programOptions.filter((p) => !assignedProgramIds.has(p.value)),
        [assignedProgramIds],
    );

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProgramCourseAssignFormValues>({
        resolver: zodResolver(programCourseAssignSchema),
        defaultValues: { program_id: "", is_required: true },
    });

    const onAssign = async (values: ProgramCourseAssignFormValues) => {
        await assignMut.mutateAsync({
            course_id: course.id,
            program_id: values.program_id,
            is_required: values.is_required,
        });
        reset({ program_id: "", is_required: true });
        setShowAssignModal(false);
    };

    const toggleRequired = async (mapping: ProgramCourse) => {
        await updateMut.mutateAsync({
            id: mapping.id,
            payload: { is_required: !mapping.is_required },
        });
    };

    const removeMapping = async (id: string) => {
        await removeMut.mutateAsync(id);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="size-5 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Course info card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="size-4 text-primary" />
                        <span className="font-mono">{course.code}</span>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <span className="font-normal text-sm">{course.title}</span>
                    </CardTitle>
                    <CardDescription>
                        {course.level_name} — {course.semester_name}
                        {course.department_name ? ` — ${course.department_name}` : " — University-wide (GST)"}
                        {" · "}{course.credit_units} credit{course.credit_units !== 1 ? "s" : ""}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Assignments header */}
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                    Assigned to {mappings.length} program{mappings.length !== 1 ? "s" : ""}
                </p>
                <Button
                    size="sm"
                    onClick={() => setShowAssignModal(true)}
                    disabled={availablePrograms.length === 0}
                >
                    <Plus className="size-4" data-icon="inline-start" />
                    Assign to Program
                </Button>
            </div>

            {/* Mappings list */}
            {mappings.length === 0 ? (
                <EmptyState
                    icon={Link2}
                    title="Not assigned to any program"
                    description="Assign this course to one or more programs to include it in their curriculum."
                    action={
                        <Button size="sm" onClick={() => setShowAssignModal(true)}>
                            <Plus className="size-4" data-icon="inline-start" />
                            Assign to Program
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-2">
                    {mappings.map((mapping, index) => (
                        <motion.div
                            key={mapping.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.05 }}
                        >
                            <Card>
                                <CardContent className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                            {mapping.program_code}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {mapping.program_name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <StatusBadge
                                                    label={mapping.is_required ? "Required" : "Elective"}
                                                    variant={mapping.is_required ? "success" : "orange"}
                                                    dot
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleRequired(mapping)}
                                            title={mapping.is_required ? "Make elective" : "Make required"}
                                            disabled={updateMut.isPending}
                                            className="size-8"
                                        >
                                            {mapping.is_required ? (
                                                <ToggleRight className="size-4 text-emerald-600" />
                                            ) : (
                                                <ToggleLeft className="size-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeMapping(mapping.id)}
                                            title="Remove from program"
                                            disabled={removeMut.isPending}
                                            className="size-8 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Assign Modal */}
            <Modal
                open={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    reset({ program_id: "", is_required: true });
                }}
                title="Assign Course to Program"
                subtitle={`${course.code} — ${course.title}`}
                size="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAssignModal(false);
                                reset({ program_id: "", is_required: true });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(onAssign)}
                            disabled={assignMut.isPending}
                        >
                            {assignMut.isPending && (
                                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                            )}
                            Assign
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Program</Label>
                        <Controller
                            control={control}
                            name="program_id"
                            render={({ field }) => (
                                <Combobox
                                    options={availablePrograms}
                                    value={field.value || null}
                                    onChange={(v) => field.onChange(String(v))}
                                    placeholder="Select a program"
                                    searchPlaceholder="Search programs…"
                                />
                            )}
                        />
                        {errors.program_id && (
                            <p className="text-sm text-destructive">{errors.program_id.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Requirement</Label>
                        <Controller
                            control={control}
                            name="is_required"
                            render={({ field }) => (
                                <Select
                                    value={field.value ? "required" : "elective"}
                                    onValueChange={(v) => field.onChange(v === "required")}
                                >
                                    <SelectTrigger className="w-full h-10 rounded-xl bg-muted border-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="required">Required (Compulsory)</SelectItem>
                                        <SelectItem value="elective">Elective (Optional)</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
