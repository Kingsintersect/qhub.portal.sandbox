'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import ThemeToggle from '../ThemeToggle'
import Logo from '@/components/branding/Logo'
import { roleDashboardPath, UserRole } from '@/config/nav.config'

export default function NavBar() {
    const [scrolled, setScrolled] = useState(false)
    const { data: session, status } = useSession()

    const isAuthenticated = status === 'authenticated'
    const role = session?.user?.role as UserRole | undefined
    const dashboardHref = role ? roleDashboardPath[role] : '/auth/signin'

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 40)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <AnimatePresence>
            <motion.nav
                role="navigation"
                initial={false}
                animate={{
                    y: 0,
                    boxShadow: scrolled ? '0 6px 30px rgba(0,0,0,0.6)' : '0 0px 0px rgba(0,0,0,0)',
                    background: scrolled ? 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))' : 'transparent',
                    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="sticky top-0 z-40 backdrop-blur-smooth sticky-nav"
            >
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Logo
                                href="/"
                                subtitle="Knowledge - Innovation - Service"
                                imageWidth={40}
                                imageHeight={40}
                                className="items-center"
                                imageClassName="h-10 w-10"
                                titleClassName="text-sm"
                                subtitleClassName="text-theme/70"
                            />
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <a className="text-sm hover:text-primary transition-colors" href="/about">About</a>
                            <a className="text-sm hover:text-primary transition-colors" href="/admissions">Admissions</a>
                            <a className="text-sm hover:text-primary transition-colors" href="/academics">Academics</a>
                            <a className="text-sm hover:text-primary transition-colors" href="/research">Research</a>
                            <a className="text-sm hover:text-primary transition-colors" href="/contact">Contact</a>
                        </div>

                        <div className="flex items-center gap-3">
                            <a className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-white text-sm hover:opacity-95 transition" href="/dev-login">Visit Portal</a>
                            {/* Theme toggle shown here again for larger screens */}
                            <a
                                className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-white text-sm hover:opacity-95 transition"
                                href={isAuthenticated ? dashboardHref : '/admissions'}
                            >
                                {isAuthenticated ? 'Visit Dashboard' : 'Apply For Admission'}
                            </a>
                            <div className="hidden sm:block">
                                <ThemeToggle />
                            </div>
                            {/* Mobile menu trigger (simple) */}
                            <div className="md:hidden">
                                <button aria-label="Open menu" className="p-2 rounded-md hover:bg-[rgba(255,255,255,0.04)]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.nav>
        </AnimatePresence>
    )
}
