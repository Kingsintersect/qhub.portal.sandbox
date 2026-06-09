"use client"

import { PermissionGate } from "@/lib/permissions/PermissionGate"
import { usePermissions } from "@/lib/permissions/usePermissions"
import PublishResultsPage from "./PublishResults"
import GradesResultsPage from "./Results"
import GradesSummaryPage from "./StudentGrade"
import StudentResultsPage from "../StudentResultsPage"
import { BulkGradeForm } from "../BulkGradeForm"

// ========== GRADE SUMMARY SHELL (Student View) ==========
// Shows: Grade distribution, top performers, grade scale
// Requires: results:view.own (permission 1)
export function GradeSummaryShell() {
   const { can } = usePermissions()

   const canViewOwn = can({ resource: 'results', action: 'view.own' })

   return (
      <div className="space-y-8">
         <PermissionGate require={{ resource: 'results', action: 'view.own' }}>
            <GradesSummaryPage canViewOwn={canViewOwn} />
         </PermissionGate>
      </div>
   )
}

// ========== RESULTS SHELL (Admin/Tutor View) ==========
// Shows: Grades table, filters, grouped view, export
// Requires: results:view.all OR results:manage (permission 2 or 3)
export function ResultShell() {
   const { can } = usePermissions()

   const canViewAll = can({ resource: 'results', action: 'view.all' })
   const canManage = can({ resource: 'results', action: 'manage' })
   const canExport = can({ resource: 'results', action: 'export' })
   const canAnalyze = can({ resource: 'results', action: 'analyze' })

   return (
      <div className="space-y-8">
         <PermissionGate
            require={[
               { resource: 'results', action: 'view.all' },
               { resource: 'results', action: 'manage' }
            ]}
            mode="any"
         >
            <GradesResultsPage
               canViewAll={canViewAll}
               canManage={canManage}
               canExport={canExport}
               canAnalyze={canAnalyze}
            />
         </PermissionGate>
      </div>
   )
}

// ========== PUBLISH RESULTS SHELL ==========
// Shows: Course selector, student grades, publish button
// Requires: results:publish (permission 4)
export function PublishResultShell() {
   const { can } = usePermissions()

   const canPublish = can({ resource: 'results', action: 'publish' })
   const canManage = can({ resource: 'results', action: 'manage' })

   return (
      <div className="space-y-8">
         <PermissionGate require={{ resource: 'results', action: 'publish' }}>
            <PublishResultsPage
               canPublish={canPublish}
               canManage={canManage}
            />
         </PermissionGate>
      </div>
   )
}

// ========== STUDENT RESULT SHELL ==========
// Shows: Student's own published grades grouped by semester + CGPA history
// Requires: results:view.own (permission 1)
export function StudentResultShell() {
   return (
      <PermissionGate
         require={{ resource: 'results', action: 'view.own' }}
         fallback={
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
               <p className="text-sm">You do not have permission to view results.</p>
            </div>
         }
      >
         <StudentResultsPage />
      </PermissionGate>
   )
}

// ========== TUTOR GRADE BOOK SHELL ==========
// Shows: Paginated grades table with filters — tutor reviews grades for their courses
// Requires: results:manage (permission 3)
export function TutorGradeBookShell() {
   const { can } = usePermissions()

   const canManage = can({ resource: 'results', action: 'manage' })
   const canExport = can({ resource: 'results', action: 'export' })

   return (
      <PermissionGate
         require={{ resource: 'results', action: 'manage' }}
         fallback={
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
               <p className="text-sm">You do not have permission to access the grade book.</p>
            </div>
         }
      >
         <GradesResultsPage
            canViewAll={false}
            canManage={canManage}
            canExport={canExport}
            canAnalyze={false}
         />
      </PermissionGate>
   )
}

// ========== TUTOR SUBMIT RESULTS SHELL ==========
// Shows: Course + semester selector, student score inputs, submit button
// Requires: results:manage (permission 3)
export function TutorSubmitShell() {
   return (
      <PermissionGate
         require={{ resource: 'results', action: 'manage' }}
         fallback={
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
               <p className="text-sm">You do not have permission to submit grades.</p>
            </div>
         }
      >
         <BulkGradeForm />
      </PermissionGate>
   )
}
