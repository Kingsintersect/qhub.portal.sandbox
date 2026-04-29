"use client";

import { useState } from "react";
// import { useAcademicSessions } from "../../hooks/useAcademicSessions";
import {
  useAdmissionCycles,
  useCreateAdmissionCycle,
  useUpdateAdmissionCycle,
  useDeleteAdmissionCycle,
  useUpdateAdmissionStatus,
} from "./hooks/useAdmissionCycles";
import { useQuery } from "@tanstack/react-query";
import { feeManagementQueryOptions } from "@/services/feeManagementApi";

import type { AdmissionCycle, AdmissionStatus } from "@/types/school";
import type { AdmissionCycleFormValues } from "@/schemas/school.schema";

import { AdmissionCycleForm } from "./components/AdmissionCycleForm";
import { AdmissionCycleCard } from "./components/AdmissionCycleCard";
import { RequirementsManager } from "./components/RequirementsManager";
import { EmptyState } from "./components/EmptyState";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Plus,
  Loader2,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAcademicSessions } from "@/hooks/useAcademicSessions";

export default function AdmissionsPage() {
  // ── Shared data ──────────────────────────
  const { data: sessions, isLoading: isLoadingSessions } = useAcademicSessions();
  const { data: programs } = useQuery({
    ...feeManagementQueryOptions.programs(),
    staleTime: 1000 * 60 * 30,
  });

  // ── Local state ──────────────────────────
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCycle, setEditingCycle] = useState<AdmissionCycle | null>(null);
  const [managingCycleId, setManagingCycleId] = useState<string | null>(null);

  // ── Data hooks ───────────────────────────
  const { data: cycles, isLoading: isLoadingCycles } = useAdmissionCycles(
    selectedSessionId || null
  );
  const createCycle = useCreateAdmissionCycle();
  const updateCycle = useUpdateAdmissionCycle(selectedSessionId);
  const deleteCycle = useDeleteAdmissionCycle(selectedSessionId);
  const updateStatus = useUpdateAdmissionStatus(selectedSessionId);

  // ── Handlers ─────────────────────────────
  const handleCreate = () => {
    setEditingCycle(null);
    setShowForm(true);
  };

  const handleEdit = (cycle: AdmissionCycle) => {
    setEditingCycle(cycle);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCycle.mutateAsync(id);
    toast.success("Admission cycle deleted");
  };

  const handleToggleStatus = async (id: string, status: AdmissionStatus) => {
    await updateStatus.mutateAsync({ id, status });
    toast.success(
      status === "open" ? "Admissions opened" : "Admissions closed"
    );
  };

  const handleFormSubmit = async (data: AdmissionCycleFormValues) => {
    if (editingCycle) {
      await updateCycle.mutateAsync({
        id: editingCycle.id,
        payload: { ...data, status: editingCycle.status },
      });
      toast.success("Admission cycle updated");
    } else {
      await createCycle.mutateAsync({
        ...data,
        status: "draft",
      });
      toast.success("Admission cycle created");
    }
    setShowForm(false);
    setEditingCycle(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCycle(null);
  };

  const getSessionName = (sessionId: string) =>
    sessions?.find((s) => s.id === sessionId)?.name ?? sessionId;

  const isPending =
    createCycle.isPending || updateCycle.isPending;

  // ── Drilled-in: Requirements view ────────
  if (managingCycleId) {
    const cycle = cycles?.find((c) => c.id === managingCycleId);
    return (
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => setManagingCycleId(null)}
        >
          <ArrowLeft className="size-3.5" data-icon="inline-start" />
          Back to Admission Cycles
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Requirements — {getSessionName(cycle?.academic_session_id ?? "")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set minimum entry requirements for each program or for all programs.
          </p>
        </div>

        <RequirementsManager
          cycleId={managingCycleId}
          programs={programs ?? []}
        />
      </div>
    );
  }

  // ── Main view ────────────────────────────
  return (
    <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admissions Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open and close admission windows, configure application settings,
          and manage entry requirements.
        </p>
      </div>

      {/* Session selector + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                <Label htmlFor="adm-session">Academic Session</Label>
              </div>
              <select
                id="adm-session"
                value={selectedSessionId}
                onChange={(e) => {
                  setSelectedSessionId(e.target.value);
                  setShowForm(false);
                  setEditingCycle(null);
                }}
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a session</option>
                {sessions
                  ?.sort(
                    (a, b) =>
                      new Date(b.start_date).getTime() -
                      new Date(a.start_date).getTime()
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.is_active ? "(Active)" : ""}
                    </option>
                  ))}
              </select>
              {isLoadingSessions && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        {selectedSessionId && !showForm && (
          <Button onClick={handleCreate}>
            <Plus className="size-4" data-icon="inline-start" />
            New Admission Cycle
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {/* No session selected */}
        {!selectedSessionId && (
          <EmptyState
            icon={CalendarDays}
            title="Select a session"
            description="Choose an academic session above to view or create admission cycles."
          />
        )}

        {/* Loading */}
        {selectedSessionId && isLoadingCycles && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}

        {/* Create / Edit form */}
        {selectedSessionId && showForm && (
          <AdmissionCycleForm
            sessions={sessions ?? []}
            editingCycle={editingCycle}
            isPending={isPending}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        )}

        {/* Cycle cards */}
        {selectedSessionId && !isLoadingCycles && !showForm && (
          <>
            {cycles && cycles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {cycles.map((cycle) => (
                  <div key={cycle.id} className="space-y-2">
                    <AdmissionCycleCard
                      cycle={cycle}
                      sessionName={getSessionName(
                        cycle.academic_session_id
                      )}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        setManagingCycleId(cycle.id)
                      }
                    >
                      <ClipboardList className="size-3.5" data-icon="inline-start" />
                      Manage Requirements
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No admission cycles"
                description="Create an admission cycle to start accepting applications for this session."
                action={
                  <Button onClick={handleCreate}>
                    <Plus className="size-4" data-icon="inline-start" />
                    Create First Cycle
                  </Button>
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
