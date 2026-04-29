"use client";

import { AnimatePresence, motion } from "framer-motion";
import Tabs from "@/components/custom/Tabs";
import { BookOpen, Link2 } from "lucide-react";
import { CourseList } from "./components/CourseList";
import { ProgramCourseManager } from "./components/ProgramCourseManager";

const tabs = [
   { key: "registry", label: "Course Registry", icon: <BookOpen size={14} /> },
   { key: "mapping", label: "Program Mapping", icon: <Link2 size={14} /> },
];

export default function CourseManagementPage() {
   return (
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
         <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
         >
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
               Course Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
               Create courses and assign them to academic programs.
            </p>
         </motion.div>

         <Tabs tabs={tabs} defaultTab="registry">
            {(activeTab) => (
               <AnimatePresence mode="wait">
                  <motion.div
                     key={activeTab}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                     {activeTab === "registry" && <CourseList />}
                     {activeTab === "mapping" && <ProgramCourseManager />}
                  </motion.div>
               </AnimatePresence>
            )}
         </Tabs>
      </div>
   );
}
