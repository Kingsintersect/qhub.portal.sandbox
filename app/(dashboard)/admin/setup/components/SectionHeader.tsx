import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
    icon?: LucideIcon
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

export function SectionHeader({ icon: Icon, title, description, action, className }: SectionHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between gap-4', className)}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.97_0.05_165/0.3)] ring-1 ring-[oklch(0.8_0.1_165/0.4)]">
                        <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                )}
                <div>
                    <h2 className="text-base font-semibold leading-tight text-foreground">{title}</h2>
                    {description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    )
}