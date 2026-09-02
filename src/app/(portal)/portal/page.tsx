"use client"

import { useState } from "react"

import { Overview, useNotice } from "@/modules/portal/components/Overview"
import { CourseCatalogue } from "@/modules/portal/components/CourseCatalogue"
import { MediaLibrary } from "@/modules/portal/components/MediaLibrary"
import { UploadMedia } from "@/modules/portal/components/UploadMedia"
import { InviteLecturer } from "@/modules/portal/components/InviteLecturer"
import { PortalShell } from "@/modules/portal/components/PortalShell"
import { StudentRoll } from "@/modules/portal/components/StudentRoll"
import { TeachingStaff } from "@/modules/portal/components/TeachingStaff"
import {
  COURSES,
  LECTURERS,
  MEDIA,
  MY_CODES,
  STUDENTS,
  type Lecturer,
  type MediaItem,
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
      badges={admin ? { support: 2 } : { support: 2, msgs: 2 }}
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
                  { k: "Open support tickets", v: "2", tone: "accent" },
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
                    onClick: () => setView("support"),
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
                    onClick: () => setView("support"),
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
            { label: "Create lesson", run: () => setView("lessons") },
            { label: "Schedule live class", run: () => setView("live") },
            { label: "New quiz or exam", run: () => setView("assess") },
            { label: "Start discussion", run: () => setView("disc") },
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

      {view !== "overview" &&
        view !== "students" &&
        view !== "courses" &&
        view !== "media" &&
        !(view === "lect" && admin) && (
          <div
            style={{
              background: "var(--card)",
              borderRadius: 20,
              boxShadow: "var(--shadow-card)",
              padding: "20px 22px",
              fontSize: 12.5,
              color: "var(--txt3)",
            }}
          >
            This screen is a later slice.
          </div>
        )}
    </PortalShell>
  )
}
