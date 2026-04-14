"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadgeWidget } from "./StatusBadgeWidget";
import { useDevSimulate } from "../hooks/useAdmissionQueries";
import { Search, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import type { StepSectionProps } from "../types/admission";

export function AdmissionStatusSection({ student, onRefresh }: StepSectionProps) {
    const { simulateOffered } = useDevSimulate();
    const isPending = student.admission_status === "pending";
    const isOffered = student.admission_status === "offered";
    const isRejected = student.admission_status === "rejected";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Card className="relative overflow-hidden border-border/50 shadow-lg">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-2.5 dark:bg-primary/20">
                            <Search className="size-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Admission Status</CardTitle>
                            <CardDescription>
                                Step 3 — Your application is being reviewed by the admissions officer
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadgeWidget label="Application Submitted" status="success" />
                        <StatusBadgeWidget
                            label={
                                isPending
                                    ? "Under Review"
                                    : isOffered
                                        ? "Admission Offered!"
                                        : isRejected
                                            ? "Application Rejected"
                                            : student.admission_status
                            }
                            status={
                                isPending
                                    ? "pending"
                                    : isOffered
                                        ? "success"
                                        : isRejected
                                            ? "failed"
                                            : "info"
                            }
                        />
                    </div>

                    {/* Pending state */}
                    {isPending && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 dark:bg-amber-500/10"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <Clock className="size-12 text-amber-500" />
                            </motion.div>
                            <div className="space-y-1 text-center">
                                <p className="text-sm font-semibold text-foreground">
                                    Awaiting Review
                                </p>
                                <p className="max-w-sm text-xs text-muted-foreground">
                                    Your application has been submitted and is currently being reviewed
                                    by the admissions officer. You will receive an email notification
                                    once a decision has been made.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
                                <RefreshCw className="size-3.5" />
                                Check for Updates
                            </Button>
                        </motion.div>
                    )}

                    {/* Offered state */}
                    {isOffered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 dark:bg-emerald-500/10"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                                <CheckCircle className="size-12 text-emerald-500" />
                            </motion.div>
                            <div className="space-y-1 text-center">
                                <p className="text-lg font-bold text-foreground">
                                    🎉 Congratulations!
                                </p>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    You have been offered admission! Please check your email at{" "}
                                    <span className="font-medium text-foreground">
                                        {student.email}
                                    </span>{" "}
                                    to accept the offer. Once accepted, return here to continue.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
                                <RefreshCw className="size-3.5" />
                                I&apos;ve Accepted — Refresh
                            </Button>
                        </motion.div>
                    )}

                    {/* Rejected state */}
                    {isRejected && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8"
                        >
                            <XCircle className="size-12 text-destructive" />
                            <div className="space-y-1 text-center">
                                <p className="text-sm font-semibold text-foreground">
                                    Application Not Successful
                                </p>
                                <p className="max-w-sm text-xs text-muted-foreground">
                                    Unfortunately, your application was not successful this time.
                                    Please contact the admissions office for more information.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Dev toolbar */}
                    {process.env.NODE_ENV === "development" && isPending && (
                        <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                🛠 Dev Controls
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => simulateOffered.mutate()}
                                disabled={simulateOffered.isPending}
                                className="gap-1.5 text-xs"
                            >
                                {simulateOffered.isPending ? (
                                    <Loader2 className="size-3 animate-spin" />
                                ) : (
                                    <CheckCircle className="size-3" />
                                )}
                                Simulate: Offer Admission
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}