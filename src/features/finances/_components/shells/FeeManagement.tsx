"use client";

import { useFeeSetupStore } from "@/store/dashboard/feeSetupStore";
import { SetupStepper } from "../SetupStepper";
import { FeeStructureManager } from "../FeeStructureManager";
import { GenerateFeeAccountsButton } from "../GenerateFeeAccountsButton";
import { FreshersFeeManager } from "../FreshersFeeManager";
import { OtherFeesManager } from "../OtherFeesManager";
import { BookOpen, GraduationCap, LayoutDashboard } from "lucide-react";
import Tabs from "@/components/custom/Tabs";

interface FeeManagementPageProps {
   canManage?: boolean;
   canConfigure?: boolean;
}

export default function FeeManagementPage({ canManage = false, canConfigure = false }: FeeManagementPageProps) {
   const { currentStep } = useFeeSetupStore();

   // If user doesn't have permission, show nothing
   if (!canManage && !canConfigure) return null;

   const tabs = [
      { key: "freshers-fees", label: "Freshers Fees", icon: <LayoutDashboard size={16} /> },
      { key: "tuition-fees", label: "Tuition Fees", icon: <BookOpen size={16} />, badge: 3 },
      { key: "other-fees", label: "Other Fees", icon: <GraduationCap size={16} /> },
   ];

   return (
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
         {/* Page title */}
         <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
               Fee Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
               Set up academic sessions, semesters, fee structures, and generate
               student fee accounts.
            </p>
         </div>

         <div className="container py-8">
            <Tabs tabs={tabs} defaultTab="freshers-fees" onChange={(key) => console.log(key)}>
               {(activeTab) => (
                  <div>
                     {activeTab === "freshers-fees" && (
                        <FreshersFeeManager canManage={canManage} canConfigure={canConfigure} />
                     )}
                     {activeTab === "tuition-fees" && (
                        <div>
                           {/* Stepper */}
                           <SetupStepper />

                           {/* Step content - only show if user can manage */}
                           {currentStep === "fee-structures" && (
                              <FeeStructureManager canManage={canManage} canConfigure={canConfigure} />
                           )}
                           {currentStep === "generate" && canManage && (
                              <GenerateFeeAccountsButton />
                           )}
                        </div>
                     )}
                     {activeTab === "other-fees" && (
                        <OtherFeesManager canManage={canManage} canConfigure={canConfigure} />
                     )}
                  </div>
               )}
            </Tabs>
         </div>
      </div>
   );
}