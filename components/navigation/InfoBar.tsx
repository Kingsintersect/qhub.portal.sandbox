'use client'
import React from 'react'
import { motion } from 'framer-motion'
// import ThemeToggle from '../ThemeToggle'

export default function InfoBar() {
    return (
        <motion.div
            className="info-bar w-full text-sm"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
        >
            <div className="bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-10">
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-2 text-xs text-theme/80">
                                <strong className="text-theme">University of Example — Admissions open</strong>
                                <span className="text-theme/70">| Apply for 2026 entry • Scholarships available</span>
                            </span>
                            <a className="text-xs underline text-theme/80 hover:text-primary transition-colors" href="/apply">Apply now</a>
                            <a className="text-xs underline text-theme/80 hover:text-primary transition-colors" href="/calendar">Academic Calendar</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block">
                                <form action="/search" className="relative">
                                    <label htmlFor="search" className="sr-only">Search</label>
                                    <input
                                        id="search"
                                        name="q"
                                        placeholder="Search courses, staff, services..."
                                        className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.03)] placeholder:text-theme/60 text-theme text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </form>
                            </div>

                            {/* <ThemeToggle /> */}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}