'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { CongratulationsCard } from './components/CongratulationsCard';
import { InformationSection } from './components/InformationSection';


export default function ConfirmAdmissionPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const program = searchParams.get('program');
    const reference = searchParams.get('reference');
    const admission_date = searchParams.get('admission_date');
    const active_session = searchParams.get('active_session');
    const accademic_details = { program, reference, admission_date, active_session };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 space-y-1"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5 dark:bg-primary/20">
                        <GraduationCap className="size-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Confirm Admission
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review and accept your admission offer
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Congratulations Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            >
                <CongratulationsCard email={email} accademic_details={accademic_details} />
            </motion.div>

            {/* Information Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            >
                <InformationSection />
            </motion.div>
        </div>
    );
}