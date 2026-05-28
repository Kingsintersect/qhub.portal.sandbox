"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
   useFeeStructures,
   usePrograms,
   useCreateFeeStructure,
   useDeleteFeeStructure,
} from "../hooks/useFeeStructures";
import { useFeeSetupStore } from "@/store/dashboard/feeSetupStore";
import type { CreateFeeStructurePayload } from "@/types/school";
import { feeStructureSchema, type FeeStructureFormValues } from "@/schemas/school.schema";

import {
   Card,
   CardHeader,
   CardTitle,
   CardDescription,
   CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "./EmptyState";
import {
   DollarSign,
   Plus,
   Trash2,
   ArrowRight,
   ArrowLeft,
   Loader2,
} from "lucide-react";
import { useAcademicSessions } from "@/hooks/useAcademicSessions";

interface FeeStructureManagerProps {
   canManage?: boolean;
   canConfigure?: boolean;
}

const LEVEL_OPTIONS = [100, 200, 300, 400, 500, 600, 700];

export function FeeStructureManager({ canManage = false, canConfigure = false }: FeeStructureManagerProps) {
   const { selectedSessionId, selectedSessionName, setCurrentStep } =
      useFeeSetupStore();

   const { data: feeStructures, isLoading } =
      useFeeStructures(selectedSessionId);
   const { data: sessions, isLoading: isLoadingSessions } = useAcademicSessions();
   const { data: programs } = usePrograms();
   const createFee = useCreateFeeStructure();
   const deleteFee = useDeleteFeeStructure(selectedSessionId!);

   const [showForm, setShowForm] = useState(false);
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<FeeStructureFormValues>({
      resolver: zodResolver(feeStructureSchema),
      defaultValues: {
         academic_session_id: "",
         program_id: "",
         level: 100,
         total_amount: 0,
         description: "",
      },
   });

   const onSubmit = async (data: FeeStructureFormValues) => {
      const payload: CreateFeeStructurePayload = {
         semester_id: "",
         ...data,
      };
      await createFee.mutateAsync(payload);
      reset();
      setShowForm(false);
   };

   const sessionMap = new Map(sessions?.map((s) => [s.id, s.name]) ?? []);
   const programMap = new Map(programs?.map((p) => [p.id, p.name]) ?? []);

   const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("en-NG", {
         style: "currency",
         currency: "NGN",
         minimumFractionDigits: 0,
      }).format(amount);

   if (isLoading) {
      return (
         <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-primary" />
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep("fee-structures")}
                  title="Back to fee structures"
               >
                  <ArrowLeft className="size-4" />
               </Button>
               <div>
                  <h2 className="text-lg font-semibold text-foreground">
                     Fee Structures
                  </h2>
                  <p className="text-sm text-muted-foreground">
                     Session:{" "}
                     <span className="font-medium text-foreground">
                        {selectedSessionName}
                     </span>
                  </p>
               </div>
            </div>
            {canManage && (
               <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowForm(!showForm)}>
                     <Plus className="size-4" data-icon="inline-start" />
                     Add Fee
                  </Button>
                  <Button
                     onClick={() => setCurrentStep("generate")}
                     disabled={!feeStructures?.length}
                  >
                     Next: Generate Accounts
                     <ArrowRight className="size-4" data-icon="inline-end" />
                  </Button>
               </div>
            )}
         </div>

         {/* Create Form - only if can manage */}
         {showForm && canManage && (
            <Card>
               <CardHeader>
                  <CardTitle>Add Fee Structure</CardTitle>
                  <CardDescription>
                     Set the fee amount for a specific program, level, and semester.
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                     <div className="space-y-1.5">
                        <Label htmlFor="academic_session_id">Academic Session</Label>
                        <select
                           id="academic_session_id"
                           {...register("academic_session_id")}
                           aria-invalid={!!errors.academic_session_id}
                           className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive"
                        >
                           <option value="">Select Academic Session</option>
                           {sessions
                              ?.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                              .map((sem) => (
                                 <option key={sem.id} value={sem.id}>
                                    {sem.name}
                                 </option>
                              ))}
                        </select>
                        {errors.academic_session_id && (
                           <p className="text-sm text-destructive">{errors.academic_session_id.message}</p>
                        )}
                     </div>

                     <div className="space-y-1.5">
                        <Label htmlFor="program_id">Program</Label>
                        <select
                           id="program_id"
                           {...register("program_id")}
                           aria-invalid={!!errors.program_id}
                           className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive"
                        >
                           <option value="">Select program</option>
                           {programs?.map((prog) => (
                              <option key={prog.id} value={prog.id}>
                                 {prog.name}
                              </option>
                           ))}
                        </select>
                        {errors.program_id && (
                           <p className="text-sm text-destructive">{errors.program_id.message}</p>
                        )}
                     </div>

                     <div className="space-y-1.5">
                        <Label htmlFor="level">Level</Label>
                        <select
                           id="level"
                           {...register("level", { valueAsNumber: true })}
                           aria-invalid={!!errors.level}
                           className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive"
                        >
                           {LEVEL_OPTIONS.map((lvl) => (
                              <option key={lvl} value={lvl}>
                                 {lvl} Level
                              </option>
                           ))}
                        </select>
                        {errors.level && (
                           <p className="text-sm text-destructive">{errors.level.message}</p>
                        )}
                     </div>

                     <div className="space-y-1.5">
                        <Label htmlFor="total_amount">Total Amount (₦)</Label>
                        <Input
                           id="total_amount"
                           type="number"
                           min={0}
                           step={1000}
                           placeholder="150000"
                           aria-invalid={!!errors.total_amount}
                           {...register("total_amount", { valueAsNumber: true })}
                        />
                        {errors.total_amount && (
                           <p className="text-sm text-destructive">{errors.total_amount.message}</p>
                        )}
                     </div>

                     <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                           id="description"
                           placeholder="Fresh student fees — Computer Science, 100 Level"
                           {...register("description")}
                        />
                     </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                     <Button variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                     </Button>
                     <Button onClick={handleSubmit(onSubmit)} disabled={createFee.isPending}>
                        {createFee.isPending && (
                           <Loader2
                              className="size-4 animate-spin"
                              data-icon="inline-start"
                           />
                        )}
                        Add Fee Structure
                     </Button>
                  </div>
               </CardContent>
            </Card>
         )}

         {/* Fee Structure Table - delete button only if can manage */}
         {!feeStructures?.length && !showForm ? (
            <EmptyState
               icon={DollarSign}
               title="No fee structures configured"
               description="Define how much each program/level pays per semester."
               action={
                  canManage ? (
                     <Button onClick={() => setShowForm(true)}>
                        <Plus className="size-4" data-icon="inline-start" />
                        Add First Fee Structure
                     </Button>
                  ) : undefined
               }
            />
         ) : (
            <Card>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-border bg-muted/50">
                              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                 Academic Session
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                 Program
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                 Level
                              </th>
                              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                 Amount
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                 Description
                              </th>
                              {canManage && (
                                 <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                                    Actions
                                 </th>
                              )}
                           </tr>
                        </thead>
                        <tbody>
                           {feeStructures?.map((fee) => (
                              <tr
                                 key={fee.id}
                                 className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                              >
                                 <td className="px-4 py-3">
                                    {sessionMap.get(fee.academic_session_id) ?? fee.academic_session_id}
                                 </td>
                                 <td className="px-4 py-3">
                                    {programMap.get(fee.program_id) ?? fee.program_id}
                                 </td>
                                 <td className="px-4 py-3">{fee.level} Level</td>
                                 <td className="px-4 py-3 text-right font-medium">
                                    {formatCurrency(fee.total_amount)}
                                 </td>
                                 <td className="px-4 py-3 text-muted-foreground">
                                    {fee.description || "—"}
                                 </td>
                                 {canManage && (
                                    <td className="px-4 py-3 text-center">
                                       <Button
                                          variant="destructive"
                                          size="icon-xs"
                                          onClick={() => deleteFee.mutate(fee.id)}
                                       >
                                          <Trash2 className="size-3.5" />
                                       </Button>
                                    </td>
                                 )}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
   );
}