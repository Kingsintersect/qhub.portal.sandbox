"use client";

import { ShieldOff, LayoutGrid, List } from "lucide-react";
import { PermissionGate } from "@/lib/permissions/PermissionGate";
import { Button } from "@/components/ui/button";
import { TimetableGrid } from "@/modules/timetable/components/TimetableGrid";
import { TimetableList } from "@/modules/timetable/components/TimetableList";
import { useMyTimetable } from "@/modules/timetable/hooks/useTimetable";
import { useTimetableUIStore } from "@/modules/timetable/store/useTimetableUIStore";
import type { TimetableSlot } from "@/modules/timetable/types/timetable.types";

export default function MyTimetablePage() {
   const { viewMode, setViewMode } = useTimetableUIStore();
   const { data, isLoading } = useMyTimetable();
   const slots: TimetableSlot[] = Array.isArray(data)
      ? data
      : data
         ? Object.values(data).flat()
         : [];

   return (
      <PermissionGate
         require={{ resource: "timetable", action: "view.own" }}
         fallback={
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
               <ShieldOff size={40} className="opacity-40" />
               <p className="text-sm">You do not have permission to view your timetable.</p>
            </div>
         }
      >
         <div className="space-y-4">
            {/* View toggle */}
            <div className="flex items-center justify-between">
               <h1 className="text-lg font-semibold text-foreground">My Weekly Schedule</h1>
               <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                  <Button
                     variant={viewMode === "grid" ? "secondary" : "ghost"}
                     size="sm"
                     className="h-7 gap-1 px-2.5 text-xs"
                     onClick={() => setViewMode("grid")}
                  >
                     <LayoutGrid size={13} />
                     Grid
                  </Button>
                  <Button
                     variant={viewMode === "list" ? "secondary" : "ghost"}
                     size="sm"
                     className="h-7 gap-1 px-2.5 text-xs"
                     onClick={() => setViewMode("list")}
                  >
                     <List size={13} />
                     List
                  </Button>
               </div>
            </div>

            {/* Content */}
            {viewMode === "grid" ? (
               <TimetableGrid slots={slots} isLoading={isLoading} />
            ) : (
               <TimetableList slots={slots} isLoading={isLoading} />
            )}
         </div>
      </PermissionGate>
   );
}
