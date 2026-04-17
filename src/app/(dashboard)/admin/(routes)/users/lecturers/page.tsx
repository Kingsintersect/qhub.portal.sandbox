"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Eye, Pencil, Loader2, BookMarked, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/custom/DataTable";
import Avatar from "@/components/custom/Avatar";
import StatusBadge from "@/components/custom/StatusBadge";
import Modal from "@/components/custom/Modal";
import Combobox from "@/components/custom/Combobox";
import { useLecturers, useCreateLecturer, useUpdateLecturer, useLecturerCourses, useCourseOfferings, useAssignCourse, useUnassignCourse } from "../summary/hooks/useUsersData";
import type { Lecturer, CreateLecturerPayload, UpdateLecturerPayload, LecturerCourseRole } from "@/types/users";

const columns: Column<Lecturer & Record<string, unknown>>[] = [
    {
        key: "name", header: "Lecturer", sortable: true, width: "28%",
        render: (row) => (
            <div className="flex items-center gap-3">
                <Avatar name={`${row.user.first_name ?? ""} ${row.user.last_name ?? ""}`} size="sm" status={row.user.is_active ? "online" : "offline"} />
                <div>
                    <p className="font-medium text-foreground text-sm">
                        {row.user.first_name} {row.user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{row.staff_number}</p>
                </div>
            </div>
        ),
    },
    { key: "designation", header: "Designation", sortable: true },
    { key: "department_name", header: "Department", sortable: true },
    { key: "faculty_name", header: "Faculty" },
    {
        key: "specialization", header: "Specialization",
        render: (row) => <span className="text-xs">{row.specialization ?? "—"}</span>,
    },
    {
        key: "is_active", header: "Status", align: "center",
        render: (row) => (
            <StatusBadge label={row.user.is_active ? "Active" : "Inactive"} variant={row.user.is_active ? "success" : "destructive"} dot />
        ),
    },
];

export default function LecturersPage() {
    const { data, isLoading } = useLecturers();
    const createLecturer = useCreateLecturer();
    const updateLecturer = useUpdateLecturer();
    const [selected, setSelected] = useState<Lecturer | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Lecturer | null>(null);
    const [coursesFor, setCoursesFor] = useState<Lecturer | null>(null);

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-violet-500/10 p-2.5 dark:bg-violet-500/20">
                            <BookOpen size={22} className="text-violet-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">Lecturers</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage lecturers — assign lecturer roles to existing users.
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setShowCreate(true)} className="gap-2">
                        <Plus size={16} /> Add Lecturer
                    </Button>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                <DataTable
                    data={(data?.data ?? []) as (Lecturer & Record<string, unknown>)[]}
                    columns={[
                        ...columns,
                        {
                            key: "actions", header: "", align: "center", width: "130px",
                            render: (row) => (
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => setSelected(row as unknown as Lecturer)}>
                                        <Eye size={14} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditing(row as unknown as Lecturer)}>
                                        <Pencil size={14} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setCoursesFor(row as unknown as Lecturer)} title="Courses">
                                        <BookMarked size={14} />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    loading={isLoading}
                    searchPlaceholder="Search by name, staff no, department…"
                    searchExtractor={(row) =>
                        `${row.user.first_name ?? ""} ${row.user.last_name ?? ""} ${row.staff_number} ${row.department_name} ${row.designation}`
                    }
                    rowKey="id"
                    pageSize={10}
                    emptyMessage="No lecturers found"
                />
            </motion.div>

            {/* Detail modal */}
            <Modal
                open={!!selected}
                onClose={() => setSelected(null)}
                title={selected ? `${selected.user.first_name} ${selected.user.last_name}` : ""}
                subtitle={selected?.staff_number}
                size="lg"
            >
                {selected && <LecturerDetail lecturer={selected} />}
            </Modal>

            {/* Create modal */}
            <Modal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title="Add New Lecturer"
                subtitle="Select an existing user and fill in lecturer details"
                size="xl"
            >
                <CreateLecturerForm
                    onSubmit={async (payload) => {
                        await createLecturer.mutateAsync(payload);
                        setShowCreate(false);
                    }}
                    isSubmitting={createLecturer.isPending}
                />
            </Modal>

            {/* Edit modal */}
            <Modal
                open={!!editing}
                onClose={() => setEditing(null)}
                title={editing ? `Edit — ${editing.user.first_name} ${editing.user.last_name}` : ""}
                subtitle={editing?.staff_number}
                size="xl"
            >
                {editing && (
                    <EditLecturerForm
                        lecturer={editing}
                        onSubmit={async (payload) => {
                            await updateLecturer.mutateAsync({ id: editing.id, payload });
                            setEditing(null);
                        }}
                        isSubmitting={updateLecturer.isPending}
                    />
                )}
            </Modal>

            {/* Courses modal */}
            <Modal
                open={!!coursesFor}
                onClose={() => setCoursesFor(null)}
                title={coursesFor ? `Courses — ${coursesFor.user.first_name} ${coursesFor.user.last_name}` : ""}
                subtitle={coursesFor?.staff_number}
                size="xl"
            >
                {coursesFor && <LecturerCoursesPanel lecturer={coursesFor} />}
            </Modal>
        </div>
    );
}

function LecturerDetail({ lecturer }: { lecturer: Lecturer }) {
    const fields = [
        { label: "Full Name", value: `${lecturer.user.first_name} ${lecturer.user.middle_name ?? ""} ${lecturer.user.last_name}` },
        { label: "Email", value: lecturer.user.email },
        { label: "Phone", value: lecturer.user.phone_number ?? "—" },
        { label: "Staff Number", value: lecturer.staff_number },
        { label: "Department", value: lecturer.department_name },
        { label: "Faculty", value: lecturer.faculty_name },
        { label: "Designation", value: lecturer.designation },
        { label: "Specialization", value: lecturer.specialization ?? "—" },
        { label: "Office", value: lecturer.office_location ?? "—" },
        { label: "Office Phone", value: lecturer.office_phone ?? "—" },
        { label: "Qualifications", value: lecturer.qualifications ?? "—" },
        { label: "Research Areas", value: lecturer.research_areas ?? "—" },
        { label: "Bio", value: lecturer.bio ?? "—" },
    ];

    return (
        <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {fields.map((f) => (
                    <div key={f.label} className="flex justify-between py-1.5 border-b border-border/50">
                        <span className="text-xs text-muted-foreground">{f.label}</span>
                        <span className="text-xs font-medium text-foreground text-right max-w-[60%]">{f.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CreateLecturerForm({
    onSubmit,
    isSubmitting,
}: {
    onSubmit: (p: CreateLecturerPayload) => Promise<void>;
    isSubmitting: boolean;
}) {
    const [form, setForm] = useState<CreateLecturerPayload>({
        user_id: 0,
        first_name: "",
        last_name: "",
        staff_number: "",
        department_id: 1,
        designation: "",
    });

    const update = (key: keyof CreateLecturerPayload, value: string | number) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    const inputCls = "w-full px-3 py-2 text-sm bg-muted border border-transparent rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground text-foreground";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-xs text-muted-foreground">
                Enter the existing User ID of the person you want to assign as a lecturer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">User ID *</label>
                    <input type="number" className={inputCls} placeholder="e.g. 8" required value={form.user_id || ""} onChange={(e) => update("user_id", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Staff Number *</label>
                    <input className={inputCls} placeholder="STF/2026/001" required value={form.staff_number} onChange={(e) => update("staff_number", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">First Name *</label>
                    <input className={inputCls} required value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Last Name *</label>
                    <input className={inputCls} required value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Middle Name</label>
                    <input className={inputCls} value={form.middle_name ?? ""} onChange={(e) => update("middle_name", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Phone Number</label>
                    <input className={inputCls} value={form.phone_number ?? ""} onChange={(e) => update("phone_number", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Designation *</label>
                    <input className={inputCls} placeholder="Senior Lecturer" required value={form.designation} onChange={(e) => update("designation", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Specialization</label>
                    <input className={inputCls} value={form.specialization ?? ""} onChange={(e) => update("specialization", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Office Location</label>
                    <input className={inputCls} value={form.office_location ?? ""} onChange={(e) => update("office_location", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Office Phone</label>
                    <input className={inputCls} value={form.office_phone ?? ""} onChange={(e) => update("office_phone", e.target.value)} />
                </div>
            </div>

            <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Qualifications</label>
                <textarea className={inputCls} rows={2} value={form.qualifications ?? ""} onChange={(e) => update("qualifications", e.target.value)} />
            </div>
            <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Research Areas</label>
                <textarea className={inputCls} rows={2} value={form.research_areas ?? ""} onChange={(e) => update("research_areas", e.target.value)} />
            </div>
            <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Bio</label>
                <textarea className={inputCls} rows={2} value={form.bio ?? ""} onChange={(e) => update("bio", e.target.value)} />
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    Create Lecturer
                </Button>
            </div>
        </form>
    );
}

function EditLecturerForm({
    lecturer,
    onSubmit,
    isSubmitting,
}: {
    lecturer: Lecturer;
    onSubmit: (p: UpdateLecturerPayload) => Promise<void>;
    isSubmitting: boolean;
}) {
    const [form, setForm] = useState<UpdateLecturerPayload>({
        designation: lecturer.designation,
        specialization: lecturer.specialization ?? "",
        office_location: lecturer.office_location ?? "",
        office_phone: lecturer.office_phone ?? "",
        qualifications: lecturer.qualifications ?? "",
        research_areas: lecturer.research_areas ?? "",
        bio: lecturer.bio ?? "",
    });

    const update = (key: keyof UpdateLecturerPayload, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    const inputCls = "w-full px-3 py-2 text-sm bg-muted border border-transparent rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground text-foreground";

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Designation</label>
                    <input className={inputCls} value={form.designation ?? ""} onChange={(e) => update("designation", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Specialization</label>
                    <input className={inputCls} value={form.specialization ?? ""} onChange={(e) => update("specialization", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Office Location</label>
                    <input className={inputCls} value={form.office_location ?? ""} onChange={(e) => update("office_location", e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Office Phone</label>
                    <input className={inputCls} value={form.office_phone ?? ""} onChange={(e) => update("office_phone", e.target.value)} />
                </div>
            </div>
            <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Qualifications</label>
                <textarea className={inputCls} rows={2} value={form.qualifications ?? ""} onChange={(e) => update("qualifications", e.target.value)} />
            </div>
            <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Research Areas</label>
                <textarea className={inputCls} rows={2} value={form.research_areas ?? ""} onChange={(e) => update("research_areas", e.target.value)} />
            </div>
            <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Bio</label>
                <textarea className={inputCls} rows={2} value={form.bio ?? ""} onChange={(e) => update("bio", e.target.value)} />
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}

/* ── Course Assignment Panel ─────────────────── */

const ROLE_OPTIONS: { value: LecturerCourseRole; label: string }[] = [
    { value: "primary", label: "Primary" },
    { value: "assistant", label: "Assistant" },
    { value: "supervisor", label: "Supervisor" },
];

const roleVariant: Record<LecturerCourseRole, "success" | "info" | "purple"> = {
    primary: "success",
    assistant: "info",
    supervisor: "purple",
};

function LecturerCoursesPanel({ lecturer }: { lecturer: Lecturer }) {
    const { data: coursesData, isLoading } = useLecturerCourses(lecturer.id);
    const { data: offeringsData } = useCourseOfferings();
    const assignCourse = useAssignCourse();
    const unassignCourse = useUnassignCourse();

    const [selectedOffering, setSelectedOffering] = useState<number>(0);
    const [selectedRole, setSelectedRole] = useState<LecturerCourseRole>("primary");

    const assignments = coursesData?.data ?? [];
    const assignedOfferingIds = new Set(assignments.map((a) => a.offering_id));
    const availableOfferings = (offeringsData?.data ?? []).filter((o) => !assignedOfferingIds.has(o.id));

    const offeringOptions = useMemo(
        () =>
            availableOfferings.map((o) => ({
                value: o.id,
                label: `${o.course_code} — ${o.course_title}`,
                description: `${o.credit_units} CU · ${o.semester_name}, ${o.session_name} · ${o.status}`,
            })),
        [availableOfferings],
    );

    const handleAssign = async () => {
        if (!selectedOffering) return;
        await assignCourse.mutateAsync({
            lecturer_id: lecturer.id,
            offering_id: selectedOffering,
            role: selectedRole,
        });
        setSelectedOffering(0);
        setSelectedRole("primary");
    };

    const selectCls = "w-full px-3 py-2 text-sm bg-muted border border-transparent rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground appearance-none";

    return (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
            {/* Assign new course */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Assign Course</h3>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 items-end">
                    <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">Course Offering</label>
                        <Combobox
                            options={offeringOptions}
                            value={selectedOffering || null}
                            onChange={(v) => setSelectedOffering(v as number)}
                            placeholder="Search courses…"
                            searchPlaceholder="Type code or title…"
                            emptyMessage="No courses found"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">Role</label>
                        <select
                            className={selectCls}
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as LecturerCourseRole)}
                        >
                            {ROLE_OPTIONS.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedOffering || assignCourse.isPending}
                        className="gap-2"
                    >
                        {assignCourse.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Assign
                    </Button>
                </div>
            </div>

            {/* Current assignments */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                    Assigned Courses ({assignments.length})
                </h3>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">Loading…</div>
                ) : assignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <BookOpen size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">No courses assigned yet</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {assignments.map((a) => (
                            <div
                                key={a.id}
                                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-foreground">{a.offering.course_code}</span>
                                        <StatusBadge label={a.role} variant={roleVariant[a.role]} />
                                        <StatusBadge label={a.offering.status} variant={a.offering.status === "OPEN" ? "success" : "default"} />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {a.offering.course_title} · {a.offering.credit_units} CU · {a.offering.semester_name}, {a.offering.session_name}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                                    onClick={() => unassignCourse.mutate(a.id)}
                                    disabled={unassignCourse.isPending}
                                    title="Unassign"
                                >
                                    <X size={14} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
