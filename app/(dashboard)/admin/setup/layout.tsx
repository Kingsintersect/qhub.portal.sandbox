'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Settings2,
    Users,
    GraduationCap,
    DollarSign,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/setup', label: 'Initial Setup', icon: Settings2 },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/programs', label: 'Programs', icon: GraduationCap },
    { href: '/admin/fees', label: 'Fee Accounts', icon: DollarSign },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname()

    return (
        <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
            {/* Logo */}
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary">
                        <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
                        SchoolAdmin
                    </span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-sidebar-foreground lg:hidden">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Menu
                </p>
                {NAV_ITEMS.map((item) => {
                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <item.icon className="h-4 w-4 shrink-0" />
                                {item.label}
                            </div>
                            {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-sidebar-border px-4 py-3">
                <p className="text-[10px] text-muted-foreground">v1.0.0 · Admin Portal</p>
            </div>
        </aside>
    )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:shrink-0">
                <Sidebar />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative z-50 h-full">
                        <Sidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar (mobile) */}
                <header className="flex h-14 items-center border-b border-border bg-background px-4 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="mr-3 text-foreground"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">SchoolAdmin</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    )
}