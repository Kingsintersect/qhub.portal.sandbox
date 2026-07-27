"use client";

import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
    BookOpen,
    CalendarClock,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Download,
    ExternalLink,
    Filter,
    FolderOpen,
    PlayCircle,
    Search,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    academicSessions,
    courseData,
    semesters,
    tabs,
    type CourseItem,
    type CourseTab,
    type Semester,
} from "@/modules/courses/courseData";

interface CoursesPageResponse {
    items: CourseItem[];
    nextPage: number | null;
    total: number;
    summary: {
        inProgress: number;
        live: number;
        avgProgress: number;
    };
}

const PAGE_SIZE = 4;


async function fetchCoursesPage({
    page,
    session,
    semester,
    tab,
    search,
}: {
    page: number;
    session: string;
    semester: Semester;
    tab: CourseTab;
    search: string;
}): Promise<CoursesPageResponse> {
    await new Promise((resolve) => setTimeout(resolve, 480));

    const base = courseData.filter(
        (course) => course.session === session && course.semester === semester
    );
    const tabScoped = tab === "ALL" ? base : base.filter((course) => course.status === tab);
    const normalizedSearch = search.trim().toLowerCase();
    const scoped = !normalizedSearch
        ? tabScoped
        : tabScoped.filter((course) =>
            `${course.title} ${course.code} ${course.id} ${course.tutor}`
                .toLowerCase()
                .includes(normalizedSearch)
        );

    const start = page * PAGE_SIZE;
    const items = scoped.slice(start, start + PAGE_SIZE);
    const nextPage = start + PAGE_SIZE < scoped.length ? page + 1 : null;
    const avgProgress =
        scoped.length > 0
            ? Math.round(scoped.reduce((sum, course) => sum + course.progress, 0) / scoped.length)
            : 0;

    return {
        items,
        nextPage,
        total: scoped.length,
        summary: {
            inProgress: scoped.filter((course) => course.status === "IN_PROGRESS").length,
            live: scoped.filter((course) => course.status === "LIVE").length,
            avgProgress,
        },
    };
}

function statusPill(status: CourseItem["status"]) {
    if (status === "LIVE") return "bg-red-500/10 text-red-600";
    if (status === "COMPLETED") return "bg-emerald-500/10 text-emerald-600";
    return "bg-blue-500/10 text-blue-600";
}

export default function StudentCoursesPage() {
    const [selectedSession, setSelectedSession] = useState<string>(academicSessions[0]);
    const [selectedSemester, setSelectedSemester] = useState<Semester>(semesters[0]);
    const [activeTab, setActiveTab] = useState<CourseTab>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [materialsCourse, setMaterialsCourse] = useState<CourseItem | null>(null);

    const coursesQuery = useInfiniteQuery({
        queryKey: ["student-courses", selectedSession, selectedSemester, activeTab, searchTerm],
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
            fetchCoursesPage({
                page: pageParam,
                session: selectedSession,
                semester: selectedSemester,
                tab: activeTab,
                search: searchTerm,
            }),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 1000 * 60,
    });

    const loadedCourses = useMemo(
        () => coursesQuery.data?.pages.flatMap((page) => page.items) ?? [],
        [coursesQuery.data]
    );

    const firstPage = coursesQuery.data?.pages[0];
    const stats = firstPage?.summary ?? { inProgress: 0, live: 0, avgProgress: 0 };

    const isInitialLoading = coursesQuery.isPending;
    const isLoadingMore = coursesQuery.isFetchingNextPage;
    const hasNextPage = coursesQuery.hasNextPage;

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/15 via-background to-cyan-500/10 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Learning Hub</p>
                        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">My Courses</h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Continue where you stopped, jump into live classes, and monitor your progress across courses.
                        </p>
                    </div>

                    
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                        <p className="text-xs text-muted-foreground">Active Courses</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">{stats.inProgress}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                        <p className="text-xs text-muted-foreground">Live Classes</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">{stats.live}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                        <p className="text-xs text-muted-foreground">Average Progress</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">{stats.avgProgress}%</p>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Filter size={16} className="text-primary" />
                    <p className="text-sm font-semibold text-foreground">Filter Courses</p>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">Academic Session</p>
                        <Select
                            value={selectedSession}
                            onValueChange={(value) => setSelectedSession(value)}
                        >
                            <SelectTrigger className="w-full justify-between">
                                <SelectValue placeholder="Select session" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicSessions.map((session) => (
                                    <SelectItem key={session} value={session}>
                                        {session}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">Semester</p>
                        <Select
                            value={selectedSemester}
                            onValueChange={(value) => setSelectedSemester(value as Semester)}
                        >
                            <SelectTrigger className="w-full justify-between">
                                <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map((semester) => (
                                    <SelectItem key={semester} value={semester}>
                                        {semester}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="mb-1 text-xs text-muted-foreground">Search Courses</p>
                    <div className="relative">
                        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by course name, code/id, or tutor"
                            className="h-10 w-full rounded-xl border border-input bg-background pr-3 pl-9 text-sm text-foreground outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "border border-border bg-background text-foreground hover:bg-accent/40"
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {isInitialLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
                        <article
                            key={`skeleton-${index}`}
                            className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm"
                        >
                            <Skeleton className="h-4 w-24 bg-white/30" />
                            <Skeleton className="mt-3 h-6 w-2/3 bg-white/30" />
                            <Skeleton className="mt-2 h-4 w-1/3 bg-white/30" />
                            <Skeleton className="mt-5 h-2 w-full bg-white/30" />
                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <Skeleton className="h-20 bg-white/30" />
                                <Skeleton className="h-20 bg-white/30" />
                            </div>
                            <Skeleton className="mt-5 h-10 w-44 bg-white/30" />
                        </article>
                    ))}

                {loadedCourses.map((course) => (
                    <article key={course.id} className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground">{course.code}</p>
                                <h2 className="mt-1 text-lg font-semibold text-foreground">{course.title}</h2>
                                <p className="mt-1 text-xs text-muted-foreground">{course.tutor}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill(course.status)}`}>
                                {course.status.replace("_", " ")}
                            </span>
                        </div>

                        <div className="mt-4">
                            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Next Lesson</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{course.nextLesson}</p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Schedule</p>
                                <p className="mt-1 text-sm font-medium text-foreground">{course.schedule}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <Users size={14} />
                                {course.peers} peers enrolled
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarClock size={14} />
                                Weekly learning track
                            </span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {course.status === "LIVE" ? (
                                <Link
                                    href="/student/timetable"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                >
                                    <PlayCircle size={15} />
                                    Join Live Class
                                </Link>
                            ) : course.status === "COMPLETED" ? (
                                <Link
                                    href="/student/results"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                    <CheckCircle2 size={15} />
                                    Review Outcome
                                </Link>
                            ) : (
                                <Link
                                    href={`/student/courses/${course.id}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                                >
                                    <Clock3 size={15} />
                                    Resume Learning
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={() => setMaterialsCourse(course)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent/40"
                            >
                                <FolderOpen size={15} />
                                View Materials
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            {hasNextPage && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => coursesQuery.fetchNextPage()}
                        disabled={isLoadingMore}
                        className="rounded-xl"
                    >
                        {isLoadingMore ? "Loading more courses..." : "Load More Courses"}
                    </Button>
                </div>
            )}

            {coursesQuery.isError && (
                <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                    Failed to load courses. Please try again.
                </div>
            )}

            {!isInitialLoading && loadedCourses.length === 0 && (
                <div className="rounded-3xl border border-border/70 bg-card p-8 text-center">
                    <p className="text-sm text-muted-foreground">No courses found for this filter yet.</p>
                </div>
            )}

            <Drawer open={!!materialsCourse} onOpenChange={(open) => !open && setMaterialsCourse(null)}>
                <DrawerContent className="mx-auto w-full max-w-6xl">
                    <div className="max-h-[88vh] overflow-y-auto p-6">
                        <DrawerHeader className="px-0 pt-0">
                            <DrawerTitle className="text-xl">
                                {materialsCourse?.code} - {materialsCourse?.title}
                            </DrawerTitle>
                            <DrawerDescription>
                                Course materials for {selectedSession} • {selectedSemester}
                            </DrawerDescription>
                        </DrawerHeader>

                        {materialsCourse && (
                            <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                                {materialsCourse.description}
                            </div>
                        )}

                        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {materialsCourse?.materials.map((material) => (
                                <div key={material.id} className="rounded-2xl border border-border/70 bg-card p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{material.type}</p>
                                    <p className="mt-1 text-sm font-semibold text-foreground">{material.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {material.size}
                                        {material.duration ? ` • ${material.duration}` : ""}
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <Button asChild variant="ghost" className="h-8 px-0 text-primary hover:text-primary">
                                            <Link href={material.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                                                <ExternalLink size={14} />
                                                Open
                                            </Link>
                                        </Button>
                                        {material.downloadable && (
                                            <Button asChild variant="outline" className="h-8">
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

                        {materialsCourse && (
                            <div className="mt-6 rounded-2xl border border-border/70 bg-card p-4">
                                <p className="text-sm font-semibold text-foreground">Course Assessments</p>
                                <div className="mt-3 space-y-2">
                                    {materialsCourse.assessments.map((assessment) => (
                                        <div key={assessment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/60 p-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{assessment.title}</p>
                                                <p className="text-xs text-muted-foreground">{assessment.due}</p>
                                            </div>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={assessment.href} className="inline-flex items-center gap-1.5">
                                                    <ClipboardCheck size={14} />
                                                    Open
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
