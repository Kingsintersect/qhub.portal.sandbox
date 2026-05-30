"use client";

import { motion } from "framer-motion";
import { Building, ShieldOff } from "lucide-react";
import { PermissionGate } from "@/lib/permissions/PermissionGate";
import { VenueAvailabilityChecker } from "@/modules/timetable/components/VenueAvailabilityChecker";

export default function VenueCheckPage() {
    return (
        <PermissionGate
            require={{ resource: "timetable", action: "manage" }}
            fallback={
                <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
                    <ShieldOff size={40} className="opacity-40" />
                    <p className="text-sm">You do not have permission to check venue availability.</p>
                </div>
            }
        >
            <div className="space-y-6 p-6">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building size={18} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Venue Availability</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Check which time windows are free for a given venue and day
                        </p>
                    </div>
                </motion.div>

                <VenueAvailabilityChecker />
            </div>
        </PermissionGate>
    );
}
