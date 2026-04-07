'use client'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const ToggleIcon = ({ mode }: { mode: 'dark' | 'light' }) => {
    if (mode === 'dark') {
        // moon icon
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
            </svg>
        )
    }
    // sun icon
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 4V2m0 20v-2M4.22 4.22L2.81 2.81M21.19 21.19l-1.41-1.41M4 12H2m20 0h-2M4.22 19.78l-1.41 1.41M21.19 2.81l-1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
    )
}

export default function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const activeTheme = (theme === 'system' ? resolvedTheme : theme) ?? 'light'
    const next = activeTheme === 'dark' ? 'light' : 'dark'

    if (!mounted) {
        return (
            <button
                title="Toggle theme"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                aria-label="Toggle theme"
                disabled
            >
                <span className="sr-only">Toggle theme</span>
                <span className="text-theme">
                    <ToggleIcon mode="light" />
                </span>
            </button>
        )
    }

    return (
        <motion.button
            title="Toggle theme"
            onClick={() => setTheme(next)}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
            aria-label="Toggle theme"
        >
            <span className="sr-only">Toggle theme</span>
            <motion.span
                layout
                key={activeTheme}
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 10 }}
                className="text-theme"
            >
                <ToggleIcon mode={activeTheme === 'dark' ? 'dark' : 'light'} />
            </motion.span>
        </motion.button>
    )
}