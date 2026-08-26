"use client"

import { useState } from "react"
import { Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { usePlatformPermissions as useMyPermissions } from "@/lib/auth/platform-permissions"
import {
  useCreateRole,
  useDeleteRole,
  usePlatformPermissions,
  usePlatformRoles,
  useUpdateRole,
  useUpdateRolePermissions,
} from "@/modules/platform-team/hooks/use-platform-team"
import type {
  PermissionCatalog,
  PlatformRole,
} from "@/modules/platform-team/types"

/**
 * Roles, and what each one may actually do.
 *
 * This screen exists because the API behind it already did. Creating roles and
 * editing their permissions was reachable over HTTP and enforced on every
 * platform route, but nothing in the console called it — so the team page
 * listed roles with a permission count and no way to change them, while the
 * `roles.manage` grant sat there unusable.
 *
 * The matrix writes through to the real grants: unchecking a box here revokes
 * the access, immediately, for everyone holding that role.
 */
export function RolesPanel() {
  const { can } = useMyPermissions()
  const roles = usePlatformRoles()
  const catalog = usePlatformPermissions()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  const canManage = can("roles.manage")
  const list = roles.data ?? []
  const selected =
    list.find((role) => role.id === selectedId) ?? list[0] ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Roles &amp; permissions
          </h2>
          <p className="text-sm text-muted-foreground">
            What each kind of platform account may do. Changes take effect at
            once.
          </p>
        </div>

        {canManage && (
          <Button variant="outline" onClick={() => setCreating(true)}>
            <Plus className="mr-2 size-4" aria-hidden="true" />
            New role
          </Button>
        )}
      </div>

      {roles.isPending && <Skeleton className="h-72 w-full" />}

      {!roles.isPending && (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <ul className="space-y-2">
            {list.map((role) => (
              <li key={role.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(role.id)}
                  aria-current={selected?.id === role.id ? "true" : undefined}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    selected?.id === role.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {role.name}
                    </span>
                    {role.isSuperuser && (
                      <ShieldCheck
                        className="size-3.5 text-muted-foreground"
                        aria-label="Full access"
                      />
                    )}
                  </span>

                  <span className="mt-1 block text-xs text-muted-foreground">
                    {role.isSuperuser
                      ? "Full access"
                      : `${role.permissions.length} permission${role.permissions.length === 1 ? "" : "s"}`}
                    {" · "}
                    {role.memberCount} member
                    {role.memberCount === 1 ? "" : "s"}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <RoleEditor
              // Keyed by role, so picking a different one remounts the editor
              // with its own state instead of syncing it in an effect.
              key={selected.id}
              role={selected}
              catalog={catalog.data ?? {}}
              canManage={canManage}
              isCatalogPending={catalog.isPending}
            />
          ) : (
            <div className="grid place-items-center rounded-lg border border-dashed border-border p-10 text-sm text-muted-foreground">
              Select a role.
            </div>
          )}
        </div>
      )}

      <NewRoleDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

function RoleEditor({
  role,
  catalog,
  canManage,
  isCatalogPending,
}: {
  role: PlatformRole
  catalog: PermissionCatalog
  canManage: boolean
  isCatalogPending: boolean
}) {
  const updatePermissions = useUpdateRolePermissions()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const [selected, setSelected] = useState<number[]>(role.permissionIds)
  const [description, setDescription] = useState(role.description ?? "")

  const dirty =
    selected.length !== role.permissionIds.length ||
    selected.some((id) => !role.permissionIds.includes(id))

  const toggle = (id: number) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    )

  if (role.isSuperuser) {
    return (
      <div className="space-y-3 rounded-lg border border-border p-6">
        <h3 className="text-sm font-medium text-foreground">{role.name}</h3>
        <p className="text-sm text-muted-foreground">{role.description}</p>

        {/* Not an empty matrix: this role bypasses permission checks entirely,
            so a grid of unchecked boxes would misreport it as powerless. */}
        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          This role has full access to everything, including permissions added
          later. It is not built from the list below, so there is nothing here
          to change — which is also why it cannot be granted to a role you
          create.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-foreground">{role.name}</h3>
          <p className="text-xs text-muted-foreground">
            {role.isSystem ? "Built-in role" : "Custom role"} ·{" "}
            {role.memberCount} member{role.memberCount === 1 ? "" : "s"}
          </p>
        </div>

        {canManage && !role.isSystem && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete the ${role.name} role`}
            disabled={deleteRole.isPending || role.memberCount > 0}
            title={
              role.memberCount > 0
                ? "Move its members to another role first"
                : "Delete this role"
            }
            onClick={() => deleteRole.mutate(role.id)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {canManage && (
        <div className="space-y-1.5">
          <Label htmlFor={`role-description-${role.id}`}>Description</Label>
          <div className="flex gap-2">
            <Input
              id={`role-description-${role.id}`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={200}
            />
            <Button
              variant="outline"
              disabled={
                description === (role.description ?? "") || updateRole.isPending
              }
              onClick={() =>
                updateRole.mutate({ roleId: role.id, description })
              }
            >
              Save
            </Button>
          </div>
          {/* Built-in names are referenced by the seeders and route guards, so
              only the wording is editable here. */}
          {role.isSystem && (
            <p className="text-xs text-muted-foreground">
              A built-in role cannot be renamed.
            </p>
          )}
        </div>
      )}

      {isCatalogPending && <Skeleton className="h-56 w-full" />}

      <div className="space-y-4">
        {Object.entries(catalog).map(([module, permissions]) => (
          <div key={module}>
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {module.replace(/_/g, " ")}
            </h4>

            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {permissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40"
                >
                  <Checkbox
                    checked={selected.includes(permission.id)}
                    disabled={!canManage}
                    onCheckedChange={() => toggle(permission.id)}
                    aria-label={permission.name}
                  />
                  <span className="min-w-0">
                    <span className="block font-mono text-xs text-foreground">
                      {permission.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {permission.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {canManage && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button
            disabled={!dirty || updatePermissions.isPending}
            onClick={() =>
              updatePermissions.mutate({
                roleId: role.id,
                permissionIds: selected,
              })
            }
          >
            {updatePermissions.isPending && (
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Save permissions
          </Button>

          {dirty && (
            <>
              <Button
                variant="ghost"
                onClick={() => setSelected(role.permissionIds)}
              >
                Discard
              </Button>
              <span className="text-xs text-muted-foreground">
                {selected.length} selected — not yet saved
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function NewRoleDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateRole()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const submit = async () => {
    if (!name.trim() || !description.trim()) return

    await create.mutateAsync({
      name: name.trim(),
      description: description.trim(),
      permissionIds: [],
    })

    setName("")
    setDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New role</DialogTitle>
          <DialogDescription>
            Created with no permissions. Grant them from the matrix once it
            exists, so nobody is handed access by accident.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-role-name">Name</Label>
            <Input
              id="new-role-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="compliance"
            />
            {/* An identifier, not a label — the API enforces the same shape. */}
            <p className="text-xs text-muted-foreground">
              Lower case letters, numbers and underscores.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-role-description">Description</Label>
            <Textarea
              id="new-role-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              maxLength={200}
              placeholder="What this role is for."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={submit}
            disabled={!name.trim() || !description.trim() || create.isPending}
          >
            Create role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
