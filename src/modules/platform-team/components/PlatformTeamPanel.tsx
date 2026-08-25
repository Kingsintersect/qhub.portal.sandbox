"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Check, Loader2, Plus, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { usePlatformPermissions } from "@/lib/auth/platform-permissions"
import {
  useCreatePlatformUser,
  usePlatformRoles,
  usePlatformUsers,
  useUpdatePlatformUser,
} from "@/modules/platform-team/hooks/use-platform-team"
import { createPlatformUserSchema } from "@/modules/platform-team/schemas"
import type { CreatePlatformUserPayload } from "@/modules/platform-team/types"

/**
 * The platform team and what each account may do.
 *
 * Controls are hidden when the signed-in account lacks the permission, but the
 * API refuses independently — this only spares an operator from clicking
 * something that would be rejected.
 */
export function PlatformTeamPanel() {
  const { can } = usePlatformPermissions()
  const users = usePlatformUsers()
  const roles = usePlatformRoles()
  const updateUser = useUpdatePlatformUser()

  const canManage = can("team.manage")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Platform team
          </h1>
          <p className="text-sm text-muted-foreground">
            Who can reach this console, and what they are allowed to do.
          </p>
        </div>

        {canManage && <AddMemberDialog />}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <caption className="sr-only">Platform accounts</caption>
          <thead className="border-b border-border bg-muted/40">
            <tr className="text-xs tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="px-4 py-3 font-medium">
                Account
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Roles
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Last sign-in
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Active
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.isPending &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((__, c) => (
                    <td key={c} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}

            {users.data?.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">
                    {user.username}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap gap-1">
                    {user.roles.length === 0 ? (
                      // Worth calling out: an account with no roles can do
                      // nothing at all, which looks like a bug from the outside.
                      <span className="text-xs text-destructive">
                        no access
                      </span>
                    ) : (
                      user.roles.map((role) => (
                        <Badge
                          key={role.id}
                          variant="outline"
                          className="font-medium"
                        >
                          {role.name === "owner" && (
                            <ShieldCheck
                              className="mr-1 size-3"
                              aria-hidden="true"
                            />
                          )}
                          {role.name}
                        </Badge>
                      ))
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(user.lastLoginAt)}
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={user.isActive}
                    disabled={!canManage || updateUser.isPending}
                    onCheckedChange={(checked) =>
                      updateUser.mutate({
                        id: user.id,
                        payload: { isActive: checked },
                      })
                    }
                    aria-label={`${user.username} active`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Roles</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.data?.map((role) => (
            <div key={role.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {role.name}
                </span>
                {role.isSuperuser && (
                  <Badge variant="outline" className="text-xs">
                    full access
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {role.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {role.isSuperuser
                  ? "Bypasses every permission check."
                  : `${role.permissions.length} permission${role.permissions.length === 1 ? "" : "s"}`}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function AddMemberDialog() {
  const [open, setOpen] = useState(false)
  const roles = usePlatformRoles()
  const createUser = useCreatePlatformUser()

  const form = useForm<CreatePlatformUserPayload>({
    resolver: zodResolver(createPlatformUserSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      roleIds: [],
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await createUser.mutateAsync(values, {
      onSuccess: () => {
        form.reset()
        setOpen(false)
      },
      onError: () => {},
    })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add member
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a platform account</DialogTitle>
          <DialogDescription>
            An account with no roles can do nothing, so grant at least one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name">
              <Input id="firstName" {...form.register("firstName")} />
            </Field>
            <Field id="lastName" label="Last name">
              <Input id="lastName" {...form.register("lastName")} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="email"
              label="Email"
              error={form.formState.errors.email?.message}
            >
              <Input id="email" type="email" {...form.register("email")} />
            </Field>
            <Field
              id="username"
              label="Username"
              error={form.formState.errors.username?.message}
            >
              <Input id="username" {...form.register("username")} />
            </Field>
          </div>

          <Field
            id="password"
            label="Temporary password"
            error={form.formState.errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
          </Field>

          <Field
            id="roleIds"
            label="Roles"
            error={form.formState.errors.roleIds?.message}
          >
            <Controller
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2" role="group">
                  {roles.data?.map((role) => {
                    const selected = field.value?.includes(role.id)
                    return (
                      <button
                        key={role.id}
                        type="button"
                        aria-pressed={selected}
                        title={role.description ?? undefined}
                        onClick={() =>
                          field.onChange(
                            selected
                              ? field.value.filter((v: number) => v !== role.id)
                              : [...(field.value ?? []), role.id]
                          )
                        }
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {selected && (
                          <Check className="mr-1 size-3" aria-hidden="true" />
                        )}
                        {role.name}
                      </button>
                    )
                  })}
                </div>
              )}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Add member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div aria-describedby={error ? `${id}-error` : undefined}>{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}

function formatDate(value: string | null): string {
  if (!value) return "never"

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? "never" : parsed.toLocaleString()
}
