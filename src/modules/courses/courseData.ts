export type CourseTab = "ALL" | "IN_PROGRESS" | "LIVE" | "COMPLETED";
export type Semester = "First Semester" | "Second Semester";

export interface CourseMaterial {
    id: string;
    title: string;
    type: "Slides" | "Video" | "PDF" | "Quiz";
    size: string;
    duration?: string;
    href: string;
    downloadable?: boolean;
}

export interface CourseAssessment {
    id: string;
    title: string;
    due: string;
    href: string;
}

export interface CourseItem {
    id: string;
    code: string;
    title: string;
    tutor: string;
    status: Exclude<CourseTab, "ALL">;
    session: string;
    semester: Semester;
    progress: number;
    nextLesson: string;
    schedule: string;
    peers: number;
    description: string;
    videoLink: string;
    materials: CourseMaterial[];
    assessments: CourseAssessment[];
}

export const academicSessions = ["2025/2026", "2024/2025"];
export const semesters: Semester[] = ["First Semester", "Second Semester"];

export const tabs: { key: CourseTab; label: string }[] = [
    { key: "ALL", label: "All Courses" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "LIVE", label: "Live Classes" },
    { key: "COMPLETED", label: "Completed" },
];

export const courseData: CourseItem[] = [
    {
        id: "csc401",
        code: "CSC 401",
        title: "Software Engineering",
        tutor: "Dr. Aisha Bello",
        status: "IN_PROGRESS",
        session: "2025/2026",
        semester: "First Semester",
        progress: 76,
        nextLesson: "Testing Strategies and QA",
        schedule: "Tomorrow • 10:30 AM",
        peers: 82,
        description:
            "Design principles, software lifecycle models, quality assurance, and collaborative engineering workflows.",
        videoLink: "https://www.youtube.com/watch?v=qeK4NfM2qN4",
        materials: [
            {
                id: "csc401-m1",
                title: "Week 8 Testing Slides",
                type: "Slides",
                size: "3.2 MB",
                href: "https://example.com/materials/csc401/week-8-testing-slides.pptx",
                downloadable: true,
            },
            {
                id: "csc401-m2",
                title: "Integration Testing Walkthrough",
                type: "Video",
                size: "N/A",
                duration: "18 min",
                href: "https://www.youtube.com/watch?v=ILkT_HV9DVU",
            },
            {
                id: "csc401-m3",
                title: "Quality Assurance Checklist",
                type: "PDF",
                size: "1.1 MB",
                href: "https://example.com/materials/csc401/qa-checklist.pdf",
                downloadable: true,
            },
        ],
        assessments: [
            {
                id: "csc401-a1",
                title: "Unit Test Coverage Assignment",
                due: "Due Friday, 11:59 PM",
                href: "/student/assessments/my-assessments",
            },
        ],
    },
    {
        id: "csc405",
        code: "CSC 405",
        title: "Algorithms and Complexity",
        tutor: "Prof. Kemi Adetola",
        status: "LIVE",
        session: "2025/2026",
        semester: "First Semester",
        progress: 63,
        nextLesson: "Greedy Methods Masterclass",
        schedule: "Live now • Room B2",
        peers: 109,
        description:
            "Algorithm paradigms, complexity analysis, optimization strategies, and exam-grade problem solving.",
        videoLink: "https://www.youtube.com/watch?v=8hly31xKli0",
        materials: [
            {
                id: "csc405-m1",
                title: "Greedy vs Dynamic Programming",
                type: "Slides",
                size: "4.4 MB",
                href: "https://example.com/materials/csc405/greedy-vs-dp.pptx",
                downloadable: true,
            },
            {
                id: "csc405-m2",
                title: "Complexity Cheatsheet",
                type: "PDF",
                size: "890 KB",
                href: "https://example.com/materials/csc405/complexity-cheatsheet.pdf",
                downloadable: true,
            },
            {
                id: "csc405-m3",
                title: "Timed Complexity Quiz",
                type: "Quiz",
                size: "N/A",
                href: "/student/assessments/my-assessments",
            },
        ],
        assessments: [
            {
                id: "csc405-a1",
                title: "Greedy Algorithms Timed Quiz",
                due: "Due Wednesday, 6:00 PM",
                href: "/student/assessments/my-assessments",
            },
        ],
    },
    {
        id: "mth401",
        code: "MTH 401",
        title: "Numerical Analysis",
        tutor: "Dr. Musa Iliyasu",
        status: "IN_PROGRESS",
        session: "2025/2026",
        semester: "First Semester",
        progress: 54,
        nextLesson: "Root-Finding Methods",
        schedule: "Thu • 1:00 PM",
        peers: 67,
        description:
            "Numerical methods for interpolation, differential equations, convergence analysis, and computational accuracy.",
        videoLink: "https://www.youtube.com/watch?v=9wWJ4Mwd8fg",
        materials: [
            {
                id: "mth401-m1",
                title: "Newton-Raphson Notes",
                type: "PDF",
                size: "1.4 MB",
                href: "https://example.com/materials/mth401/newton-raphson-notes.pdf",
                downloadable: true,
            },
            {
                id: "mth401-m2",
                title: "Iteration Methods Demo",
                type: "Video",
                size: "N/A",
                duration: "24 min",
                href: "https://www.youtube.com/watch?v=JQhU1yY4n7k",
            },
        ],
        assessments: [
            {
                id: "mth401-a1",
                title: "Root Finding Practical",
                due: "Due Monday, 9:00 AM",
                href: "/student/assessments/my-assessments",
            },
        ],
    },
    {
        id: "gst302",
        code: "GST 302",
        title: "Entrepreneurship Studies",
        tutor: "Mr. Tunde Ajiboye",
        status: "COMPLETED",
        session: "2024/2025",
        semester: "Second Semester",
        progress: 100,
        nextLesson: "Final Reflection Submitted",
        schedule: "Completed this semester",
        peers: 141,
        description:
            "Innovation strategy, startup modeling, market validation, and entrepreneurial decision frameworks.",
        videoLink: "https://www.youtube.com/watch?v=Y4JfPlry-iQ",
        materials: [
            {
                id: "gst302-m1",
                title: "Startup Canvas Toolkit",
                type: "Slides",
                size: "2.6 MB",
                href: "https://example.com/materials/gst302/startup-canvas-toolkit.pptx",
                downloadable: true,
            },
            {
                id: "gst302-m2",
                title: "Case Study Archive",
                type: "PDF",
                size: "5.8 MB",
                href: "https://example.com/materials/gst302/case-study-archive.pdf",
                downloadable: true,
            },
        ],
        assessments: [
            {
                id: "gst302-a1",
                title: "Business Plan Final",
                due: "Submitted",
                href: "/student/results",
            },
        ],
    },
    {
        id: "csc407",
        code: "CSC 407",
        title: "Operating Systems",
        tutor: "Dr. Grace Nwokedi",
        status: "LIVE",
        session: "2025/2026",
        semester: "Second Semester",
        progress: 71,
        nextLesson: "Process Scheduling Lab",
        schedule: "Today • 3:00 PM",
        peers: 93,
        description:
            "Process management, memory systems, concurrency controls, and real-world operating system behavior.",
        videoLink: "https://www.youtube.com/watch?v=vBURTt97EkA",
        materials: [
            {
                id: "csc407-m1",
                title: "CPU Scheduling Deck",
                type: "Slides",
                size: "3.8 MB",
                href: "https://example.com/materials/csc407/cpu-scheduling-deck.pptx",
                downloadable: true,
            },
            {
                id: "csc407-m2",
                title: "Concurrency Lab Guide",
                type: "PDF",
                size: "1.9 MB",
                href: "https://example.com/materials/csc407/concurrency-lab-guide.pdf",
                downloadable: true,
            },
        ],
        assessments: [
            {
                id: "csc407-a1",
                title: "Threads and Scheduling Quiz",
                due: "Due Thursday, 5:00 PM",
                href: "/student/assessments/my-assessments",
            },
        ],
    },
    {
        id: "csc403",
        code: "CSC 403",
        title: "Computer Networks",
        tutor: "Dr. Chukwudi Eze",
        status: "IN_PROGRESS",
        session: "2025/2026",
        semester: "Second Semester",
        progress: 82,
        nextLesson: "Transport Layer Protocols",
        schedule: "Fri • 9:00 AM",
        peers: 88,
        description:
            "Network models, routing, transport protocols, packet analysis, and practical communication systems.",
        videoLink: "https://www.youtube.com/watch?v=qiQR5rTSshw",
        materials: [
            {
                id: "csc403-m1",
                title: "TCP and UDP Comparison",
                type: "Slides",
                size: "2.1 MB",
                href: "https://example.com/materials/csc403/tcp-udp-comparison.pptx",
                downloadable: true,
            },
            {
                id: "csc403-m2",
                title: "Transport Layer Drills",
                type: "Quiz",
                size: "N/A",
                href: "/student/assessments/my-assessments",
            },
            {
                id: "csc403-m3",
                title: "Wireshark Session Recording",
                type: "Video",
                size: "N/A",
                duration: "29 min",
                href: "https://www.youtube.com/watch?v=TkCSr30UojM",
            },
        ],
        assessments: [
            {
                id: "csc403-a1",
                title: "Transport Layer Protocol Assignment",
                due: "Due Sunday, 8:00 PM",
                href: "/student/assessments/my-assessments",
            },
        ],
    },
];

export function getCourseById(courseId: string): CourseItem | undefined {
    return courseData.find((course) => course.id === courseId);
}
