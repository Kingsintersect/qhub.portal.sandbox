// "use client";

// import { useState } from "react";
// import { useGenerateFeeAccounts } from "../hooks/useFeeAccounts";
// import { useFeeSetupStore } from "../store/feeSetupStore";

// import {
//     Card,
//     CardHeader,
//     CardTitle,
//     CardDescription,
//     CardContent,
//     CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//     Users,
//     ArrowLeft,
//     Loader2,
//     CheckCircle2,
//     AlertTriangle,
// } from "lucide-react";

// export function GenerateFeeAccountsButton() {
//     const { selectedSessionId, selectedSessionName, setCurrentStep } =
//         useFeeSetupStore();
//     const generateAccounts = useGenerateFeeAccounts();
//     const [result, setResult] = useState<{
//         success: boolean;
//         message: string;
//         count?: number;
//     } | null>(null);

//     const handleGenerate = async () => {
//         if (!selectedSessionId) return;
//         try {
//             const res = await generateAccounts.mutateAsync({
//                 academic_session_id: selectedSessionId,
//             });
//             setResult({
//                 success: true,
//                 message: res.message,
//                 count: res.generated_count,
//             });
//         } catch (err: unknown) {
//             setResult({
//                 success: false,
//                 message:
//                     err instanceof Error
//                         ? err.message
//                         : "Failed to generate fee accounts.",
//             });
//         }
//     };

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex items-center gap-3">
//                 <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => setCurrentStep("fee-structures")}
//                     title="Back to fee structures"
//                 >
//                     <ArrowLeft className="size-4" />
//                 </Button>
//                 <div>
//                     <h2 className="text-lg font-semibold text-foreground">
//                         Generate Student Fee Accounts
//                     </h2>
//                     <p className="text-sm text-muted-foreground">
//                         Session:{" "}
//                         <span className="font-medium text-foreground">
//                             {selectedSessionName}
//                         </span>
//                     </p>
//                 </div>
//             </div>

//             {/* Main Card */}
//             <Card className="mx-auto max-w-lg">
//                 <CardHeader className="text-center">
//                     <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
//                         <Users className="size-8 text-primary" />
//                     </div>
//                     <CardTitle className="mt-4">Ready to Generate</CardTitle>
//                     <CardDescription>
//                         This will match every enrolled student to their corresponding fee
//                         structure (by program &amp; level) and create a personal fee account
//                         for the{" "}
//                         <span className="font-medium text-foreground">
//                             {selectedSessionName}
//                         </span>{" "}
//                         session.
//                     </CardDescription>
//                 </CardHeader>

//                 <CardContent>
//                     {/* Info box */}
//                     <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
//                         <p className="font-medium text-foreground">What happens:</p>
//                         <ul className="mt-2 space-y-1.5 text-muted-foreground">
//                             <li className="flex items-start gap-2">
//                                 <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
//                                 Each student is matched to their program + level fee structure
//                             </li>
//                             <li className="flex items-start gap-2">
//                                 <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
//                                 A fee account is created with total_fee = sum of all semester
//                                 fees
//                             </li>
//                             <li className="flex items-start gap-2">
//                                 <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
//                                 Balance is set to the full amount, status = &quot;pending&quot;
//                             </li>
//                             <li className="flex items-start gap-2">
//                                 <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
//                                 Students who already have accounts will be skipped
//                             </li>
//                         </ul>
//                     </div>

//                     {/* Result */}
//                     {result && (
//                         <div
//                             className={`mt-4 flex items-start gap-3 rounded-lg border p-4 ${result.success
//                                     ? "border-primary/30 bg-primary/5"
//                                     : "border-destructive/30 bg-destructive/5"
//                                 }`}
//                         >
//                             {result.success ? (
//                                 <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
//                             ) : (
//                                 <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
//                             )}
//                             <div>
//                                 <p
//                                     className={`text-sm font-medium ${result.success ? "text-primary" : "text-destructive"
//                                         }`}
//                                 >
//                                     {result.success ? "Success!" : "Error"}
//                                 </p>
//                                 <p className="mt-0.5 text-sm text-muted-foreground">
//                                     {result.message}
//                                 </p>
//                                 {result.count !== undefined && (
//                                     <p className="mt-1 text-2xl font-bold text-foreground">
//                                         {result.count.toLocaleString()}{" "}
//                                         <span className="text-sm font-normal text-muted-foreground">
//                                             accounts generated
//                                         </span>
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </CardContent>

//                 <CardFooter className="justify-center">
//                     <Button
//                         size="lg"
//                         onClick={handleGenerate}
//                         disabled={generateAccounts.isPending}
//                         className="min-w-[200px]"
//                     >
//                         {generateAccounts.isPending ? (
//                             <>
//                                 <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
//                                 Generating…
//                             </>
//                         ) : (
//                             <>
//                                 <Users className="size-4" data-icon="inline-start" />
//                                 Generate Fee Accounts
//                             </>
//                         )}
//                     </Button>
//                 </CardFooter>
//             </Card>
//         </div>
//     );
// }


// RUNNING DUMMY DATA FROM HERE
"use client";

import { useState } from "react";
import { useGenerateFeeAccounts } from "../hooks/useFeeAccounts";
import { useFeeSetupStore } from "@/store/dashboard/feeSetupStore";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

export function GenerateFeeAccountsButton() {
    const { selectedSessionId, selectedSessionName, setCurrentStep } =
        useFeeSetupStore();
    const generateAccounts = useGenerateFeeAccounts();
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        count?: number;
    } | null>(null);

    const handleGenerate = async () => {
        if (!selectedSessionId) return;
        try {
            const res = await generateAccounts.mutateAsync({
                academic_session_id: selectedSessionId,
            });
            setResult({
                success: true,
                message: res.message,
                count: res.generated_count,
            });
        } catch (err: unknown) {
            setResult({
                success: false,
                message:
                    err instanceof Error
                        ? err.message
                        : "Failed to generate fee accounts.",
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentStep("fee-structures")}
                    title="Back to fee structures"
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Generate Student Fee Accounts
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Session:{" "}
                        <span className="font-medium text-foreground">
                            {selectedSessionName}
                        </span>
                    </p>
                </div>
            </div>

            {/* Main Card */}
            <Card className="mx-auto max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <Users className="size-8 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Ready to Generate</CardTitle>
                    <CardDescription>
                        This will match every enrolled student to their corresponding fee
                        structure (by program &amp; level) and create a personal fee account
                        for the{" "}
                        <span className="font-medium text-foreground">
                            {selectedSessionName}
                        </span>{" "}
                        session.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                        <p className="font-medium text-foreground">What happens:</p>
                        <ul className="mt-2 space-y-1.5 text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                Each student is matched to their program + level fee structure
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                A fee account is created with total_fee = sum of all semester
                                fees
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                Balance is set to the full amount, status =
                                &quot;pending&quot;
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                Students who already have accounts will be skipped
                            </li>
                        </ul>
                    </div>

                    {result && (
                        <div
                            className={`mt-4 flex items-start gap-3 rounded-lg border p-4 ${result.success
                                ? "border-primary/30 bg-primary/5"
                                : "border-destructive/30 bg-destructive/5"
                                }`}
                        >
                            {result.success ? (
                                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                            ) : (
                                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                            )}
                            <div>
                                <p
                                    className={`text-sm font-medium ${result.success ? "text-primary" : "text-destructive"
                                        }`}
                                >
                                    {result.success ? "Success!" : "Error"}
                                </p>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    {result.message}
                                </p>
                                {result.count !== undefined && (
                                    <p className="mt-1 text-2xl font-bold text-foreground">
                                        {result.count.toLocaleString()}{" "}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            accounts generated
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="justify-center">
                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        disabled={generateAccounts.isPending}
                        className="min-w-50"
                    >
                        {generateAccounts.isPending ? (
                            <>
                                <Loader2
                                    className="size-4 animate-spin"
                                    data-icon="inline-start"
                                />
                                Generating…
                            </>
                        ) : (
                            <>
                                <Users className="size-4" data-icon="inline-start" />
                                Generate Fee Accounts
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}