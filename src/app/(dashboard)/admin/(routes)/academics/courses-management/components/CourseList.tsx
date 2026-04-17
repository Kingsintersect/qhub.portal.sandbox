"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, type CourseFormValues } from "@/schemas/school.schema";
import {
   useCourses,
   useCreateCourse,
   useUpdateCourse,
} from "@/hooks/useCourseManagement";
import { useLevels, useCurriculumSemesters } from "@/hooks/useCourseStructure";
import type { Course, CourseType } from "@/types/school";
import Combobox from "@/components/custom/Combobox";
import StatusBadge from "@/components/custom/StatusBadge";
import { EmptyState } from "./EmptyState";

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
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import {
   BookOpen,
   Plus,
   Pencil,
   Loader2,
   Filter,
   GraduationCap,
   X,
} from "lucide-react";

// ── course-type badge mapping ───────────────
const courseTypeBadge: Record<CourseType, { label: string; variant: "info" | "purple" | "success" | "orange" }> = {
   GENERAL: { label: "General (GST)", variant: "info" },
   FACULTY: { label: "Faculty", variant: "purple" },
   DEPARTMENTAL: { label: "Departmental", variant: "success" },
   ELECTIVE: { label: "Elective", variant: "orange" },
};

// ── Department options (same as courseManagementApi) ──
const departmentOptions = [
   { value: "dept-1", label: "Computer Science" },
   { value: "dept-2", label: "Mathematics" },
   { value: "dept-3", label: "Mechanical Engineering" },
];

export function CourseList() {
   const [search, setSearch] = useState("");
   const { data, isLoading } = useCourses();
   const createCourse = useCreateCourse();
   const updateCourse = useUpdateCourse();
   const { data: levelsData } = useLevels();

   const [showForm, setShowForm] = useState(false);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [filterLevel, setFilterLevel] = useState<string | null>(null);
   const [filterSemester, setFilterSemester] = useState<string | null>(null);
   const [filterType, setFilterType] = useState<CourseType | null>(null);
   const [formSemesterLevelId, setFormSemesterLevelId] = useState<string | null>(null);

   const courses = useMemo(() => data?.data ?? [], [data]);
   const levels = useMemo(() => levelsData?.data ?? [], [levelsData]);

   // For level filter: get all semesters for selected level
   const { data: filterSemestersData } = useCurriculumSemesters(filterLevel);
   const filterSemesters = useMemo(() => filterSemestersData?.data ?? [], [filterSemestersData]);

   // For the form: get semesters for the selected level in form
   const { data: formSemestersData } = useCurriculumSemesters(formSemesterLevelId);
   const formSemesters = useMemo(() => formSemestersData?.data ?? [], [formSemestersData]);

   // Build semester combobox options for form
   const semesterOptions = useMemo(
      () =>
         formSemesters.map((s) => ({
            value: s.id,
            label: `${s.name}`,
            description: `Sequence ${s.sequence_no}`,
         })),
      [formSemesters],
   );

   // Build level combobox options
   const levelOptions = useMemo(
      () =>
         levels
            .sort((a, b) => a.numeric_value - b.numeric_value)
            .map((l) => ({ value: l.id, label: l.name, description: `Value: ${l.numeric_value}` })),
      [levels],
   );

   // Filtered courses (search + filters)
   const filteredCourses = useMemo(() => {
      let result = courses;
      if (search.trim()) {
         const q = search.trim().toLowerCase();
         result = result.filter(
            (c) =>
               c.code.toLowerCase().includes(q) ||
               c.title.toLowerCase().includes(q)
         );
      }
      if (filterSemester) {
         result = result.filter((c) => c.curriculum_semester_id === filterSemester);
      } else if (filterLevel) {
         // Filter by level name (since courses have denormalized level_name)
         const lvl = levels.find((l) => l.id === filterLevel);
         if (lvl) result = result.filter((c) => c.level_name === lvl.name);
      }
      if (filterType) {
         result = result.filter((c) => c.course_type === filterType);
      }
      return result.sort((a, b) => a.code.localeCompare(b.code));
   }, [courses, search, filterLevel, filterSemester, filterType, levels]);

   const {
      register,
      handleSubmit,
      reset,
      control,
      setValue,
      formState: { errors },
   } = useForm<CourseFormValues>({
      resolver: zodResolver(courseSchema),
      defaultValues: {
         code: "",
         title: "",
         description: "",
         credit_units: 3,
         course_type: "DEPARTMENTAL",
         curriculum_semester_id: "",
         owning_department_id: null,
      },
   });

   const watchCourseType = useWatch({ control, name: "course_type" });

   const onSubmit = async (values: CourseFormValues) => {
      // Clear owning_department_id for GENERAL courses
      const payload = {
         ...values,
         owning_department_id: values.course_type === "GENERAL" ? null : values.owning_department_id,
      };
      if (editingId) {
         await updateCourse.mutateAsync({ id: editingId, payload });
         setEditingId(null);
      } else {
         await createCourse.mutateAsync(payload);
      }
      reset();
      setShowForm(false);
      setFormSemesterLevelId(null);
   };

   const startEdit = (course: Course) => {
      setEditingId(course.id);
      // Find the level for this course's semester
      const lvl = levels.find((l) => l.name === course.level_name);
      if (lvl) setFormSemesterLevelId(lvl.id);
      reset({
         code: course.code,
         title: course.title,
         description: course.description,
         credit_units: course.credit_units,
         course_type: course.course_type,
         curriculum_semester_id: course.curriculum_semester_id,
         owning_department_id: course.owning_department_id,
      });
      setShowForm(true);
   };

   const cancelForm = () => {
      setShowForm(false);
      setEditingId(null);
      setFormSemesterLevelId(null);
      reset({
         code: "",
         title: "",
         description: "",
         credit_units: 3,
         course_type: "DEPARTMENTAL",
         curriculum_semester_id: "",
         owning_department_id: null,
      });
   };

   const clearFilters = () => {
      setFilterLevel(null);
      setFilterSemester(null);
      setFilterType(null);
   };

   const hasFilters = filterLevel || filterSemester || filterType;

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

   const isPending = createCourse.isPending || updateCourse.isPending;


   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-lg font-semibold text-foreground">Course Registry</h2>
               <p className="text-sm text-muted-foreground">
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
                  {hasFilters || search ? " (filtered)" : ""}
               </p>
            </div>
            <Button onClick={() => (showForm ? cancelForm() : setShowForm(true))}>
               <Plus className="size-4" data-icon="inline-start" />
               New Course
            </Button>
         </div>

         {/* Search + Filters */}
         <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
         >
            <Card>
               <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-3">
                     <div className="flex-1">
                        <Input
                           type="text"
                           placeholder="Search by code or title…"
                           value={search}
                           onChange={e => setSearch(e.target.value)}
                           className="w-full h-10 rounded-xl bg-muted border-transparent"
                        />
                     </div>
                     <div className="flex items-center gap-2">
                        <Filter className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Filter Courses</span>
                        {(hasFilters || search) && (
                           <Button variant="ghost" size="sm" onClick={() => { clearFilters(); setSearch(""); }} className="ml-auto h-7 text-xs">
                              <X className="size-3" data-icon="inline-start" />
                              Clear
                           </Button>
                        )}
                     </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                     <Combobox
                        options={levelOptions}
                        value={filterLevel}
                        onChange={(v) => {
                           setFilterLevel(String(v));
                           setFilterSemester(null);
                        }}
                        placeholder="All Levels"
                        searchPlaceholder="Search levels…"
                     />
                     <Combobox
                        options={filterSemesters.map((s) => ({
                           value: s.id,
                           label: s.name,
                           description: `Sequence ${s.sequence_no}`,
                        }))}
                        value={filterSemester}
                        onChange={(v) => setFilterSemester(String(v))}
                        placeholder="All Semesters"
                        disabled={!filterLevel}
                     />
                     <Select
                        value={filterType ?? "ALL"}
                        onValueChange={(v) => setFilterType(v === "ALL" ? null : (v as CourseType))}
                     >
                        <SelectTrigger className="w-full h-10 rounded-xl bg-muted border-transparent">
                           <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="ALL">All Types</SelectItem>
                           <SelectItem value="GENERAL">General (GST)</SelectItem>
                           <SelectItem value="FACULTY">Faculty</SelectItem>
                           <SelectItem value="DEPARTMENTAL">Departmental</SelectItem>
                           <SelectItem value="ELECTIVE">Elective</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </CardContent>
            </Card>
         </motion.div>

         {/* Create / Edit Form */}
         <AnimatePresence>
            {showForm && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-[1000] flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.45)" }}
               >
                  <Card className="w-full max-w-3xl mx-auto">
                     <CardHeader>
                        <CardTitle>{editingId ? "Edit Course" : "Create Course"}</CardTitle>
                        <CardDescription>
                           {editingId
                              ? "Update this course's details below."
                              : "Provide information for the new course."}
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="pb-12">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                           {/* Code */}
                           <div className="space-y-1.5">
                              <Label htmlFor="code">Course Code</Label>
                              <Input
                                 id="code"
                                 placeholder="CSC101"
                                 aria-invalid={!!errors.code}
                                 {...register("code")}
                              />
                              {errors.code && (
                                 <p className="text-sm text-destructive">{errors.code.message}</p>
                              )}
                           </div>

                           {/* Title */}
                           <div className="space-y-1.5 sm:col-span-2">
                              <Label htmlFor="title">Course Title</Label>
                              <Input
                                 id="title"
                                 placeholder="Introduction to Computer Science"
                                 aria-invalid={!!errors.title}
                                 {...register("title")}
                              />
                              {errors.title && (
                                 <p className="text-sm text-destructive">{errors.title.message}</p>
                              )}
                           </div>

                           {/* Credit Units */}
                           <div className="space-y-1.5">
                              <Label htmlFor="credit_units">Credit Units</Label>
                              <Input
                                 id="credit_units"
                                 type="number"
                                 min={1}
                                 max={12}
                                 aria-invalid={!!errors.credit_units}
                                 {...register("credit_units", { valueAsNumber: true })}
                              />
                              {errors.credit_units && (
                                 <p className="text-sm text-destructive">{errors.credit_units.message}</p>
                              )}
                           </div>

                           {/* Course Type */}
                           <div className="space-y-1.5">
                              <Label>Course Type</Label>
                              <Controller
                                 control={control}
                                 name="course_type"
                                 render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                       <SelectTrigger className="w-full h-10 rounded-xl bg-muted border-transparent">
                                          <SelectValue placeholder="Select type" />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectItem value="GENERAL">General (GST)</SelectItem>
                                          <SelectItem value="FACULTY">Faculty</SelectItem>
                                          <SelectItem value="DEPARTMENTAL">Departmental</SelectItem>
                                          <SelectItem value="ELECTIVE">Elective</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 )}
                              />
                              {errors.course_type && (
                                 <p className="text-sm text-destructive">{errors.course_type.message}</p>
                              )}
                           </div>

                           {/* Owning Department (hidden for GENERAL) */}
                           {watchCourseType !== "GENERAL" && (
                              <div className="space-y-1.5">
                                 <Label>Owning Department</Label>
                                 <Controller
                                    control={control}
                                    name="owning_department_id"
                                    render={({ field }) => (
                                       <Combobox
                                          options={departmentOptions}
                                          value={field.value ?? null}
                                          onChange={(v) => field.onChange(String(v))}
                                          placeholder="Select department"
                                          searchPlaceholder="Search departments…"
                                       />
                                    )}
                                 />
                              </div>
                           )}

                           {/* Level (for semester selection) */}
                           <div className="space-y-1.5">
                              <Label>Level</Label>
                              <Combobox
                                 options={levelOptions}
                                 value={formSemesterLevelId}
                                 onChange={(v) => {
                                    setFormSemesterLevelId(String(v));
                                    setValue("curriculum_semester_id", "");
                                 }}
                                 placeholder="Select level"
                                 searchPlaceholder="Search levels…"
                              />
                           </div>

                           {/* Semester */}
                           <div className="space-y-1.5">
                              <Label>Semester</Label>
                              <Controller
                                 control={control}
                                 name="curriculum_semester_id"
                                 render={({ field }) => (
                                    <Combobox
                                       options={semesterOptions}
                                       value={field.value || null}
                                       onChange={(v) => field.onChange(String(v))}
                                       placeholder="Select semester"
                                       disabled={!formSemesterLevelId}
                                    />
                                 )}
                              />
                              {errors.curriculum_semester_id && (
                                 <p className="text-sm text-destructive">{errors.curriculum_semester_id.message}</p>
                              )}
                           </div>

                           {/* Description */}
                           <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                              <Label htmlFor="description">Description (optional)</Label>
                              <Input
                                 id="description"
                                 placeholder="Brief description of the course"
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
                              {editingId ? "Save Changes" : "Create Course"}
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Course List */}
         {!filteredCourses.length ? (
            <EmptyState
               icon={BookOpen}
               title={hasFilters ? "No matching courses" : "No courses yet"}
               description={
                  hasFilters
                     ? "Try adjusting your filters to find more courses."
                     : "Create your first course to start building the curriculum."
               }
               action={
                  hasFilters ? (
                     <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                     </Button>
                  ) : (
                     <Button onClick={() => setShowForm(true)}>
                        <Plus className="size-4" data-icon="inline-start" />
                        Create First Course
                     </Button>
                  )
               }
            />
         ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
               {filteredCourses.map((course, index) => (
                  <motion.div
                     key={course.id}
                     initial={{ opacity: 0, y: 16 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                     <Card className="relative">
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2">
                              <GraduationCap className="size-4 text-primary" />
                              <span className="font-mono text-sm">{course.code}</span>
                           </CardTitle>
                           <CardDescription className="line-clamp-2">
                              {course.title}
                           </CardDescription>
                           <CardAction>
                              <StatusBadge
                                 label={courseTypeBadge[course.course_type].label}
                                 variant={courseTypeBadge[course.course_type].variant}
                                 dot
                              />
                           </CardAction>
                        </CardHeader>
                        <CardContent>
                           <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                              <p>
                                 <span className="font-medium text-foreground">{course.credit_units}</span>
                                 {" credit unit"}{course.credit_units !== 1 ? "s" : ""}
                              </p>
                              <p>
                                 {course.level_name} — {course.semester_name}
                              </p>
                              {course.department_name && (
                                 <p>Dept: {course.department_name}</p>
                              )}
                           </div>
                           <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => startEdit(course)}
                           >
                              <Pencil className="size-3.5" data-icon="inline-start" />
                              Edit
                           </Button>
                        </CardContent>
                     </Card>
                  </motion.div>
               ))}
            </div>
         )}
      </div>
   );
}
