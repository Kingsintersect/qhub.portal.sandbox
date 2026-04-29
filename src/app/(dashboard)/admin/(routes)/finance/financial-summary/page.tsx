"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FinancialSummaryCharts } from "./components/FinancialSummaryCharts";
import { TransactionTable } from "./components/TransactionTable";
import { ExportMenu } from "./components/ExportMenu";
import { useFinancialSummary } from "./hooks/useFinancialSummary";
import { Filters } from "./components/Filters";
import { GroupByMenu } from "./components/GroupByMenu";
import { InvoiceModal } from "./components/InvoiceModal";
import { cn } from "@/lib/utils";

export default function FinancialSummaryPage() {
   const {
      data,
      isLoading,
      filters,
      setFilters,
      groupBy,
      setGroupBy,
      exportData,
      openInvoice,
      invoiceModal,
      closeInvoiceModal,
      // pagination,
      // setPagination,
   } = useFinancialSummary();

   // Framer Motion variants
   const containerVariants = {
      hidden: { opacity: 0, y: 32 },
      visible: {
         opacity: 1,
         y: 0,
         transition: { when: "beforeChildren", staggerChildren: 0.17 },
      },
      exit: { opacity: 0, y: 32 },
   };

   const sectionVariants = {
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.5 } },
      exit: { opacity: 0, y: 24 },
   };

   return (
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
         <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
               "p-6 space-y-6 w-full min-h-[80vh]",
               "bg-white dark:bg-neutral-900 rounded-xl shadow-lg"
            )}
         >
            <motion.div variants={sectionVariants}>
               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <motion.h1
                     className="text-2xl font-bold"
                     initial={{ opacity: 0, x: -16 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ type: "spring", duration: 0.6 }}
                  >
                     Financial Summary
                  </motion.h1>
                  <div className="flex gap-2">
                     <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        <GroupByMenu groupBy={groupBy} setGroupBy={setGroupBy} />
                     </motion.div>
                     <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        <ExportMenu onExport={exportData} />
                     </motion.div>
                  </div>
               </div>
            </motion.div>

            <motion.div variants={sectionVariants}>
               <Filters filters={filters} setFilters={setFilters} />
            </motion.div>

            <AnimatePresence>
               <motion.div
                  variants={sectionVariants}
                  key={isLoading ? "loading-charts" : "charts"}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
               >
                  <FinancialSummaryCharts data={data?.charts} isLoading={isLoading} />
               </motion.div>
            </AnimatePresence>

            <AnimatePresence>
               <motion.div
                  variants={sectionVariants}
                  key={isLoading ? "loading-table" : "table"}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
               >
                  <TransactionTable
                     transactions={data?.transactions ?? []}
                     isLoading={isLoading}
                     onInvoiceClick={openInvoice}
                  />
               </motion.div>
            </AnimatePresence>

            {/* AnimatePresence lets us animate the modal mounting/unmounting */}
            <AnimatePresence>
               {invoiceModal.open && (
                  <motion.div
                     key="invoice-modal"
                     initial={{ opacity: 0, scale: 0.92 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.92 }}
                     transition={{ duration: 0.25 }}
                     className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur"
                  >
                     <InvoiceModal
                        open={invoiceModal.open}
                        invoice={invoiceModal.invoice}
                        onClose={closeInvoiceModal}
                     />
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>
      </div>
   );
}
