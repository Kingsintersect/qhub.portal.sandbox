"use client"

import { PermissionGate } from "@/lib/permissions/PermissionGate"
import { usePermissions } from "@/lib/permissions/usePermissions"
import PublishResultsPage from "./PublishResults"
import GradesResultsPage from "./Results"
import GradesSummaryPage from "./StudentGrade"

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

// ========== RESULTS SHELL (Admin/Lecturer View) ==========
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