"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  Loader2,
  UploadCloud,
  Building2,
  GraduationCap,
  Layers,
  CalendarDays,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/custom/EmptyState"
import { PermissionGate } from "@/lib/permissions/PermissionGate"
import { useSyncCategories } from "../../hooks/use-sync-categories"
import {
  usePushCategory,
  usePushHierarchy,
} from "../../hooks/use-sync-mutations"
import { useMoodleSyncUiStore } from "../../store/moodle-sync-ui.store"
import { SyncStatusBadge } from "../shared/sync-status-badge"
import { SyncDirectionBadge } from "../shared/sync-direction-badge"
import type { CategorySyncResponse } from "../../types"

const ENTITY_ICON: Record<CategorySyncResponse["entityType"], LucideIcon> = {
  faculty: Building2,
  department: Building2,
  program: GraduationCap,
  level: Layers,
  semester: CalendarDays,
}

function buildTree(items: CategorySyncResponse[]) {
  const byParent = new Map<number | null, CategorySyncResponse[]>()
  for (const item of items) {
    const list = byParent.get(item.parentId) ?? []
    list.push(item)
    byParent.set(item.parentId, list)
  }
  return byParent
}

interface TreeNodeProps {
  node: CategorySyncResponse
  depth: number
  byParent: Map<number | null, CategorySyncResponse[]>
}

function TreeNode({ node, depth, byParent }: TreeNodeProps) {
  const children = byParent.get(node.entityId) ?? []
  const expanded = useMoodleSyncUiStore((s) =>
    s.expandedCategoryIds.has(node.entityId)
  )
  const toggleExpanded = useMoodleSyncUiStore((s) => s.toggleCategoryExpanded)
  const pushCategory = usePushCategory()
  const pushHierarchy = usePushHierarchy()
  const Icon = ENTITY_ICON[node.entityType]
  const hasChildren = children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-muted/40"
        style={{ paddingLeft: depth * 20 + 8 }}
      >
        <button
          type="button"
          onClick={() => hasChildren && toggleExpanded(node.entityId)}
          className={cn(
            "shrink-0 text-muted-foreground",
            !hasChildren && "opacity-0"
          )}
        >
          <ChevronRight
            size={14}
            className={cn("transition-transform", expanded && "rotate-90")}
          />
        </button>

        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={13} />
        </div>

        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {node.entityName}
        </span>
        <span className="hidden shrink-0 text-[11px] text-muted-foreground capitalize sm:inline">
          {node.entityType}
        </span>

        <SyncDirectionBadge
          direction={node.syncDirection}
          className="hidden sm:inline-flex"
        />
        <SyncStatusBadge status={node.syncStatus} />

        <div className="flex shrink-0 items-center gap-1">
          {node.entityType === "faculty" && (
            <PermissionGate
              require={{ resource: "moodle-sync", action: "push" }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                disabled={pushHierarchy.isPending}
                onClick={() => pushHierarchy.mutate(node.entityId)}
                title="Push this faculty and its whole hierarchy"
              >
                {pushHierarchy.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  "Push Hierarchy"
                )}
              </Button>
            </PermissionGate>
          )}
          {node.syncStatus !== "SYNCED" && (
            <PermissionGate
              require={{ resource: "moodle-sync", action: "push" }}
            >
              <Button
                variant="outline"
                size="icon-sm"
                disabled={pushCategory.isPending}
                onClick={() =>
                  pushCategory.mutate({
                    entityType: node.entityType,
                    entityId: node.entityId,
                    parentMoodleCategoryId:
                      node.parentMoodleCategoryId ?? undefined,
                  })
                }
                title="Push this node"
              >
                {pushCategory.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <UploadCloud size={12} />
                )}
              </Button>
            </PermissionGate>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                byParent={byParent}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CategoryTree() {
  const { data = [], isLoading, isError } = useSyncCategories()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-xl bg-muted/40" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="Couldn't load the category hierarchy"
        description="Please try again."
      />
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No categories yet"
        description="Nothing has been pushed to or pulled from Moodle."
      />
    )
  }

  const byParent = buildTree(data)
  const roots = byParent.get(null) ?? []

  return (
    <div className="rounded-2xl border border-border bg-card p-2">
      {roots.map((root) => (
        <TreeNode key={root.id} node={root} depth={0} byParent={byParent} />
      ))}
    </div>
  )
}
