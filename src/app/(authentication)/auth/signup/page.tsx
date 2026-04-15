"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
    emailSchema,
    passwordSchema,
    usernameSchema,
} from "@/lib/validations/zod";

const registerBaseSchema = z.object({
    email: emailSchema("Email"),
    username: usernameSchema("Username"),
    password: passwordSchema.min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
});

const registerSchema = registerBaseSchema.refine(
    (values) => values.password === values.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

const registerPayloadSchema = registerBaseSchema.omit({ confirmPassword: true });

type RegisterForm = {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
};

export default function SignUpPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [form, setForm] = useState<RegisterForm>({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });

    function patch(values: Partial<RegisterForm>) {
        setForm((prev) => ({ ...prev, ...values }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const parsed = registerSchema.safeParse(form);
        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message ?? "Please check your entries.");
            return;
        }

        const payloadParsed = registerPayloadSchema.safeParse(parsed.data);
        if (!payloadParsed.success) {
            toast.error(payloadParsed.error.issues[0]?.message ?? "Invalid registration data.");
            return;
        }

        setSubmitting(true);

        const response = await fetch("/api/mock-auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadParsed.data),
        });

        setSubmitting(false);

        const data = await response.json();
        if (!response.ok) {
            toast.error(data?.message ?? "Registration failed. Please try again.");
            return;
        }

        toast.success("Account created successfully.");
        router.push(`/auth/signin?registered=1&email=${encodeURIComponent(form.email)}`);
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <div className="absolute right-4 top-4 z-20 rounded-xl border border-border bg-card/80 p-1 backdrop-blur sm:right-6 sm:top-6">
                <ThemeToggle />
            </div>

            <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-stretch lg:grid-cols-[0.95fr_1.25fr]">
                <section className="hidden border-r border-border/60 bg-card p-10 lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 rounded-2xl border border-border/80 bg-background/75 px-4 py-3 shadow-sm backdrop-blur"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
                                <Image src="/logo/logo.png" alt="QHUB" width={30} height={30} className="rounded-md" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">QHUB Portal</p>
                                <p className="text-xs text-muted-foreground">Knowledge • Innovation • Service</p>
                            </div>
                        </Link>
                        <h1 className="mt-6 text-4xl font-bold leading-tight">
                            Create your portal account
                        </h1>
                        <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                            Register with your email and a username. You can sign in with either your email or username after registration.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { title: "Email Address", desc: "Used to identify your account" },
                            { title: "Username", desc: "Your preferred display handle" },
                            { title: "Password", desc: "Keep it secure, at least 8 characters" },
                        ].map((item) => (
                            <div key={item.title} className="rounded-2xl border border-border/70 bg-background/65 p-4">
                                <p className="text-sm font-semibold">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="flex items-center p-4 sm:p-6 lg:p-10">
                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="w-full rounded-3xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur sm:p-7"
                    >
                        <div className="mb-6">
                            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                Create Your Account
                            </p>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight">Get started today</h2>
                            <p className="mt-1 text-sm text-muted-foreground">Fill in your details to create a portal account.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium">Email Address *</span>
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => patch({ email: e.target.value })}
                                        placeholder="name@example.com"
                                    />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-sm font-medium">Username *</span>
                                    <Input
                                        value={form.username}
                                        onChange={(e) => patch({ username: e.target.value })}
                                        placeholder="preferred username"
                                    />
                                </label>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium">Password *</span>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={form.password}
                                            onChange={(e) => patch({ password: e.target.value })}
                                            placeholder="At least 8 characters"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </label>
                                <label className="space-y-2">
                                    <span className="text-sm font-medium">Confirm Password *</span>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={form.confirmPassword}
                                            onChange={(e) => patch({ confirmPassword: e.target.value })}
                                            placeholder="Re-enter password"
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </div>

                            <Button type="submit" disabled={submitting} className="rounded-xl">
                                {submitting ? "Submitting..." : "Create Account"}
                                <CheckCircle2 size={15} />
                            </Button>
                        </div>
                    </motion.form>
                </section>
            </div>
        </main>
    );
}
