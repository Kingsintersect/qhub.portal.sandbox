"use client"

import { useState } from "react"

import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useAcceptTask,
  useAddTaskStep,
  useCompleteTaskStep,
  useResolveTask,
  useTasks,
  useTeamMetrics,
} from "@/modules/platform-tasks/hooks/use-platform-tasks"
import {
  TASK_TIMELINES,
  type PlatformTask,
  type TaskScope,
  type TaskStatusFilter,
  type TaskTimeline,
} from "@/modules/platform-tasks/types"

/**
 * My tasks, and — for anyone who can manage them — the whole team's.
 *
 * Status is derived from timestamps server-side, so there is no status picker
 * anywhere here. The controls are accept, tick a step, and resolve.
 */
export function TasksPage() {
  const { can } = usePlatformPermissions()
  const canSeeEveryone = can("tasks.manage")

  const [scope, setScope] = useState<TaskScope>("mine")
  const [status, setStatus] = useState<TaskStatusFilter>("")

  const { data, isLoading } = useTasks(scope, status)
  const { data: team } = useTeamMetrics()

  const rows = data?.data ?? []

  return (
    <div style={{ padding: "26px 30px" }}>
      <h1
        style={{
          fontSize: 21,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--txt)",
          margin: 0,
        }}
      >
        {scope === "mine" ? "My tasks" : "All tasks"}
      </h1>
      <p style={{ fontSize: 13, color: "var(--txt3)", marginTop: 5 }}>
        Accepting a task starts a clock you set yourself. Every step you tick is
        timestamped and told to whoever assigned it.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 18,
        }}
      >
        {canSeeEveryone && (
          <div
            style={{ display: "flex", border: "1px solid var(--line-strong)" }}
          >
            <Segment
              label="My tasks"
              active={scope === "mine"}
              onClick={() => setScope("mine")}
            />
            <Segment
              label="All tasks · admin"
              active={scope === "all"}
              onClick={() => setScope("all")}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {(
            [
              ["", "All"],
              ["open", "Open"],
              ["awaiting", "Awaiting acceptance"],
              ["resolved", "Resolved"],
            ] as Array<[TaskStatusFilter, string]>
          ).map(([value, label]) => (
            <Chip
              key={value || "all"}
              label={label}
              active={status === value}
              onClick={() => setStatus(value)}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <Stat label="OPEN FOR YOU" value={data?.meta.openForYou ?? 0} />
        <Stat
          label="TEAM AWAITING ACCEPTANCE"
          value={data?.meta.awaitingAcceptance ?? 0}
          tone={(data?.meta.awaitingAcceptance ?? 0) > 0 ? "warn" : undefined}
        />
      </div>

      <div style={{ marginTop: 22 }}>
        {isLoading && (
          <div style={{ fontSize: 13, color: "var(--txt3)" }}>Loading…</div>
        )}

        {!isLoading && rows.length === 0 && (
          <div
            style={{ fontSize: 13, color: "var(--txt3)", padding: "22px 0" }}
          >
            No tasks match these filters.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              readOnly={scope === "all" && task.assignee === null}
            />
          ))}
        </div>
      </div>

      {canSeeEveryone && team && team.length > 0 && <TeamTable rows={team} />}
    </div>
  )
}

// --- Task card --------------------------------------------------------------

function TaskCard({
  task,
  readOnly,
}: {
  task: PlatformTask
  readOnly: boolean
}) {
  const [open, setOpen] = useState(false)
  const [timeline, setTimeline] = useState<TaskTimeline | null>(null)
  const [stepBody, setStepBody] = useState("")

  const accept = useAcceptTask()
  const resolve = useResolveTask()
  const addStep = useAddTaskStep()
  const completeStep = useCompleteTaskStep()

  const done = task.steps.filter((s) => s.done).length

  return (
    <div
      style={{
        background: "var(--card)",
        boxShadow: "var(--shadow-card)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="qhub-mono"
              style={{ fontSize: 11, color: "var(--txt4)" }}
            >
              {task.reference}
            </span>
            <StatusPill task={task} />
            {task.institution && (
              <span style={{ fontSize: 11.5, color: "var(--txt3)" }}>
                {task.institution}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "block",
              textAlign: "left",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--txt)",
              marginTop: 6,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {task.title}
          </button>

          {/* The design's line for an assigned-but-unaccepted task. It is the
              response-time metric made visible rather than a scold. */}
          {task.awaitingAcceptance && task.assignee && (
            <div style={{ fontSize: 12, color: "var(--warn)", marginTop: 5 }}>
              Assigned to {task.assignee} — not accepted yet. The response clock
              is running.
            </div>
          )}

          {task.steps.length > 0 && (
            <div
              className="qhub-mono"
              style={{ fontSize: 11, color: "var(--txt3)", marginTop: 6 }}
            >
              {done}/{task.steps.length} steps
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
          {task.resolveBy && (
            <div
              className="qhub-mono"
              style={{
                fontSize: 11.5,
                color: task.overdue ? "var(--neg)" : "var(--txt3)",
              }}
            >
              due{" "}
              {new Date(task.resolveBy).toLocaleString(undefined, {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
          {task.assignee && (
            <div style={{ fontSize: 11.5, color: "var(--txt3)", marginTop: 3 }}>
              {task.assignee}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div
          style={{
            marginTop: 14,
            borderTop: "1px solid var(--line)",
            paddingTop: 14,
          }}
        >
          {task.body && (
            <p
              style={{
                fontSize: 12.5,
                color: "var(--txt2)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {task.body}
            </p>
          )}

          {/* Acceptance. A task that carried its deadline at creation is not
              the assignee's to schedule, so it is one click. */}
          {!readOnly && !task.acceptedAt && !task.resolvedAt && (
            <div style={{ marginTop: 14 }}>
              {task.deadlineSetAtCreation ? (
                <>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--txt3)",
                      marginBottom: 8,
                    }}
                  >
                    This one arrived with its own deadline — no timeline to
                    pick.
                  </div>
                  <Primary
                    onClick={() => accept.mutate({ id: task.id })}
                    disabled={accept.isPending}
                  >
                    Accept
                  </Primary>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--txt3)",
                      marginBottom: 8,
                    }}
                  >
                    Pick how long you need. Accepting tells the assigner the
                    deadline.
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {TASK_TIMELINES.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        active={timeline === t}
                        onClick={() => setTimeline(t)}
                      />
                    ))}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Primary
                      onClick={() =>
                        timeline && accept.mutate({ id: task.id, timeline })
                      }
                      disabled={!timeline || accept.isPending}
                    >
                      Accept
                    </Primary>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Steps. Read-only in the admin scope — somebody else's checklist. */}
          {task.steps.length > 0 && (
            <div style={{ marginTop: 14 }}>
              {task.steps.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "7px 0",
                    borderBottom: "1px solid var(--line2)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={s.done}
                    disabled={s.done || readOnly || !task.acceptedAt}
                    onChange={() => completeStep.mutate(s.id)}
                    aria-label={`Mark "${s.body}" done`}
                  />
                  <span
                    style={{
                      fontSize: 12.5,
                      color: s.done ? "var(--txt3)" : "var(--txt)",
                      textDecoration: s.done ? "line-through" : "none",
                      flex: 1,
                    }}
                  >
                    {s.body}
                  </span>
                  {s.done && s.completedAt && (
                    <span
                      className="qhub-mono"
                      style={{ fontSize: 10.5, color: "var(--txt4)" }}
                    >
                      logged{" "}
                      {new Date(s.completedAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!readOnly && task.acceptedAt && !task.resolvedAt && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                value={stepBody}
                onChange={(e) => setStepBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && stepBody.trim()) {
                    addStep.mutate(
                      { id: task.id, body: stepBody.trim() },
                      { onSuccess: () => setStepBody("") }
                    )
                  }
                }}
                placeholder="Add a step…"
                aria-label="Add a resolution step"
                style={{
                  flex: 1,
                  background: "var(--panel)",
                  border: "1px solid var(--line-strong)",
                  padding: "8px 11px",
                  fontSize: 12.5,
                  color: "var(--txt)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <Primary
                onClick={() =>
                  stepBody.trim() &&
                  addStep.mutate(
                    { id: task.id, body: stepBody.trim() },
                    { onSuccess: () => setStepBody("") }
                  )
                }
                disabled={!stepBody.trim() || addStep.isPending}
              >
                Add
              </Primary>
            </div>
          )}

          {!readOnly && task.acceptedAt && !task.resolvedAt && (
            <div style={{ marginTop: 14 }}>
              <Primary
                onClick={() => resolve.mutate(task.id)}
                disabled={resolve.isPending}
              >
                Mark resolved
              </Primary>
            </div>
          )}

          {task.tags.length > 0 && (
            <div style={{ marginTop: 14, fontSize: 12, color: "var(--txt3)" }}>
              Tagged:{" "}
              {task.tags
                .map((t) => t.user)
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Team -------------------------------------------------------------------

function TeamTable({
  rows,
}: {
  rows: Array<{
    id: number
    staff: string
    open: number
    awaitingAcceptance: number
    avgAcceptMinutes: number | null
    avgResolveMinutes: number | null
  }>
}) {
  return (
    <div style={{ marginTop: 28 }}>
      <h2
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--txt)",
          margin: 0,
        }}
      >
        Team
      </h2>
      <p style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 4 }}>
        Last 30 days. A blank average means nothing has completed yet — not that
        it was instant.
      </p>

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table
          style={{
            width: "100%",
            minWidth: 560,
            borderCollapse: "collapse",
            fontSize: 12.5,
          }}
        >
          <thead>
            <tr style={{ textAlign: "left", color: "var(--txt4)" }}>
              <Th>STAFF</Th>
              <Th>OPEN</Th>
              <Th>AWAITING</Th>
              <Th>AVG ACCEPT</Th>
              <Th>AVG RESOLVE</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--line2)" }}>
                <Td>{r.staff}</Td>
                <Td mono>{r.open}</Td>
                <Td mono tone={r.awaitingAcceptance > 0 ? "warn" : undefined}>
                  {r.awaitingAcceptance}
                </Td>
                <Td mono>{formatMinutes(r.avgAcceptMinutes)}</Td>
                <Td mono>{formatMinutes(r.avgResolveMinutes)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatMinutes(m: number | null): string {
  if (m === null) return "—"
  if (m < 60) return `${m}m`
  if (m < 1440) return `${Math.round(m / 60)}h`
  return `${Math.round(m / 1440)}d`
}

// --- Small pieces -----------------------------------------------------------

function StatusPill({ task }: { task: PlatformTask }) {
  const tone = task.resolvedAt
    ? { c: "var(--accent)", bg: "var(--accent-soft)" }
    : task.overdue
      ? { c: "var(--neg)", bg: "var(--neg-bg)" }
      : task.awaitingAcceptance
        ? { c: "var(--warn)", bg: "var(--warn-bg)" }
        : { c: "var(--txt3)", bg: "var(--panel)" }

  return (
    <span
      className="qhub-mono"
      style={{
        fontSize: 9.5,
        letterSpacing: ".06em",
        color: tone.c,
        background: tone.bg,
        padding: "3px 6px",
      }}
    >
      {task.status}
    </span>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: "warn"
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        boxShadow: "var(--shadow-card)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{ fontSize: 10.5, letterSpacing: ".07em", color: "var(--txt4)" }}
      >
        {label}
      </div>
      <div
        className="qhub-mono"
        style={{
          fontSize: 26,
          fontWeight: 600,
          color: tone === "warn" ? "var(--warn)" : "var(--txt)",
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function Segment({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "7px 13px",
        fontSize: 12,
        border: "none",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "#fff" : "var(--txt3)",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 11px",
        fontSize: 12,
        border: `1px solid ${active ? "var(--accent-brd)" : "var(--line-strong)"}`,
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent)" : "var(--txt3)",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}

function Primary({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "var(--line-strong)" : "var(--accent)",
        color: disabled ? "var(--txt4)" : "#fff",
        fontSize: 12.5,
        fontWeight: 500,
        padding: "8px 15px",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: "8px 10px 8px 0",
        fontSize: 10.5,
        letterSpacing: ".06em",
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  mono,
  tone,
}: {
  children: React.ReactNode
  mono?: boolean
  tone?: "warn"
}) {
  return (
    <td
      className={mono ? "qhub-mono" : undefined}
      style={{
        padding: "10px 10px 10px 0",
        color: tone === "warn" ? "var(--warn)" : "var(--txt2)",
      }}
    >
      {children}
    </td>
  )
}
