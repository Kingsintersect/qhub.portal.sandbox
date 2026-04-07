import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted px-6 py-14 text-center',
                className
            )}
        >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {description && (
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
            )}
            {action && (
                <Button
                    size="sm"
                    className="mt-4 border-destructive text-primary-foreground hover:opacity-90"
                    onClick={action.onClick}
                >
                    {action.label}
                </Button>
            )}
        </div>
    )
}