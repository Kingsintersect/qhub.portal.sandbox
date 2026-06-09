'use client'

import { PermissionGate } from '@/lib/permissions/PermissionGate'
import { usePermissions } from '@/lib/permissions/usePermissions'
import TutorsPage from './TutorList'
import StaffPage from './StaffList'
import StudentsPage from './StudentList'
import UsersSummaryPage from './Summary'
// import { SummaryCharts } from './SummaryCharts'
// import { StudentsTable } from './StudentsTable'
// import { TutorsTable } from './TutorsTable'
// import { StaffTable } from './StaffTable'

export function StatisticsManagementShell() {
   // const { can } = usePermissions()

   // Derive capability flags once — pass down as plain booleans
   // const canDelete = can({ resource: 'users', action: 'manage' })
   // const canCreate = can({ resource: 'users', action: 'manage' })
   // const canExport = can({ resource: 'departments', action: 'manage' })

   return (
      <div className="space-y-8">
         {/* Summary charts — anyone with users:manage or results:approve */}
         <PermissionGate
            require={[
               { resource: 'users', action: 'manage' },
               { resource: 'results', action: 'approve' },
            ]}
            mode="any"
         >
            <UsersSummaryPage />
         </PermissionGate>
      </div>
   )
}

export function StudentsManagementShell() {
   const { can } = usePermissions()

   // Derive capability flags once — pass down as plain booleans
   const canDelete = can({ resource: 'users', action: 'manage' })
   const canCreate = can({ resource: 'users', action: 'manage' })
   const canExport = can({ resource: 'departments', action: 'manage' })

   return (
      <div className="space-y-8">
         {/* Students table — users:manage (ADMIN + SUPER_ADMIN both have permission id 8) */}
         <PermissionGate require={{ resource: 'users', action: 'manage' }}>
            <StudentsPage
               canDelete={canDelete}
               canCreate={canCreate}
               canExport={canExport}
            />
         </PermissionGate>
      </div>
   )
}

export function StaffManagementShell() {
   const { can } = usePermissions()

   // Derive capability flags once — pass down as plain booleans
   const canDelete = can({ resource: 'users', action: 'manage' })
   // const canCreate = can({ resource: 'users', action: 'manage' })
   // const canExport = can({ resource: 'departments', action: 'manage' })

   return (
      <div className="space-y-8">
         {/* Staff table — departments:manage (SUPER_ADMIN only, permission id 10) */}
         <PermissionGate require={{ resource: 'departments', action: 'manage' }}>
            <StaffPage canDelete={canDelete} />
         </PermissionGate>
      </div>
   )
}

export function TutorManagementShell() {
   const { can } = usePermissions()

   // Derive capability flags once — pass down as plain booleans
   const canDelete = can({ resource: 'tutors', action: 'manage' })
   const canCreate = can({ resource: 'tutors', action: 'manage' })
   // const canExport = can({ resource: 'departments', action: 'manage' })

   return (
      <div className="space-y-8">
         {/* Tutors table — same gate */}
         <PermissionGate require={{ resource: 'tutors', action: 'view' }}>
            <TutorsPage
               canDelete={canDelete}
               canCreate={canCreate}
            />
         </PermissionGate>
      </div>
   )
}

