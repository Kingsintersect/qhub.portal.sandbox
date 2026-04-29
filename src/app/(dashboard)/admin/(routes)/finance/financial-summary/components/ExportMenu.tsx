"use client";

import { DownloadIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuTrigger,
   DropdownMenuContent,
   DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function ExportMenu({ onExport }: { onExport: (type: string) => void }) {
   const handleExport = (type: string) => {
      // Debug log to verify click
      // eslint-disable-next-line no-console
      console.log("Export triggered for type:", type);
      onExport(type);
   };
   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
               <DownloadIcon className="w-4 h-4" /> Export
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent
            asChild
            align="end"
            className="w-44"
         >
            <AnimatePresence>
               <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.94 }}
                  transition={{ duration: 0.17, ease: "easeOut" }}
               >
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                     Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                     Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                     Export as Excel
                  </DropdownMenuItem>
               </motion.div>
            </AnimatePresence>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
