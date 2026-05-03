"use client";

import { motion } from "framer-motion";
import {
   AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { RevenueByMonth, RevenueByProgram, RevenueByType } from "../../types/finance.types";

// ─── Chart color palette from design tokens ──────────────────────────────────
const CHART_COLORS = {
   primary: "oklch(0.378 0.072 258.5)",
   accent: "oklch(0.60 0.20 45)",
   emerald: "oklch(0.65 0.17 162)",
   rose: "oklch(0.60 0.20 15)",
   violet: "oklch(0.57 0.20 295)",
   amber: "oklch(0.72 0.17 78)",
};

const PIE_COLORS = [
   CHART_COLORS.primary,
   CHART_COLORS.accent,
   CHART_COLORS.emerald,
   CHART_COLORS.violet,
   CHART_COLORS.rose,
   CHART_COLORS.amber,
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
interface TooltipPayloadEntry {
   name?: string | number;
   value?: number | string | ReadonlyArray<number | string>;
   color?: string;
}

interface CustomTooltipProps {
   active?: boolean;
   payload?: ReadonlyArray<TooltipPayloadEntry>;
   label?: string | number;
   formatCurrency: (n: number) => string;
}

function CustomTooltip({ active, payload, label, formatCurrency }: CustomTooltipProps) {
   if (!active || !payload?.length) return null;
   return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-sm min-w-40">
         <p className="font-semibold text-foreground mb-2">{label}</p>
         {payload.map((entry, i) => (
            <div key={String(entry.name ?? i)} className="flex justify-between gap-4 text-xs">
               <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
                  {entry.name}
               </span>
               <span className="font-medium text-foreground">
                  {typeof entry.value === "number" ? formatCurrency(entry.value) : null}
               </span>
            </div>
         ))}
      </div>
   );
}

// ─── Area Revenue Chart ───────────────────────────────────────────────────────
interface RevenueAreaChartProps {
   data: RevenueByMonth[];
   formatCurrency: (n: number) => string;
}

export function RevenueAreaChart({ data, formatCurrency }: RevenueAreaChartProps) {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.2 }}
         className="bg-card border border-border rounded-2xl p-5"
      >
         <div className="mb-4">
            <h3 className="font-semibold text-foreground text-sm">Revenue Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Monthly collection overview</p>
         </div>
         <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
               <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                     <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.3} />
                     <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0} />
                  </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
               <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
               />
               <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1_000_000).toFixed(1)}M`}
                  width={52}
               />
               <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
               <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#gradRevenue)"
               />
               <Area
                  type="monotone"
                  dataKey="pending"
                  name="Pending"
                  stroke={CHART_COLORS.amber}
                  strokeWidth={2}
                  fill="url(#gradPending)"
               />
            </AreaChart>
         </ResponsiveContainer>
      </motion.div>
   );
}

// ─── Program Bar Chart ────────────────────────────────────────────────────────
interface ProgramBarChartProps {
   data: RevenueByProgram[];
   formatCurrency: (n: number) => string;
}

export function ProgramBarChart({ data, formatCurrency }: ProgramBarChartProps) {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3 }}
         className="bg-card border border-border rounded-2xl p-5"
      >
         <div className="mb-4">
            <h3 className="font-semibold text-foreground text-sm">Revenue by Program</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Collection per academic programme</p>
         </div>
         <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }} barSize={22}>
               <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
               <XAxis
                  dataKey="programCode"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
               />
               <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${(v / 1_000_000).toFixed(0)}M`}
                  width={44}
               />
               <Tooltip
                  content={({ active, payload, label }) => (
                     <CustomTooltip
                        active={active}
                        payload={payload}
                        label={data.find((d) => d.programCode === label)?.programName ?? label}
                        formatCurrency={formatCurrency}
                     />
                  )}
               />
               <Bar
                  dataKey="revenue"
                  name="Revenue"
                  radius={[6, 6, 0, 0]}
                  fill={CHART_COLORS.primary}
               >
                  {data.map((_, index) => (
                     <Cell
                        key={index}
                        fill={index % 2 === 0 ? CHART_COLORS.primary : CHART_COLORS.accent}
                     />
                  ))}
               </Bar>
            </BarChart>
         </ResponsiveContainer>
      </motion.div>
   );
}

// ─── Revenue by Type Donut Chart ──────────────────────────────────────────────
interface TypeDonutChartProps {
   data: RevenueByType[];
   formatCurrency: (n: number) => string;
}

const RADIAN = Math.PI / 180;

interface PieLabelProps {
   cx?: number;
   cy?: number;
   midAngle?: number;
   innerRadius?: number;
   outerRadius?: number;
   percent?: number;
}

function renderCustomLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: PieLabelProps) {
   if (percent < 0.05) return null;
   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
   const x = cx + radius * Math.cos(-midAngle * RADIAN);
   const y = cy + radius * Math.sin(-midAngle * RADIAN);
   return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
         {`${(percent * 100).toFixed(0)}%`}
      </text>
   );
}

export function TypeDonutChart({ data, formatCurrency }: TypeDonutChartProps) {
   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.35 }}
         className="bg-card border border-border rounded-2xl p-5"
      >
         <div className="mb-4">
            <h3 className="font-semibold text-foreground text-sm">Revenue by Fee Type</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Breakdown by payment category</p>
         </div>
         <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={190}>
               <PieChart>
                  <Pie
                     data={data}
                     cx="50%"
                     cy="50%"
                     innerRadius={52}
                     outerRadius={82}
                     dataKey="amount"
                     labelLine={false}
                     label={renderCustomLabel}
                     paddingAngle={2}
                  >
                     {data.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                     ))}
                  </Pie>
                  <Tooltip
                     content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as RevenueByType;
                        return (
                           <div className="bg-card border border-border rounded-xl p-3 text-xs shadow-lg">
                              <p className="font-semibold text-foreground">{d.label}</p>
                              <p className="text-muted-foreground">{formatCurrency(d.amount)}</p>
                              <p className="text-muted-foreground">{d.percentage}% of total</p>
                           </div>
                        );
                     }}
                  />
               </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
               {data.map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between gap-2">
                     <div className="flex items-center gap-2 min-w-0">
                        <span
                           className="w-2.5 h-2.5 rounded-full shrink-0"
                           style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                     </div>
                     <span className="text-xs font-semibold text-foreground shrink-0">
                        {item.percentage}%
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </motion.div>
   );
}
