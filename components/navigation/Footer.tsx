'use client'
import React from 'react'

export default function Footer() {
    return (
        <footer className="mt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>University of Example</div>
                        <div className="text-xs text-foreground/70 mt-1">Knowledge • Innovation • Service</div>
                    </div>

                    <div className="flex gap-6 text-sm text-foreground/70">
                        <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
                        <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                </div>

                <div className="mt-6 text-xs text-foreground/60">© {new Date().getFullYear()} University of Example. All rights reserved.</div>
            </div>
        </footer>
    )
}