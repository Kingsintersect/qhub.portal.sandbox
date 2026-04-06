import { cn } from '@/lib/utils'
import { CheckCircle2, Circle } from 'lucide-react'

interface StatusBadgeProps {
    active: boolean
    activeLabel?: string
    inactiveLabel?: string
    className?: string
}

export function StatusBadge({
    active,
    activeLabel = 'Active',
    inactiveLabel = 'Inactive',
    className,
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                active
                    ? 'bg-[oklch(0.97_0.05_165)] text-[oklch(0.3_0.1_165)] ring-[oklch(0.8_0.1_165)]'
                    : 'bg-[oklch(0.97_0.001_106.424)] text-[oklch(0.553_0.013_58.071)] ring-[oklch(0.923_0.003_48.717)]',
                className
            )}
        >
            {active ? (
                <CheckCircle2 className="h-3 w-3" />
            ) : (
                <Circle className="h-3 w-3" />
            )}
            {active ? activeLabel : inactiveLabel}
        </span>
    )
}