"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { signIn } from "next-auth/react"
import { Building2, Loader2 } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const signinSchema = z.object({
  identifier: z.string().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
})

type SigninValues = z.infer<typeof signinSchema>

/**
 * Sign-in for platform staff. Uses the `platform-credentials` provider, which
 * authenticates against the central database rather than any institution's.
 */
export default function PlatformSigninPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<SigninValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { identifier: "", password: "" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    const result = await signIn("platform-credentials", {
      ...values,
      redirect: false,
    })

    if (!result?.ok) {
      // Deliberately not distinguishing unknown account from wrong password —
      // mirrors the API, which does the same to avoid account enumeration.
      setFormError("Those credentials were not recognised.")
      return
    }

    router.replace("/platform")
    router.refresh()
  })

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3 text-center">
          <span className="mx-auto grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              QHUB Platform
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage institutions.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Email or username</Label>
              <Input
                id="identifier"
                autoComplete="username"
                aria-describedby={
                  form.formState.errors.identifier
                    ? "identifier-error"
                    : undefined
                }
                {...form.register("identifier")}
              />
              {form.formState.errors.identifier && (
                <p
                  id="identifier-error"
                  role="alert"
                  className="text-xs font-medium text-destructive"
                >
                  {form.formState.errors.identifier.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-describedby={
                  form.formState.errors.password ? "password-error" : undefined
                }
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="text-xs font-medium text-destructive"
                >
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {formError && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive"
              >
                {formError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
