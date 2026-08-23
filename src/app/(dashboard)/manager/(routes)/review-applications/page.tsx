"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ClipboardList, Eye, GraduationCap, Users } from "lucide-react"
import DataTable, { type Column } from "@/components/custom/DataTable"
import StatusBadge from "@/components/custom/StatusBadge"
import Tabs from "@/components/custom/Tabs"
import EmptyState from "@/components/custom/EmptyState"
import { applicationReviewQueryOptions } from "@/services/applicationReviewApi"
import type {
  AdmissionApplication,
  ApplicationReviewStatus,
} from "@/types/school"

const statusVariantMap: Record<
  ApplicationReviewStatus,
  "warning" | "info" | "success" | "destructive"
> = {
  pending: "warning",
  under_review: "info",
  approved: "success",
  denied: "destructive",
}

const statusLabelMap: Record<ApplicationReviewStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  denied: "Denied",
}

const tabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "denied", label: "Denied" },
]

export default function ReviewApplicationsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")

  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useQuery(
    applicationReviewQueryOptions.list(
      statusFilter !== "all" ? { status: statusFilter } : undefined
    )
  )

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    under_review: applications.filter((a) => a.status === "under_review")
      .length,
    approved: applications.filter((a) => a.status === "approved").length,
    denied: applications.filter((a) => a.status === "denied").length,
  }

  const tabsWithBadges = tabs.map((t) => ({
    ...t,
    badge: counts[t.key as keyof typeof counts],
  }))

  const columns: Column<AdmissionApplication>[] = [
    {
      key: "applicant_name",
      header: "Applicant",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xs font-bold text-primary">
              {row.personal_info.first_name[0]}
              {row.personal_info.last_name[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">
              {row.personal_info.last_name}, {row.personal_info.first_name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {row.personal_info.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "program",
      header: "Program",
      render: (row) => (
        <span className="text-foreground">
          {row.program_choice.first_choice_program_name}
        </span>
      ),
    },
    {
      key: "jamb_score",
      header: "JAMB",
      sortable: true,
      align: "center",
      render: (row) => (
        <span className="font-medium text-foreground">
          {row.program_choice.jamb_score}
        </span>
      ),
    },
    {
      key: "submitted_at",
      header: "Submitted",
      sortable: true,
      render: (row) => (
        <span className="text-muted-foreground">
          {new Date(row.submitted_at).toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <StatusBadge
          label={statusLabelMap[row.status]}
          variant={statusVariantMap[row.status]}
          dot
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/manager/review-applications/${row.id}`)
          }}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Review"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ]

  // Stats
  const stats = [
    {
      label: "Total Applications",
      value: counts.all,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Pending Review",
      value: counts.pending,
      icon: ClipboardList,
      color: "text-amber-500",
    },
    {
      label: "Approved",
      value: counts.approved,
      icon: GraduationCap,
      color: "text-emerald-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold text-foreground">
          Review Applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage student admission applications
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {isError && (
        <EmptyState
          icon={ClipboardList}
          title="Couldn't load applications"
          description={
            error?.message ?? "Something went wrong. Please try again."
          }
        />
      )}

      {/* Table with Tabs */}
      {!isError && (
        <Tabs
          tabs={tabsWithBadges}
          defaultTab="all"
          onChange={(key) => setStatusFilter(key)}
        >
          {() =>
            applications.length === 0 && !isLoading ? (
              <EmptyState
                icon={ClipboardList}
                title="No applications found"
                description="There are no applications matching the current filter."
              />
            ) : (
              <DataTable
                data={
                  applications as (AdmissionApplication &
                    Record<string, unknown>)[]
                }
                columns={
                  columns as Column<
                    AdmissionApplication & Record<string, unknown>
                  >[]
                }
                loading={isLoading}
                searchable
                searchPlaceholder="Search by name, email, program…"
                searchExtractor={(row) => {
                  const a = row as unknown as AdmissionApplication
                  return [
                    a.personal_info.first_name,
                    a.personal_info.last_name,
                    a.personal_info.middle_name,
                    a.personal_info.email,
                    a.personal_info.phone,
                    a.program_choice.first_choice_program_name,
                    a.program_choice.second_choice_program_name,
                    a.program_choice.jamb_reg_no,
                    String(a.program_choice.jamb_score),
                    a.status,
                    a.id,
                  ].join(" ")
                }}
                rowKey="id"
                onRowClick={(row) =>
                  router.push(`/manager/review-applications/${row.id}`)
                }
                pageSize={10}
                emptyMessage="No applications match your search"
              />
            )
          }
        </Tabs>
      )}
    </div>
  )
}
