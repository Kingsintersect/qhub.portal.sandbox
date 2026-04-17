"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
   Building2,
   GitBranch,
   Layers,
   BookOpen,
   Check,
} from "lucide-react";
import {
   useCourseStructureStore,
   type CourseStructureStep,
} from "@/store/dashboard/courseStructureStore";

const STEPS: {
   key: CourseStructureStep;
   label: string;
   description: string;
   icon: React.ElementType;
}[] = [
      {
         key: "faculties",
         label: "Faculties",
         description: "Create or select a faculty",
         icon: Building2,
      },
      {
         key: "departments",
         label: "Departments",
         description: "Manage departments",
         icon: GitBranch,
      },
      {
         key: "levels",
         label: "Levels",
         description: "Define academic levels",
         icon: Layers,
      },
      {
         key: "semesters",
         label: "Semesters",
         description: "Configure semesters",
         icon: BookOpen,
      },
   ];

function getStepIndex(step: CourseStructureStep) {
   return STEPS.findIndex((s) => s.key === step);
}

export function SetupStepper() {
   const {
      currentStep,
      setCurrentStep,
      selectedFacultyId,
      selectedDepartmentId,
      selectedLevelId,
   } = useCourseStructureStore();
   const currentIdx = getStepIndex(currentStep);

   const canNavigate = (idx: number): boolean => {
      if (idx === 0) return true;
      if (idx === 1) return !!selectedFacultyId;
      if (idx === 2) return !!selectedDepartmentId;
      if (idx === 3) return !!selectedLevelId;
      return false;
   };

   return (
      <nav className="mb-8">
         <ol className="flex items-center gap-2">
            {STEPS.map((step, idx) => {
               const isActive = idx === currentIdx;
               const isCompleted = idx < currentIdx;
               const isClickable = isCompleted || canNavigate(idx);

               const Icon = step.icon;

               return (
                  <li key={step.key} className="flex flex-1 items-center">
                     <button
                        type="button"
                        disabled={!isClickable}
                        onClick={() => isClickable && setCurrentStep(step.key)}
                        className={cn(
                           "group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                           isActive && "bg-primary/10",
                           isClickable && !isActive && "hover:bg-muted",
                           !isClickable && "cursor-not-allowed opacity-50"
                        )}
                     >
                        <span
                           className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              isCompleted &&
                              "border-primary bg-primary text-primary-foreground",
                              isActive && "border-primary bg-primary/10 text-primary",
                              !isCompleted &&
                              !isActive &&
                              "border-border bg-background text-muted-foreground"
                           )}
                        >
                           {isCompleted ? (
                              <motion.span
                                 key="check"
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              >
                                 <Check className="size-5" />
                              </motion.span>
                           ) : (
                              <Icon className="size-5" />
                           )}
                        </span>

                        <div className="hidden min-w-0 sm:block">
                           <p
                              className={cn(
                                 "truncate text-sm font-medium",
                                 isActive
                                    ? "text-primary"
                                    : isCompleted
                                       ? "text-foreground"
                                       : "text-muted-foreground"
                              )}
                           >
                              {step.label}
                           </p>
                           <p className="truncate text-xs text-muted-foreground">
                              {step.description}
                           </p>
                        </div>
                     </button>

                     {idx < STEPS.length - 1 && (
                        <div className="mx-1 hidden h-0.5 w-8 shrink-0 bg-border sm:block">
                           <motion.div
                              className="h-full bg-primary"
                              initial={{ width: "0%" }}
                              animate={{ width: idx < currentIdx ? "100%" : "0%" }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                           />
                        </div>
                     )}
                  </li>
               );
            })}
         </ol>
      </nav>
   );
}
