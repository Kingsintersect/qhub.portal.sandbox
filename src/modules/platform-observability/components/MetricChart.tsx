"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { MetricPoint } from "@/modules/platform-observability/types"

/**
 * A metric over time.
 *
 * Colours come from the design system's CSS custom properties rather than
 * literals, so the chart follows the institution's brand and the light/dark
 * theme instead of fighting them.
 */
export function MetricChart({
  points,
  dataKey,
  label,
}: {
  points: MetricPoint[]
  dataKey: keyof MetricPoint
  label: string
}) {
  if (points.length === 0) {
    return (
      <div className="grid h-48 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
        No captures yet — the collector runs every fifteen minutes.
      </div>
    )
  }

  // A single capture cannot be drawn as a line. Say so rather than rendering an
  // empty axis that looks like a broken chart.
  if (points.length === 1) {
    return (
      <div className="grid h-48 place-items-center rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
        <span>
          Only one capture so far.
          <br />
          <span className="text-base font-semibold text-foreground tabular-nums">
            {String(points[0][dataKey] ?? 0)}
          </span>{" "}
          {label.toLowerCase()}
        </span>
      </div>
    )
  }

  const data = points.map((p) => ({
    at: p.capturedAt ? new Date(p.capturedAt).getTime() : 0,
    value: Number(p[dataKey] ?? 0),
  }))

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
        >
          <defs>
            <linearGradient
              id={`fill-${String(dataKey)}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="at"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              })
            }
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--popover-foreground)",
            }}
            labelFormatter={(v) => new Date(Number(v)).toLocaleString()}
            formatter={(value) => [Number(value ?? 0).toLocaleString(), label]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fill={`url(#fill-${String(dataKey)})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
