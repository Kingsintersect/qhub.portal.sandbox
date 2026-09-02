"use client"

import { useState } from "react"

import { Overview, useNotice } from "@/modules/portal/components/Overview"
import { Announcements } from "@/modules/portal/components/Announcements"
import { CourseCatalogue } from "@/modules/portal/components/CourseCatalogue"
import { NewTicket } from "@/modules/portal/components/NewTicket"
import { Support } from "@/modules/portal/components/Support"
import { Settings } from "@/modules/portal/components/Settings"
import { Billing } from "@/modules/portal/components/Billing"
import { Messages } from "@/modules/portal/components/Messages"
import { Grading } from "@/modules/portal/components/Grading"
import { AssessmentBuilder } from "@/modules/portal/components/AssessmentBuilder"
import { Assessments } from "@/modules/portal/components/Assessments"
import { OcrQuestions } from "@/modules/portal/components/OcrQuestions"
import { Discussions } from "@/modules/portal/components/Discussions"
import { StartDiscussion } from "@/modules/portal/components/StartDiscussion"
import { CreateLesson } from "@/modules/portal/components/CreateLesson"
import { LessonContent } from "@/modules/portal/components/LessonContent"
import { LiveClasses } from "@/modules/portal/components/LiveClasses"
import { ScheduleLiveClass } from "@/modules/portal/components/ScheduleLiveClass"
import { MediaLibrary } from "@/modules/portal/components/MediaLibrary"
import { UploadMedia } from "@/modules/portal/components/UploadMedia"
import { InviteLecturer } from "@/modules/portal/components/InviteLecturer"
import { PortalShell } from "@/modules/portal/components/PortalShell"
import { StudentRoll } from "@/modules/portal/components/StudentRoll"
import { TeachingStaff } from "@/modules/portal/components/TeachingStaff"
import {
  COURSES,
  LECTURERS,
  ASSESSMENTS,
  DISCUSSIONS,
  GRADEBOOK,
  LESSONS,
  PENDING_GRADES,
  LEVELS,
  LIVE_CLASSES,
  MEDIA,
  MESSAGE_THREADS,
  MY_CODES,
  OUR_ANNOUNCEMENTS,
  PLATFORM_ANNOUNCEMENTS,
  TICKETS,
  STUDENTS,
  type Lecturer,
  type Announcement,
  type MediaItem,
  type Assessment,
  type BuilderQuestion,
  type Discussion,
  type PendingGrade,
  type Lesson,
  type LiveClass,
  type Ticket,
} from "@/modules/portal/seed"
import type { PortalRole, PortalView } from "@/modules/portal/types"

/**
 * The institution portal, from the bundle 25 canvas.
 *
 * Two roles share one shell. The canvas decides the role from a demo sign-in
 * whose password is not checked; production has real authentication, so the
 * role here comes from a query parameter until this is wired to the session —
 * `?role=lect` for the lecturer. Lifting the canvas's own login would have put
 * a sign-in form that authenticates nobody in front of a real institution.
 */

const NOTICE =
  "Scheduled maintenance Sunday 02:00–04:00 WAT — the portal pauses for up to two hours; nothing is lost."

const BELL = [
  {
    text: "Qverse delivered new media to CSC 201 — visible to Year 2 now",
    when: "Today 09:12",
  },
  {
    text: "Platform maintenance window announced for Sunday 02:00 WAT",
    when: "Aug 28",
  },
  { text: "Ticket TKT-5102 — Qverse support replied", when: "Yesterday 16:05" },
]

export default function PortalPage() {
  const [role, setRole] = useState<PortalRole>("admin")
  const [view, setView] = useState<PortalView>("overview")
  const { notice, dismiss } = useNotice(NOTICE)
  const [inviting, setInviting] = useState(false)
  // Lecturers invited in this session sit above the seeded staff, as the
  // canvas concatenates lcMade ahead of its seed.
  const [invited, setInvited] = useState<Lecturer[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState<MediaItem[]>([])
  const [sent, setSent] = useState<Announcement[]>([])
  const [raising, setRaising] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS)
  const [scheduling, setScheduling] = useState(false)
  const [classes, setClasses] = useState<LiveClass[]>(LIVE_CLASSES)
  const [creating, setCreating] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS)
  const [starting, setStarting] = useState(false)
  const [discussions, setDiscussions] = useState<Discussion[]>(DISCUSSIONS)
  const [assessments, setAssessments] = useState<Assessment[]>(ASSESSMENTS)
  const [building, setBuilding] = useState(false)
  const [ocrOpen, setOcrOpen] = useState(false)
  // Questions handed from an OCR pass into the builder it opens.
  const [fromOcr, setFromOcr] = useState<BuilderQuestion[]>([])
  const [pending, setPending] = useState<PendingGrade[]>(PENDING_GRADES)
  const [bell, setBell] = useState(BELL)

  const admin = role === "admin"

  return (
    <PortalShell
      role={role}
      view={view}
      onNavigate={setView}
      identity={{
        school: "University of Lagos",
        host: "unilag.qhub.io",
        schoolInitials: "UL",
        name: admin ? "R. Osei" : "Dr. F. Adeyemi",
      }}
      notices={bell}
      badges={{
        support: tickets.filter((t) => t.status === "OPEN").length,
        ...(admin ? {} : { msgs: 2 }),
      }}
      onSignOut={() => setRole(admin ? "lect" : "admin")}
    >
      {view === "overview" && (
        <Overview
          notice={notice}
          onDismissNotice={dismiss}
          stats={
            admin
              ? [
                  {
                    label: "Students on the roll",
                    value: "184,206",
                    delta: "+1,240 this session",
                    deltaTone: "accent",
                  },
                  {
                    label: "Active this week",
                    value: "121,884",
                    delta: "66% of roll",
                  },
                  {
                    label: "Teaching staff",
                    value: "3,414",
                    delta: "invites pending",
                  },
                  {
                    label: "Media storage",
                    value: "9.3 GB",
                    delta: "of 15 GB · 62%",
                    tone: "warn",
                  },
                ]
              : [
                  {
                    label: "My courses",
                    value: "2",
                    delta: "CSC 201 · CSC 305",
                  },
                  {
                    label: "My students",
                    value: "2,140",
                    delta: "across both",
                  },
                  { label: "My media", value: "6", delta: "in the library" },
                  {
                    label: "Engagement",
                    value: "72%",
                    delta: "active this month",
                    deltaTone: "accent",
                  },
                ]
          }
          chartTitle={admin ? "Institution activity" : "My courses — activity"}
          chartSeed={admin ? [41, 63] : [77, 88]}
          sideTitle={admin ? "This session" : "My teaching"}
          sideRows={
            admin
              ? [
                  {
                    k: "Academic session",
                    v: "2026/2027 · 1st semester",
                  },
                  { k: "Registration closes", v: "Friday", tone: "warn" },
                  { k: "Courses in catalogue", v: "4,182" },
                  {
                    k: "Open support tickets",
                    v: String(
                      tickets.filter((t) => t.status === "OPEN").length
                    ),
                    tone: "accent",
                  },
                  { k: "Platform health", v: "Degraded — video", tone: "warn" },
                ]
              : [
                  { k: "CSC 201 · engagement", v: "78%", tone: "accent" },
                  { k: "CSC 305 · engagement", v: "64%" },
                  { k: "Media awaiting transcode", v: "0" },
                  { k: "Next teaching week", v: "Week 7" },
                ]
          }
          quickActions={
            admin
              ? [
                  {
                    label: "Invite a lecturer",
                    onClick: () => setView("lect"),
                  },
                  {
                    label: "Upload media",
                    onClick: () => {
                      setView("media")
                      setUploading(true)
                    },
                  },
                  {
                    label: "Raise a support ticket",
                    onClick: () => {
                      setView("support")
                      setRaising(true)
                    },
                  },
                ]
              : [
                  {
                    label: "Upload media to my course",
                    onClick: () => {
                      setView("media")
                      setUploading(true)
                    },
                  },
                  {
                    label: "Announce to my students",
                    onClick: () => setView("announce"),
                  },
                  {
                    label: "Raise a support ticket",
                    onClick: () => {
                      setView("support")
                      setRaising(true)
                    },
                  },
                ]
          }
          engagement={
            admin
              ? [
                  {
                    title: "Live class attendance",
                    sub: "214 classes this week · fleet-wide",
                    rows: [
                      { k: "Faculty of Engineering", v: "76%", pct: 76 },
                      { k: "Faculty of Physical Sciences", v: "71%", pct: 71 },
                      { k: "Faculty of Arts", v: "63%", pct: 63 },
                    ],
                  },
                  {
                    title: "Discussion involvement",
                    sub: "1,428 open discussions",
                    rows: [
                      { k: "Graded discussions", v: "58%", pct: 58 },
                      { k: "Ungraded discussions", v: "41%", pct: 41 },
                      { k: "Posts this week", v: "88.4k", pct: 100 },
                    ],
                  },
                  {
                    title: "Assessments in flight",
                    sub: "96 scheduled · 12 grading",
                    rows: [
                      { k: "Quizzes this week", v: "71", pct: 74 },
                      { k: "Exams scheduled", v: "25", pct: 26 },
                      { k: "Awaiting manual grading", v: "312", pct: 12 },
                    ],
                  },
                ]
              : [
                  {
                    title: "Live class attendance",
                    sub: "Your last three classes",
                    rows: [
                      { k: "Recursion clinic", v: "84%", pct: 84 },
                      { k: "Week 5 review", v: "71%", pct: 71 },
                      { k: "Sorting walkthrough", v: "66%", pct: 66 },
                    ],
                  },
                  {
                    title: "Discussion involvement",
                    sub: "Participants who posted",
                    rows: [
                      { k: "Quicksort vs mergesort", v: "62%", pct: 62 },
                      { k: "When does AVL beat a hash?", v: "44%", pct: 44 },
                      { k: "Week 6 reading questions", v: "37%", pct: 37 },
                    ],
                  },
                  {
                    title: "Grading queue",
                    sub: "3 submissions await manual grading",
                    rows: [
                      {
                        k: "Week 4 quiz — short answers",
                        v: "3",
                        pct: 90,
                      },
                      { k: "Mid-semester exam", v: "draft", pct: 0 },
                      { k: "Auto-graded this week", v: "1,104", pct: 100 },
                    ],
                  },
                ]
          }
        />
      )}

      {view === "students" && (
        <StudentRoll
          // A lecturer's roll is their own students, not the institution's.
          students={
            admin
              ? STUDENTS
              : STUDENTS.filter((s) => s.prog === "Computer Science")
          }
          title={admin ? "Student roll" : "My students"}
          sub={
            admin
              ? "The register of record — status is derived from enrolment, never set by hand"
              : "Students enrolled in CSC 201 and CSC 305"
          }
        />
      )}

      {view === "billing" && admin && <Billing />}

      {view === "settings" && admin && (
        // Postgraduate is a level for targeting but not a year of study, so
        // it sits after the years rather than among them.
        <Settings levels={[...LEVELS, "Postgraduate"]} />
      )}

      {view === "msgs" && !admin && (
        <Messages
          threads={MESSAGE_THREADS}
          onReply={(student) =>
            setBell((n) => [
              {
                text: `Reply sent to ${student} — they see it in the student app`,
                when: "Just now",
              },
              ...n,
            ])
          }
        />
      )}

      {view === "grades" && !admin && (
        <Grading
          pending={pending}
          gradebook={GRADEBOOK}
          onAccept={(g) => {
            setPending((all) => all.filter((x) => x.id !== g.id))
            setBell((n) => [
              {
                text: `${g.student} — ${g.assess} graded ${g.suggested}/${g.max} · written to the gradebook`,
                when: "Just now",
              },
              ...n,
            ])
          }}
        />
      )}

      {view === "assess" && !admin && (
        <Assessments
          assessments={assessments}
          onOcr={() => setOcrOpen(true)}
          onNew={() => {
            setFromOcr([])
            setBuilding(true)
          }}
        />
      )}

      {ocrOpen && (
        <OcrQuestions
          onClose={() => setOcrOpen(false)}
          onAccept={(questions, text) => {
            setFromOcr(questions)
            setOcrOpen(false)
            setBuilding(true)
            setBell((n) => [{ text, when: "Just now" }, ...n])
          }}
        />
      )}

      {building && (
        <AssessmentBuilder
          courses={MY_CODES}
          initialQuestions={fromOcr}
          onClose={() => setBuilding(false)}
          onSave={(a, text) => {
            setAssessments((all) => [a, ...all])
            setBell((n) => [{ text, when: "Just now" }, ...n])
            setBuilding(false)
            setFromOcr([])
          }}
        />
      )}

      {view === "disc" && !admin && (
        <Discussions
          discussions={discussions}
          onStart={() => setStarting(true)}
          onPublish={(title, course, scored) =>
            setBell((n) => [
              {
                text: `Discussion scores published — “${title}” · ${scored} students · written to the ${course} gradebook`,
                when: "Just now",
              },
              ...n,
            ])
          }
        />
      )}

      {starting && (
        <StartDiscussion
          courses={MY_CODES}
          onClose={() => setStarting(false)}
          onStart={(d, text) => {
            setDiscussions((all) => [d, ...all])
            setBell((n) => [{ text, when: "Just now" }, ...n])
            setStarting(false)
          }}
        />
      )}

      {view === "lessons" && !admin && (
        <LessonContent
          lessons={lessons}
          courses={MY_CODES}
          onCreate={() => setCreating(true)}
        />
      )}

      {creating && (
        <CreateLesson
          courses={MY_CODES}
          onClose={() => setCreating(false)}
          onPublish={(lesson, text) => {
            setLessons((all) => [lesson, ...all])
            setBell((n) => [{ text, when: "Just now" }, ...n])
            setCreating(false)
          }}
        />
      )}

      {view === "live" && !admin && (
        <LiveClasses classes={classes} onSchedule={() => setScheduling(true)} />
      )}

      {scheduling && (
        <ScheduleLiveClass
          courses={MY_CODES}
          host="Dr. F. Adeyemi"
          onClose={() => setScheduling(false)}
          onSchedule={(c) => {
            setClasses((all) => [
              { ...c, status: "SCHEDULED", att: null, present: "" },
              ...all,
            ])
            setBell((n) => [
              {
                text: `Live class scheduled — ${c.course} · ${c.when} WAT · Zoom meeting created; the join link is on the course's Moodle page`,
                when: "Just now",
              },
              ...n,
            ])
            setScheduling(false)
          }}
        />
      )}

      {view === "support" && (
        <Support
          tickets={tickets}
          onNew={() => setRaising(true)}
          onReply={(ref, text) =>
            setTickets((all) =>
              all.map((t) =>
                t.ref === ref
                  ? {
                      ...t,
                      thread: [
                        ...t.thread,
                        {
                          who: `${admin ? "R. Osei" : "Dr. F. Adeyemi"} (you)`,
                          when: "Just now",
                          text,
                        },
                      ],
                    }
                  : t
              )
            )
          }
        />
      )}

      {raising && (
        <NewTicket
          onClose={() => setRaising(false)}
          onRaise={({ subject, pri, body }) => {
            // The canvas derives the reference from how many have been
            // raised this session, so it stays stable per ticket.
            const ref = `TKT-${5200 + (((tickets.length - TICKETS.length) * 7) % 90)}`
            setTickets((all) => [
              {
                ref,
                pri,
                subject,
                status: "OPEN",
                thread: [
                  {
                    who: `${admin ? "R. Osei" : "Dr. F. Adeyemi"} (you)`,
                    when: "Just now",
                    text: body,
                  },
                ],
              },
              ...all,
            ])
            setBell((n) => [
              {
                text: `Ticket ${ref} raised — ${pri} · the platform team has it and the SLA clock is running`,
                when: "Just now",
              },
              ...n,
            ])
            setRaising(false)
          }}
        />
      )}

      {view === "announce" && (
        <Announcements
          // A lecturer sees the platform notices and a shorter tail of what
          // has gone out; an admin sees the institution's whole record.
          items={(() => {
            const all = [
              ...PLATFORM_ANNOUNCEMENTS,
              ...sent,
              ...OUR_ANNOUNCEMENTS,
            ]
            return admin ? all : all.slice(0, 4)
          })()}
          sub={
            admin
              ? "Platform notices first, then yours — students see only what you send"
              : "Platform notices and what has gone to your students"
          }
          composeSub={
            admin
              ? "To students, by level — delivered in-app; no student email leaves the platform"
              : "Only your own students — CSC 201 and CSC 305 cohorts"
          }
          audiences={admin ? LEVELS : MY_CODES}
          onSend={({ title, body, audience }) => {
            const aud = audience.join(", ")
            setSent((v) => [
              {
                kind: "GENERAL",
                title,
                when: "Just now",
                body,
                meta: `Sent by ${admin ? "R. Osei" : "Dr. F. Adeyemi"} · ${aud} · delivering`,
              },
              ...v,
            ])
            setBell((n) => [
              { text: `Announcement sent to ${aud}`, when: "Just now" },
              ...n,
            ])
          }}
        />
      )}

      {view === "media" && (
        <MediaLibrary
          items={[...uploaded, ...MEDIA].filter(
            (m) => admin || MY_CODES.includes(m.course)
          )}
          title={admin ? "Media library" : "My media"}
          sub={
            admin
              ? "Everything delivered to your students — by the platform on your behalf, or uploaded here"
              : "Media for CSC 201 and CSC 305 — uploads are credited to you"
          }
          onUpload={() => setUploading(true)}
        />
      )}

      {uploading && (
        <UploadMedia
          courses={
            admin ? COURSES : COURSES.filter((c) => MY_CODES.includes(c.code))
          }
          isAdmin={admin}
          onClose={() => setUploading(false)}
          onUploaded={(item, text) => {
            setUploaded((v) => [item, ...v])
            setBell((n) => [{ text, when: "Just now" }, ...n])
          }}
        />
      )}

      {view === "courses" && (
        <CourseCatalogue
          courses={
            admin ? COURSES : COURSES.filter((c) => MY_CODES.includes(c.code))
          }
          title={admin ? "Course catalogue" : "My courses"}
          sub={
            admin
              ? `${COURSES.length} shown of 4,182 · the catalogue is fed by SIS sync and bulk import`
              : "The courses assigned to you this session"
          }
          footer={
            admin
              ? "Courses are never typed in by hand — rows arrive validated from the SIS or a bulk import, and media/announcement targeting validates against this list."
              : "Course assignment is managed by your registry — raise it with them if a course is missing."
          }
          isAdmin={admin}
          myCodes={admin ? [] : MY_CODES}
          onImport={() =>
            setBell((n) => [
              {
                text: "Course import queued — validation report lands in notifications when it finishes",
                when: "Just now",
              },
              ...n,
            ])
          }
          actionsFor={() => [
            {
              label: "Create lesson",
              run: () => {
                setView("lessons")
                setCreating(true)
              },
            },
            {
              label: "Schedule live class",
              run: () => {
                setView("live")
                setScheduling(true)
              },
            },
            {
              label: "New quiz or exam",
              run: () => {
                setView("assess")
                setFromOcr([])
                setBuilding(true)
              },
            },
            {
              label: "Start discussion",
              run: () => {
                setView("disc")
                setStarting(true)
              },
            },
            { label: "Open gradebook", run: () => setView("grades") },
          ]}
        />
      )}

      {view === "lect" && admin && (
        <TeachingStaff
          lecturers={[...invited, ...LECTURERS]}
          onInvite={() => setInviting(true)}
        />
      )}

      {inviting && (
        <InviteLecturer
          onClose={() => setInviting(false)}
          onInvited={(lecturer, text) => {
            setInvited((v) => [lecturer, ...v])
            setBell((n) => [{ text, when: "Just now" }, ...n])
          }}
        />
      )}
    </PortalShell>
  )
}
