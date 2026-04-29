"use client";

import { useFeeSetupStore } from "@/store/dashboard/feeSetupStore";
import { SetupStepper } from "./components/SetupStepper";
import { FeeStructureManager } from "./components/FeeStructureManager";
import { GenerateFeeAccountsButton } from "./components/GenerateFeeAccountsButton";
import { FreshersFeeManager } from "./components/FreshersFeeManager";
import { OtherFeesManager } from "./components/OtherFeesManager";
import { BookOpen, GraduationCap, LayoutDashboard } from "lucide-react";
import Tabs from "@/components/custom/Tabs";

export default function FeeManagementPage() {
    const { currentStep } = useFeeSetupStore();

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
                            {activeTab === "freshers-fees" && <FreshersFeeManager />}
                            {activeTab === "tuition-fees" && (
                                <div>
                                    {/* Stepper */}
                                    <SetupStepper />

                                    {/* Step content */}
                                    {currentStep === "fee-structures" && <FeeStructureManager />}
                                    {currentStep === "generate" && <GenerateFeeAccountsButton />}
                                </div>
                            )}
                            {activeTab === "other-fees" && <OtherFeesManager />}
                        </div>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
