"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ShieldOff } from "lucide-react";
import Link from "next/link";
import { SyncStatusTable } from "@/modules/assessments/components/sync-status-table";
import { PermissionGate } from "@/lib/permissions/PermissionGate";

export default function AdminAssessmentsSyncStatusPage() {
   return (
      <PermissionGate
         require={{ resource: "assessments", action: "sync" }}
         fallback={
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
               <ShieldOff size={40} className="opacity-40" />
               <p className="text-sm">You do not have permission to manage assessment sync.</p>
            </div>
         }
      >
         <div className="space-y-6 p-6">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: -8 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-3"
            >
               <Link
                  href="/admin/assessments"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
               >
                  <ArrowLeft size={13} /> Back to Assessments
               </Link>

               <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                     <h1 className="text-xl font-bold">Moodle Sync Status</h1>
                     <p className="text-xs text-muted-foreground mt-0.5">
                        Monitor and trigger assessment sync across all course offerings.
                     </p>
                  </div>
               </div>
            </motion.div>

            {/* Sync status table */}
            <SyncStatusTable />
         </div>
      </PermissionGate>
   );
}
