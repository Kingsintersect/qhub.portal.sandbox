"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Eye, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/custom/DataTable";
import Avatar from "@/components/custom/Avatar";
import StatusBadge from "@/components/custom/StatusBadge";
import Modal from "@/components/custom/Modal";
import { useStudents, useUpdateStudent } from "../summary/hooks/useUsersData";
import type { Student, StudentStatus, UpdateStudentPayload, ModeOfStudy } from "@/types/users";

const statusVariant: Record<StudentStatus, "success" | "warning" | "destructive" | "info" | "default" | "orange"> = {
   ACTIVE: "success",
   GRADUATED: "info",
   WITHDRAWN: "destructive",
   SUSPENDED: "warning",
   RUSTICATED: "destructive",
   DEFERRED: "orange",
};

const columns: Column<Student & Record<string, unknown>>[] = [
   {
      key: "name", header: "Student", sortable: true, width: "25%",
      render: (row) => (
         <div className="flex items-center gap-3">
            <Avatar name={`${row.user.first_name ?? ""} ${row.user.last_name ?? ""}`} size="sm" />
            <div>
               <p className="font-medium text-foreground text-sm">
                  {row.user.first_name} {row.user.middle_name ? `${row.user.middle_name} ` : ""}{row.user.last_name}
               </p>
               <p className="text-xs text-muted-foreground">{row.matric_number}</p>
            </div>
         </div>
      ),
   },
   { key: "program_name", header: "Programme", sortable: true },
   { key: "department_name", header: "Department", sortable: true },
   {
      key: "current_level", header: "Level", align: "center", sortable: true,
      render: (row) => <span className="text-sm font-medium">{row.current_level}L</span>,
   },
   {
      key: "current_cgpa", header: "CGPA", align: "center", sortable: true,
      render: (row) => (
         <span className="text-sm">{row.current_cgpa?.toFixed(2) ?? "—"}</span>
      ),
   },
   {
      key: "status", header: "Status", align: "center",
      render: (row) => (
         <StatusBadge label={row.status} variant={statusVariant[row.status]} dot />
      ),
   },
   {
      key: "entry_mode", header: "Entry", align: "center",
      render: (row) => (
         <StatusBadge label={row.entry_mode.replace("_", " ")} variant="default" />
      ),
   },
];

export default function StudentsPage() {
   const { data, isLoading } = useStudents();
   const updateStudent = useUpdateStudent();
   const [selected, setSelected] = useState<Student | null>(null);
   const [editing, setEditing] = useState<Student | null>(null);

   return (
      <div className="space-y-8 mx-auto px-4 py-8 sm:px-6 lg:px-8">
         {/* Header */}
         <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex items-center gap-3">
               <div className="rounded-xl bg-emerald-500/10 p-2.5 dark:bg-emerald-500/20">
                  <GraduationCap size={22} className="text-emerald-500" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">Students</h1>
                  <p className="text-sm text-muted-foreground">
                     View and manage all student records. Students are created automatically after tuition payment.
                  </p>
               </div>
            </div>
         </motion.div>

         {/* Table */}
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <DataTable
               data={(data?.data ?? []) as (Student & Record<string, unknown>)[]}
               columns={[
                  ...columns,
                  {
                     key: "actions", header: "", align: "center", width: "90px",
                     render: (row) => (
                        <div className="flex gap-1">
                           <Button variant="ghost" size="sm" onClick={() => setSelected(row as unknown as Student)}>
                              <Eye size={14} />
                           </Button>
                           <Button variant="ghost" size="sm" onClick={() => setEditing(row as unknown as Student)}>
                              <Pencil size={14} />
                           </Button>
                        </div>
                     ),
                  },
               ]}
               loading={isLoading}
               searchPlaceholder="Search by name, matric no, department…"
               searchExtractor={(row) =>
                  `${row.user.first_name ?? ""} ${row.user.last_name ?? ""} ${row.matric_number} ${row.department_name} ${row.user.email}`
               }
               rowKey="id"
               pageSize={10}
               emptyMessage="No students found"
            />
         </motion.div>

         {/* Detail modal */}
         <Modal
            open={!!selected}
            onClose={() => setSelected(null)}
            title={selected ? `${selected.user.first_name} ${selected.user.last_name}` : ""}
            subtitle={selected?.matric_number}
            size="lg"
         >
            {selected && <StudentDetail student={selected} />}
         </Modal>

         {/* Edit modal */}
         <Modal
            open={!!editing}
            onClose={() => setEditing(null)}
            title={editing ? `Edit — ${editing.user.first_name} ${editing.user.last_name}` : ""}
            subtitle={editing?.matric_number}
            size="lg"
         >
            {editing && (
               <EditStudentForm
                  student={editing}
                  onSubmit={async (payload) => {
                     await updateStudent.mutateAsync({ id: editing.id, payload });
                     setEditing(null);
                  }}
                  isSubmitting={updateStudent.isPending}
               />
            )}
         </Modal>
      </div>
   );
}

function StudentDetail({ student }: { student: Student }) {
   const sections = [
      {
         title: "Personal Information",
         fields: [
            { label: "Full Name", value: `${student.user.first_name} ${student.user.middle_name ?? ""} ${student.user.last_name}` },
            { label: "Email", value: student.user.email },
            { label: "Phone", value: student.user.phone_number ?? "—" },
            { label: "Gender", value: student.gender },
            { label: "Date of Birth", value: new Date(student.date_of_birth).toLocaleDateString() },
            { label: "Nationality", value: student.nationality },
            { label: "State of Origin", value: student.state_of_origin },
            { label: "LGA", value: student.lga_of_origin },
         ],
      },
      {
         title: "Academic Information",
         fields: [
            { label: "Matric Number", value: student.matric_number },
            { label: "Programme", value: student.program_name },
            { label: "Department", value: student.department_name },
            { label: "Faculty", value: student.faculty_name },
            { label: "Level", value: `${student.current_level}L` },
            { label: "Entry Mode", value: student.entry_mode.replace("_", " ") },
            { label: "Mode of Study", value: student.mode_of_study.replace("_", " ") },
            { label: "CGPA", value: student.current_cgpa?.toFixed(2) ?? "—" },
            { label: "Status", value: student.status },
            { label: "Admission Date", value: new Date(student.admission_date).toLocaleDateString() },
         ],
      },
      {
         title: "Contact & Guardian",
         fields: [
            { label: "Permanent Address", value: student.permanent_address },
            { label: "Contact Address", value: student.contact_address },
            { label: "Guardian Name", value: student.guardian_name },
            { label: "Guardian Phone", value: student.guardian_phone },
            { label: "Guardian Email", value: student.guardian_email ?? "—" },
         ],
      },
   ];

   return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
         {sections.map((section) => (
            <div key={section.title}>
               <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {section.fields.map((f) => (
                     <div key={f.label} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                        <span className="text-xs text-muted-foreground">{f.label}</span>
                        <span className="text-xs font-medium text-foreground text-right">{f.value}</span>
                     </div>
                  ))}
               </div>
            </div>
         ))}
      </div>
   );
}

const STUDENT_STATUSES: StudentStatus[] = ["ACTIVE", "GRADUATED", "WITHDRAWN", "SUSPENDED", "RUSTICATED", "DEFERRED"];
const STUDY_MODES: ModeOfStudy[] = ["FULL_TIME", "PART_TIME", "SANDWICH", "DISTANCE"];

function EditStudentForm({
   student,
   onSubmit,
   isSubmitting,
}: {
   student: Student;
   onSubmit: (p: UpdateStudentPayload) => Promise<void>;
   isSubmitting: boolean;
}) {
   const [form, setForm] = useState<UpdateStudentPayload>({
      current_level: student.current_level,
      mode_of_study: student.mode_of_study,
      status: student.status,
      contact_address: student.contact_address,
      phone_number: student.user.phone_number ?? "",
   });

   const update = (key: keyof UpdateStudentPayload, value: string | number) =>
      setForm((prev) => ({ ...prev, [key]: value }));

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(form);
   };

   const inputCls = "w-full px-3 py-2 text-sm bg-muted border border-transparent rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground text-foreground";
   const selectCls = `${inputCls} appearance-none`;

   return (
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
               <label className="text-xs font-medium text-foreground mb-1 block">Current Level</label>
               <input type="number" className={inputCls} step={100} min={100} max={900} value={form.current_level ?? ""} onChange={(e) => update("current_level", parseInt(e.target.value) || 0)} />
            </div>
            <div>
               <label className="text-xs font-medium text-foreground mb-1 block">Status</label>
               <select className={selectCls} value={form.status ?? ""} onChange={(e) => update("status", e.target.value)}>
                  {STUDENT_STATUSES.map((s) => (
                     <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
               </select>
            </div>
            <div>
               <label className="text-xs font-medium text-foreground mb-1 block">Mode of Study</label>
               <select className={selectCls} value={form.mode_of_study ?? ""} onChange={(e) => update("mode_of_study", e.target.value)}>
                  {STUDY_MODES.map((m) => (
                     <option key={m} value={m}>{m.replace("_", " ")}</option>
                  ))}
               </select>
            </div>
            <div>
               <label className="text-xs font-medium text-foreground mb-1 block">Phone Number</label>
               <input className={inputCls} value={form.phone_number ?? ""} onChange={(e) => update("phone_number", e.target.value)} />
            </div>
         </div>
         <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Contact Address</label>
            <textarea className={inputCls} rows={2} value={form.contact_address ?? ""} onChange={(e) => update("contact_address", e.target.value)} />
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
