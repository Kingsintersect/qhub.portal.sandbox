"use client";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
// import your chart library (e.g., recharts, chart.js, or shadcn/radix charts)

export function FinancialSummaryCharts({ data, isLoading }: { data?: unknown; isLoading: boolean }) {
    const chartRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        // Animate chart entry with GSAP if needed
        // ...
    }, [data]);

    if (isLoading) return <div className="h-48 flex items-center justify-center">Loading charts...</div>;
    if (!data) return <div className="h-48 flex items-center justify-center text-muted-foreground">No data</div>;

    return (
        <motion.div ref={chartRef} className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 w-full")}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Example: Replace with actual chart components */}
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 shadow">
                <h2 className="font-semibold mb-2">Revenue by Status</h2>
                {/* <BarChart data={data.revenueByStatus} /> */}
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 shadow">
                <h2 className="font-semibold mb-2">Payments Trend</h2>
                {/* <LineChart data={data.paymentsTrend} /> */}
            </div>
        </motion.div>
    );
}
