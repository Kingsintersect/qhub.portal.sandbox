import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ConfirmationModal } from './ConfirmationModal';
import { updateAdmissionStatus } from '../admission-api';
import {
    PartyPopper,
    CheckCircle,
    BookOpen,
    CreditCard,
    GraduationCap,
    FileText,
    Loader2,
    AlertCircle,
} from 'lucide-react';

export const CongratulationsCard = ({ email, accademic_details }: { email: string | null, accademic_details: Record<string, unknown> }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('IN_PROGRESS');
    const { program, active_session, reference, admission_date } = accademic_details;

    const handleConfirmAcknowledgment = async () => {
        if (!email) {
            setError('Email is required to proceed.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await updateAdmissionStatus({ status: 'ADMITTED', email: email });

            if (result.success) {
                setStatus('ADMITTED');
                setShowConfirmation(false);

                setTimeout(() => {
                    router.push('/admission/success');
                }, 2000);
            } else {
                throw new Error(result.error || 'Failed to update admission status');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            console.error('Error updating admission status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string | undefined | null): string => {
        if (!dateString) {
            const date = new Date();
            return date.toISOString().split('T')[0];
        }
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const nextSteps = [
        { icon: CheckCircle, text: 'Accept your admission offer by clicking the button below' },
        { icon: FileText, text: 'Submit required documents (if not already done) for verification' },
        { icon: CreditCard, text: 'Proceed to pay your acceptance fee' },
        { icon: GraduationCap, text: 'Proceed to pay your tuition fee (to receive your REG NUMBER)' },
    ];

    return (
        <>
            <Card className="relative mb-6 overflow-hidden border-border/50 shadow-lg">
                {/* Gradient top bar */}
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-400/40 via-emerald-500 to-emerald-400/40" />

                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/10 p-2.5 dark:bg-emerald-500/20">
                            <PartyPopper className="size-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Congratulations! 🎉</CardTitle>
                            <CardDescription>
                                You have been selected for admission to our university!
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Admission Details */}
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 dark:bg-primary/10">
                        <h3 className="mb-3 text-sm font-semibold text-foreground">Admission Details</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Program</p>
                                <p className="text-sm font-medium text-foreground">{program as string ?? 'Bachelor of Computer Science'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Intake Session</p>
                                <p className="text-sm font-medium text-foreground">{active_session as string ?? '2025/2026'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Student ID</p>
                                <p className="font-mono text-sm font-medium text-foreground">{reference as string ?? 'STU20240001'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Admission Date</p>
                                <p className="text-sm font-medium text-foreground">
                                    {formatDate(admission_date as string | undefined)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Next Steps */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-foreground">Next Steps</h3>
                        <ul className="space-y-3">
                            {nextSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    {/* Action Button */}
                    <div className="flex flex-col items-center gap-3">
                        <Button
                            onClick={() => setShowConfirmation(true)}
                            disabled={isLoading || status === 'ADMITTED'}
                            size="lg"
                            className="w-full gap-2 sm:w-auto"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Processing…
                                </>
                            ) : status === 'ADMITTED' ? (
                                <>
                                    <CheckCircle className="size-4" />
                                    Admission Accepted ✓
                                </>
                            ) : (
                                <>
                                    <BookOpen className="size-4" />
                                    Accept Admission Offer
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 dark:bg-destructive/10">
                                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                                <div>
                                    <p className="text-sm font-medium text-destructive">{error}</p>
                                    <button
                                        onClick={() => setError(null)}
                                        className="mt-1 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="text-center text-xs text-muted-foreground">
                            By accepting this offer, you agree to the terms and conditions of admission
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <ConfirmationModal
                    isOpen={showConfirmation}
                    onClose={() => setShowConfirmation(false)}
                    onConfirm={handleConfirmAcknowledgment}
                    isLoading={isLoading}
                />
            )}
        </>
    );
};
