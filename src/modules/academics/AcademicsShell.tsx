"use client"

import { PermissionGate } from "@/lib/permissions/PermissionGate"
import { usePermissions } from "@/lib/permissions/usePermissions"
import AcademicSessionPage from "./_components/academic-year/AcademinYearPageContainer"
import AdmissionsPage from "./_components/admissions/AdmissionPageContainer"
import CourseStructurePage from "./_components/course-structure/CourseStructure"
import CourseManagementPage from "./_components/courses-management/CourseManagement"
import AcademicStructurePage from "./_components/academic-structure/AcademicStructure"

// ========== ACADEMIC SESSION SHELL ==========
// Requires: departments:manage (permission 10) or a dedicated academics:configure permission
export function AcademicSessionShell() {
  const { can } = usePermissions()

  // For dedicated permission, you would add "academics:configure" to allPermissions
  const canManage = can({ resource: "academics", action: "configure" })

  return (
    <div className="space-y-8">
      <PermissionGate require={{ resource: "academics", action: "configure" }}>
        <AcademicSessionPage canManage={canManage} />
      </PermissionGate>
    </div>
  )
}

// ========== ADMISSIONS SHELL ==========
// Requires: admissions:manage (permission 28) or students:admit (ID 13)
export function AdmissionsShell() {
  const { can } = usePermissions()

  // Use dedicated admissions permission (or fallback to students:admit)
  const canManage =
    can({ resource: "admissions", action: "manage" }) ||
    can({ resource: "students", action: "admit" })

  return (
    <div className="space-y-8">
      <PermissionGate
        require={[
          { resource: "admissions", action: "manage" },
          { resource: "students", action: "admit" },
        ]}
        mode="any"
      >
        <AdmissionsPage canManage={canManage} />
      </PermissionGate>
    </div>
  )
}

// ========== COURSE STRUCTURE SHELL ==========
// Requires: course_structure:manage (permission 29)
export function CourseStructureShell() {
  const { can } = usePermissions()

  // Use course_structure:manage (ID 29) or dedicated permission if added
  const canManage = can({ resource: "course_structure", action: "manage" })

  return (
    <div className="space-y-8">
      <PermissionGate
        require={{ resource: "course_structure", action: "manage" }}
      >
        <CourseStructurePage canManage={canManage} />
      </PermissionGate>
    </div>
  )
}

// ========== ACADEMIC STRUCTURE SHELL ==========
// Requires: course_structure:manage (permission 29) — reused rather than a
// new permission since this is a direct extension of the same admin domain.
export function AcademicStructureShell() {
  const { can } = usePermissions()

  const canManage = can({ resource: "course_structure", action: "manage" })

  return (
    <div className="space-y-8">
      <PermissionGate
        require={{ resource: "course_structure", action: "manage" }}
      >
        <AcademicStructurePage canManage={canManage} />
      </PermissionGate>
    </div>
  )
}

// ========== COURSE MANAGEMENT SHELL ==========
// Requires: course_structure:manage (permission 29) or a dedicated course_management:manage permission
export function CourseManagementShell() {
  const { can } = usePermissions()

  // Use departments:manage permission (ID 10) or a dedicated course management permission
  const canManage = can({ resource: "departments", action: "manage" })

  return (
    <div className="space-y-8">
      <PermissionGate require={{ resource: "departments", action: "manage" }}>
        <CourseManagementPage canManage={canManage} />
      </PermissionGate>
    </div>
  )
}
