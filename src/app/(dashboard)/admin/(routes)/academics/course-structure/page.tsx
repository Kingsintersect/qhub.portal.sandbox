"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCourseStructureStore } from "@/store/dashboard/courseStructureStore";
import { SetupStepper } from "./components/SetupStepper";
import { FacultyManager } from "./components/FacultyManager";
import { DepartmentManager } from "./components/DepartmentManager";
import { LevelManager } from "./components/LevelManager";
import { CurriculumSemesterManager } from "./components/CurriculumSemesterManager";

const stepContent = {
   faculties: FacultyManager,
   departments: DepartmentManager,
   levels: LevelManager,
   semesters: CurriculumSemesterManager,
} as const;

export default function CourseStructurePage() {
   const { currentStep } = useCourseStructureStore();
   const StepComponent = stepContent[currentStep];

   return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
         {/* Page title */}
         <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
         >
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
               Course Structure
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
               Manage faculties, departments, levels, and semesters.
            </p>
         </motion.div>

         {/* Stepper */}
         <SetupStepper />

         {/* Step content with animated transitions */}
         <AnimatePresence mode="wait">
            <motion.div
               key={currentStep}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.25, ease: "easeInOut" }}
            >
               <StepComponent />
            </motion.div>
         </AnimatePresence>
      </div>
   );
}
