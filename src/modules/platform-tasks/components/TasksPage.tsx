"use client"

import { useState } from "react"

import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useAcceptTask,
  useAddTaskStep,
  useCompleteTaskStep,
  useCancelTask,
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
  type TeamMetric,
} from "@/modules/platform-tasks/types"

/**
 * My Tasks, lifted from the draft.
 *
 * Status is derived from timestamps server-side, so there is no status picker
 * anywhere here — the controls are accept, tick a step, and resolve.
 */
export function TasksPage() {
  const { can } = usePlatformPermissions()
  const canSeeEveryone = can("tasks.manage")

  const [scope, setScope] = useState<TaskScope>("mine")
  const [status, setStatus] = useState<TaskStatusFilter>("")
  const [openId, setOpenId] = useState<number | null>(null)

  const { data, isLoading } = useTasks(scope, status)
  const { data: team } = useTeamMetrics()

  const rows = data?.data ?? []

  const tabs: Array<[TaskStatusFilter, string, number | undefined]> = [
    ["", "All", rows.length],
    ["open", "Open", data?.meta.openForYou],
    ["awaiting", "Awaiting acceptance", data?.meta.awaitingAcceptance],
    ["resolved", "Resolved", undefined],
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            color: "var(--txt)",
            margin: 0,
          }}
        >
          My Tasks
        </h1>
        <div style={{ fontSize: 12.5, color: "var(--txt3)", marginTop: 3 }}>
          Tickets and escalations assigned to you · accepting starts your
          response clock, and whoever assigned it sees whether you have
        </div>
      </div>

      {/* The stat strip is one card divided by hairlines, not four cards. */}
      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          padding: 4,
          boxShadow: "var(--shadow-card)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        <Stat
          label="Open for you"
          value={data?.meta.openForYou ?? 0}
          note="assigned and unresolved"
        />
        <Stat
          label="Awaiting acceptance"
          value={data?.meta.awaitingAcceptance ?? 0}
          note="team-wide"
          tone={(data?.meta.awaitingAcceptance ?? 0) > 0 ? "warn" : undefined}
        />
        <Stat
          label="Avg time to accept"
          value={averageOf(team, "avgAcceptMinutes")}
          note="last 30 days"
        />
        <Stat
          label="Avg time to resolve"
          value={averageOf(team, "avgResolveMinutes")}
          note="last 30 days"
          last
        />
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 20,
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "14px 18px 0",
            flexWrap: "wrap",
          }}
        >
          {tabs.map(([value, label, count]) => (
            <TabPill
              key={value || "all"}
              label={label}
              count={count}
              active={status === value}
              onClick={() => setStatus(value)}
            />
          ))}

          {canSeeEveryone && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                background: "var(--panel)",
                borderRadius: 10,
                padding: 3,
              }}
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
        </div>

        <div style={{ height: 10 }} />

        {isLoading && (
          <div
            style={{
              padding: "26px 24px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            Loading…
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div
            style={{
              padding: "26px 24px",
              borderTop: "1px solid var(--line2)",
              fontSize: 13,
              color: "var(--txt3)",
            }}
          >
            Nothing here — no tasks in this state.
          </div>
        )}

        {rows.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            teamScope={scope === "all"}
            expanded={openId === task.id}
            onToggle={() => setOpenId(openId === task.id ? null : task.id)}
          />
        ))}
      </div>

      {canSeeEveryone && team && team.length > 0 && <TeamTable rows={team} />}
    </div>
  )
}

// --- Row --------------------------------------------------------------------

const ROW_GRID =
  "104px minmax(0,1.9fr) minmax(0,1fr) 84px 180px minmax(0,1.2fr)"

function TaskRow({
  task,
  teamScope,
  expanded,
  onToggle,
}: {
  task: PlatformTask
  teamScope: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const [timeline, setTimeline] = useState<TaskTimeline | null>(null)
  const [stepBody, setStepBody] = useState("")

  const accept = useAcceptTask()
  const resolve = useResolveTask()
  const cancel = useCancelTask()
  const addStep = useAddTaskStep()
  const completeStep = useCompleteTaskStep()

  const done = task.steps.filter((s) => s.done).length
  const stepsNote = `${done} of ${task.steps.length} steps`
  const mine = !teamScope

  return (
    <div style={{ borderTop: "1px solid var(--line2)" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: "grid",
          gridTemplateColumns: ROW_GRID,
          columnGap: 16,
          alignItems: "center",
          width: "100%",
          textAlign: "left",
          padding: "13px 24px",
          fontSize: 13.5,
          background: expanded ? "var(--row-open)" : "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "var(--txt)",
        }}
      >
        <span
          className="qhub-mono"
          style={{ fontSize: 11.5, color: "var(--txt2)" }}
        >
          {task.reference}
        </span>

        <span
          style={{
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {task.title}
        </span>

        <span
          style={{
            color: "var(--txt2)",
            fontSize: 12.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {task.institution ?? "—"}
        </span>

        <span>
          <Tag tone={priorityTone(task.priority)} size={10.5}>
            {task.priority}
          </Tag>
        </span>

        <span>
          <Tag tone={statusTone(task)} size={9.5}>
            {task.status}
          </Tag>
        </span>

        <span style={{ minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontSize: 12,
              color: task.overdue ? "var(--neg)" : "var(--txt3)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {dueText(task)}
          </span>
          {teamScope && (
            <span
              style={{
                display: "block",
                fontSize: 11,
                color: "var(--txt4)",
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {task.assignee ?? "unassigned"} · {stepsNote}
            </span>
          )}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            padding: "4px 24px 18px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {task.body && (
            <div
              style={{
                border: "1px solid var(--line2)",
                borderRadius: 12,
                background: "var(--panel)",
                padding: "13px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--txt4)",
                  marginBottom: 5,
                }}
              >
                {task.assigner ? `${task.assigner} · ` : ""}
                {task.source ?? "task"}
                {task.assignedAt
                  ? ` · opened ${new Date(task.assignedAt).toLocaleDateString()}`
                  : ""}
              </div>
              <div
                style={{ fontSize: 13, color: "var(--txt2)", lineHeight: 1.6 }}
              >
                {task.body}
              </div>
            </div>
          )}

          {/* Acceptance. A task that arrived with its own resolve-by is not the
              assignee's to schedule, so no timeline is asked for. */}
          {mine && !task.acceptedAt && !task.resolvedAt && (
            <>
              {task.deadlineSetAtCreation ? (
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--txt2)",
                    background: "var(--accent-soft)",
                    border: "1px solid var(--accent-brd)",
                    borderRadius: 10,
                    padding: "10px 13px",
                  }}
                >
                  This one arrived with its own deadline
                  {task.resolveBy
                    ? ` — due ${new Date(task.resolveBy).toLocaleString()}`
                    : ""}
                  . No timeline to pick.
                </div>
              ) : null}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {!task.deadlineSetAtCreation &&
                  TASK_TIMELINES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeline(t)}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: timeline === t ? "var(--accent)" : "var(--txt3)",
                        border: `1px solid ${timeline === t ? "var(--accent-brd)" : "var(--line-strong)"}`,
                        background:
                          timeline === t ? "var(--accent-soft)" : "transparent",
                        padding: "6px 13px",
                        borderRadius: 999,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {t}
                    </button>
                  ))}

                <button
                  type="button"
                  onClick={() =>
                    accept.mutate({
                      id: task.id,
                      timeline: task.deadlineSetAtCreation
                        ? undefined
                        : (timeline ?? undefined),
                    })
                  }
                  disabled={
                    (!task.deadlineSetAtCreation && !timeline) ||
                    accept.isPending
                  }
                  style={{
                    background:
                      task.deadlineSetAtCreation || timeline
                        ? "var(--accent)"
                        : "var(--line-strong)",
                    color:
                      task.deadlineSetAtCreation || timeline
                        ? "#fff"
                        : "var(--txt4)",
                    fontSize: 12.5,
                    fontWeight: 500,
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "none",
                    cursor:
                      task.deadlineSetAtCreation || timeline
                        ? "pointer"
                        : "default",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  Accept
                </button>
              </div>
            </>
          )}

          {/* Somebody else's unaccepted task, in the admin scope. */}
          {teamScope && task.awaitingAcceptance && task.assignee && (
            <div
              style={{
                fontSize: 12.5,
                color: "var(--warn)",
                background: "var(--warn-bg)",
                borderRadius: 10,
                padding: "9px 13px",
              }}
            >
              Assigned to {task.assignee} — not accepted yet. The response clock
              is running.
            </div>
          )}

          {mine && task.acceptedAt && !task.resolvedAt && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                Accepted {new Date(task.acceptedAt).toLocaleString()}
                {task.resolveBy
                  ? ` · due ${new Date(task.resolveBy).toLocaleString()}`
                  : ""}
              </div>
              <button
                type="button"
                onClick={() => resolve.mutate(task.id)}
                disabled={resolve.isPending}
                style={{
                  marginLeft: "auto",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 9,
                  background: "transparent",
                  color: "var(--accent)",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "7px 13px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Mark resolved
              </button>

              {/* Cancelling is not resolving. Resolved means the work was
                  done; cancelled means it should not have been asked for, and
                  counting the two together would make the resolution times
                  measure work nobody did. */}
              <button
                type="button"
                onClick={() => {
                  const reason = window.prompt(
                    `Why is ${task.reference} being cancelled? Everyone on it sees this.`
                  )

                  if (reason !== null && reason.trim() !== "") {
                    cancel.mutate({ id: task.id, reason: reason.trim() })
                  }
                }}
                disabled={cancel.isPending}
                style={{
                  border: "1px solid var(--line-strong)",
                  borderRadius: 9,
                  background: "transparent",
                  color: "var(--neg)",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "7px 13px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel task
              </button>
            </div>
          )}

          {(task.steps.length > 0 || (mine && task.acceptedAt)) && (
            <div
              style={{
                border: "1px solid var(--line2)",
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--txt)" }}
                >
                  Resolution steps
                </div>
                <div style={{ fontSize: 11, color: "var(--txt4)" }}>
                  {stepsNote} · each tick is timestamped and notifies the
                  assigner
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 10,
                }}
              >
                {task.steps.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => !s.done && mine && completeStep.mutate(s.id)}
                    disabled={s.done || !mine || !task.acceptedAt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "none",
                      border: "none",
                      padding: 0,
                      width: "100%",
                      textAlign: "left",
                      cursor: s.done || !mine ? "default" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        flex: "0 0 16px",
                        boxSizing: "border-box",
                        borderRadius: 4,
                        border: `1.5px solid ${s.done ? "var(--accent)" : "var(--line-strong)"}`,
                        background: s.done ? "var(--accent)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {s.done && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M4 12l5 5L20 6" />
                        </svg>
                      )}
                    </span>

                    <span
                      style={{
                        fontSize: 12.5,
                        color: s.done ? "var(--txt4)" : "var(--txt2)",
                        textDecoration: s.done ? "line-through" : "none",
                      }}
                    >
                      {s.body}
                    </span>

                    {s.done && s.completedAt && (
                      <span
                        className="qhub-mono"
                        style={{
                          marginLeft: "auto",
                          fontSize: 10.5,
                          color: "var(--txt4)",
                        }}
                      >
                        {new Date(s.completedAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {mine && task.acceptedAt && !task.resolvedAt && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
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
                    placeholder="Add a step — optional, but it shows your working"
                    aria-label="Add a resolution step"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "var(--panel)",
                      border: "1px solid var(--line-strong)",
                      borderRadius: 9,
                      padding: "8px 11px",
                      fontSize: 12,
                      color: "var(--txt)",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      stepBody.trim() &&
                      addStep.mutate(
                        { id: task.id, body: stepBody.trim() },
                        { onSuccess: () => setStepBody("") }
                      )
                    }
                    disabled={!stepBody.trim() || addStep.isPending}
                    style={{
                      border: "1px solid var(--line-strong)",
                      borderRadius: 9,
                      background: "transparent",
                      color: "var(--txt2)",
                      fontSize: 11.5,
                      fontWeight: 500,
                      padding: "7px 12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontFamily: "inherit",
                    }}
                  >
                    Add step
                  </button>
                </div>
              )}
            </div>
          )}

          {task.tags.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 11.5, color: "var(--txt4)" }}>
                Tagged — they were notified and see the thread:
              </span>
              {task.tags.map((g, i) => (
                <span
                  key={`${g.user}-${i}`}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    padding: "5px 11px",
                    borderRadius: 999,
                  }}
                >
                  {g.user}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Team -------------------------------------------------------------------

const TEAM_GRID = "minmax(0,1.6fr) 110px 170px 150px 150px"

function TeamTable({ rows }: { rows: TeamMetric[] }) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 24px 4px",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--txt)" }}>
          Team response &amp; resolution
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--txt3)" }}>
          Status derived from timestamps (started · completed · cancelled) ·
          averages over 30 days
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: TEAM_GRID,
          columnGap: 16,
          padding: "12px 24px 10px",
          fontSize: 10.5,
          letterSpacing: ".09em",
          color: "var(--txt4)",
        }}
      >
        <div>STAFF</div>
        <div>OPEN</div>
        <div>AWAITING ACCEPTANCE</div>
        <div>AVG ACCEPT</div>
        <div>AVG RESOLVE</div>
      </div>

      {rows.map((r) => (
        <div
          key={r.id}
          style={{
            display: "grid",
            gridTemplateColumns: TEAM_GRID,
            columnGap: 16,
            alignItems: "center",
            padding: "11px 24px",
            fontSize: 13,
            borderTop: "1px solid var(--line2)",
          }}
        >
          <div style={{ fontWeight: 500, color: "var(--txt)" }}>{r.staff}</div>
          <div style={{ color: "var(--txt2)" }}>{r.open}</div>
          <div style={{ color: "var(--warn)", fontWeight: 500 }}>
            {r.awaitingAcceptance}
          </div>
          <div
            className="qhub-mono"
            style={{ fontSize: 12, color: "var(--txt2)" }}
          >
            {formatMinutes(r.avgAcceptMinutes)}
          </div>
          <div
            className="qhub-mono"
            style={{ fontSize: 12, color: "var(--txt2)" }}
          >
            {formatMinutes(r.avgResolveMinutes)}
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Small pieces -----------------------------------------------------------

function Stat({
  label,
  value,
  note,
  tone,
  last,
}: {
  label: string
  value: number | string
  note: string
  tone?: "warn"
  last?: boolean
}) {
  return (
    <div
      style={{
        padding: "18px 20px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--txt3)", marginBottom: 7 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: tone === "warn" ? "var(--warn)" : "var(--txt)",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--txt4)" }}>
          {note}
        </div>
      </div>
    </div>
  )
}

function TabPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 15px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--accent)" : "var(--txt3)",
        background: active ? "var(--accent-soft)" : "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
      {typeof count === "number" && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: active ? "var(--accent)" : "var(--txt4)",
          }}
        >
          {count}
        </span>
      )}
    </button>
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
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--txt)" : "var(--txt3)",
        background: active ? "var(--card)" : "transparent",
        boxShadow: active ? "var(--shadow-sm)" : "none",
        padding: "6px 12px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  )
}

function Tag({
  children,
  tone,
  size,
}: {
  children: React.ReactNode
  tone: { c: string; bg: string }
  size: number
}) {
  return (
    <span
      className="qhub-mono"
      style={{
        fontSize: size,
        letterSpacing: ".05em",
        padding: "4px 8px",
        borderRadius: 7,
        color: tone.c,
        background: tone.bg,
      }}
    >
      {children}
    </span>
  )
}

function priorityTone(priority: string) {
  if (priority === "P1") return { c: "var(--neg)", bg: "var(--neg-bg)" }
  if (priority === "P2") return { c: "var(--warn)", bg: "var(--warn-bg)" }

  return { c: "var(--txt3)", bg: "var(--panel)" }
}

function statusTone(task: PlatformTask) {
  if (task.resolvedAt) return { c: "var(--accent)", bg: "var(--accent-soft)" }
  if (task.overdue) return { c: "var(--neg)", bg: "var(--neg-bg)" }
  if (task.awaitingAcceptance) return { c: "var(--warn)", bg: "var(--warn-bg)" }

  return { c: "var(--txt3)", bg: "var(--panel)" }
}

function dueText(task: PlatformTask): string {
  if (task.resolvedAt) {
    return `resolved ${new Date(task.resolvedAt).toLocaleDateString()}`
  }

  if (!task.resolveBy) {
    // Never rendered as healthy — a task with no target is not on time, it is
    // untracked, and the draft is explicit that the two must not look alike.
    return "no target"
  }

  return `due ${new Date(task.resolveBy).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })}`
}

function formatMinutes(m: number | null): string {
  if (m === null) return "—"
  if (m < 60) return `${m}m`
  if (m < 1440) return `${Math.round(m / 60)}h`

  return `${Math.round(m / 1440)}d`
}

/**
 * Team average of an average.
 *
 * Returns an em dash rather than zero when nobody has completed anything —
 * "no data" and "instant" must not read the same.
 */
function averageOf(
  team: TeamMetric[] | undefined,
  key: "avgAcceptMinutes" | "avgResolveMinutes"
): string {
  const values = (team ?? [])
    .map((t) => t[key])
    .filter((v): v is number => v !== null)

  if (values.length === 0) return "—"

  return formatMinutes(
    Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
  )
}
