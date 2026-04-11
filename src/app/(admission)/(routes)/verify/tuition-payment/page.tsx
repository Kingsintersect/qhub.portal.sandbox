"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PaymentVerificationView } from "../../../components";
import { useVerifyTuitionPayment } from "../../../hooks/useAdmissionQueries";
import { Skeleton } from "@/components/ui/skeleton";

function VerifyTuitionPaymentContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get("ref") ?? searchParams.get("transRef") ?? "";

    const { data, isLoading, error } = useVerifyTuitionPayment(reference);

    return (
        <PaymentVerificationView
            title="Verifying Tuition Payment"
            isLoading={isLoading}
            error={error}
            data={data}
            redirectTo="/process-admission"
            countdownSeconds={10}
        />
    );
}

export default function VerifyTuitionPaymentPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="space-y-4 text-center">
                        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                        <Skeleton className="mx-auto h-4 w-48" />
                    </div>
                </div>
            }
        >
            <VerifyTuitionPaymentContent />
        </Suspense>
    );
}