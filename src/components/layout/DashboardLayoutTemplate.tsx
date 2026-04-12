"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAppStore, useAppHydrated, useSidebarStore } from "@/store";

export default function DashboardLayoutTemplate({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useAppStore();
    const hydrated = useAppHydrated();
    const { mobileOpen, setMobileOpen } = useSidebarStore();
    const router = useRouter();

    useEffect(() => {
        if (hydrated && !isAuthenticated) {
            router.replace("/dev-login");
        }
    }, [hydrated, isAuthenticated, router]);

    if (!hydrated || !isAuthenticated) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex shrink-0 h-screen">
                <Sidebar />
            </div>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed left-0 top-0 bottom-0 z-40 lg:hidden"
                    >
                        <Sidebar />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
