"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    BookOpen,
    CalendarClock,
    ClipboardCheck,
    Download,
    ExternalLink,
    PlayCircle,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourseById } from "@/modules/courses/courseData";

export default function StudentCourseDetailPage() {
    const params = useParams<{ courseId?: string | string[] }>();
    const rawCourseId = params?.courseId;
    const courseId = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId;
    const course = courseId ? getCourseById(courseId) : undefined;

    if (!course) {
        return (
            <div className="space-y-6">
                <section className="rounded-3xl border border-border/70 bg-card p-6">
                    <h1 className="text-2xl font-bold text-foreground">Course not found</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        The requested course does not exist yet or is not available for your current profile.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/student/courses" className="inline-flex items-center gap-2">
                            <ArrowLeft size={16} />
                            Back to Courses
                        </Link>
                    </Button>
                </section>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-primary/20 bg-linear-to-br from-primary/15 via-background to-cyan-500/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Course Workspace</p>
                        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{course.code} - {course.title}</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {course.description}
                        </p>
                    </div>

                    <Link
                        href="/student/courses"
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/40"
                    >
                        <ArrowLeft size={16} />
                        Back to Courses
                    </Link>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
                        <p className="text-[11px] text-muted-foreground">Tutor</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{course.tutor}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
                        <p className="text-[11px] text-muted-foreground">Session</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{course.session}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
                        <p className="text-[11px] text-muted-foreground">Semester</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{course.semester}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
                        <p className="text-[11px] text-muted-foreground">Progress</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{course.progress}%</p>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <article className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <BookOpen size={18} />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-foreground">Learning Content</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Next lesson: {course.nextLesson}
                    </p>

                    <div className="mt-4 space-y-2">
                        {course.materials.map((material) => (
                            <div key={material.id} className="rounded-xl border border-border/70 bg-background/60 p-3">
                                <p className="text-sm font-medium text-foreground">{material.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {material.type} • {material.size}
                                    {material.duration ? ` • ${material.duration}` : ""}
                                </p>
                                <div className="mt-2 flex gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={material.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                                            <ExternalLink size={14} />
                                            Open
                                        </Link>
                                    </Button>
                                    {material.downloadable && (
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={material.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                                                <Download size={14} />
                                                Download
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CalendarClock size={18} />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-foreground">Schedule and Assessments</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {course.schedule}
                    </p>

                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p className="inline-flex items-center gap-1.5"><Users size={14} /> {course.peers} peers enrolled</p>
                    </div>

                    <div className="mt-4 rounded-xl border border-border/70 bg-background/60 p-3">
                        <p className="text-sm font-medium text-foreground">Course video starter</p>
                        <Button asChild variant="outline" size="sm" className="mt-2">
                            <Link href={course.videoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                                <PlayCircle size={14} />
                                Watch video
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                        {course.assessments.map((assessment) => (
                            <div key={assessment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/60 p-3">
                                <div>
                                    <p className="text-sm font-medium text-foreground">{assessment.title}</p>
                                    <p className="text-xs text-muted-foreground">{assessment.due}</p>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={assessment.href} className="inline-flex items-center gap-1.5">
                                        <ClipboardCheck size={14} />
                                        Open Assessment
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
}
