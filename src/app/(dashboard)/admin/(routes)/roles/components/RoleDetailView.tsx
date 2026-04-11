"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Pencil,
    Users,
    Key,
    Shield,
    Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/custom/StatusBadge";
import EmptyState from "@/components/custom/EmptyState";
import { useRoleDetail } from "../hooks/useRolesData";

interface RoleDetailViewProps {
    roleId: number;
}

const moduleColors: Record<string, "success" | "info" | "purple" | "warning" | "orange"> = {
    academics: "info",
    finance: "success",
    admin: "purple",
    students: "warning",
};

export default function RoleDetailView({ roleId }: RoleDetailViewProps) {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<"permissions" | "users">("permissions");
    const { role, permissions, users, groupedPermissions, loading } = useRoleDetail(roleId);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-muted rounded w-32" />
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-muted" />
                        <div className="space-y-2 flex-1">
                            <div className="h-5 bg-muted rounded w-40" />
                            <div className="h-4 bg-muted rounded w-24" />
                        </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-3/4 mt-2" />
                </div>
            </div>
        );
    }

    if (!role) {
        return (
            <EmptyState
                icon={Shield}
                title="Role not found"
                description="The role you're looking for doesn't exist or has been deleted."
                action={
                    <Button onClick={() => router.push("/admin/roles")} variant="outline">
                        <ArrowLeft size={16} className="mr-1.5" />
                        Back to Roles
                    </Button>
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={() => router.push("/admin/roles")}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Roles & Permissions
            </button>

            {/* Role header card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-6"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Shield size={24} className="text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-foreground">
                                    {role.name}
                                </h1>
                                {role.is_default && (
                                    <StatusBadge label="Default" variant="info" dot />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">
                                {role.slug}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/roles/${roleId}/edit`)}
                        >
                            <Pencil size={14} className="mr-1.5" />
                            Edit
                        </Button>
                    </div>
                </div>
                {role.description && (
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                        {role.description}
                    </p>
                )}

                {/* Quick stats */}
                <div className="flex items-center gap-6 mt-5 pt-5 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                        <Key size={14} className="text-muted-foreground" />
                        <span className="text-foreground font-medium">
                            {permissions.length}
                        </span>
                        <span className="text-muted-foreground">permissions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Users size={14} className="text-muted-foreground" />
                        <span className="text-foreground font-medium">
                            {users.length}
                        </span>
                        <span className="text-muted-foreground">users assigned</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Created</span>
                        <span className="text-foreground font-medium">
                            {new Date(role.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Section toggle */}
            <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1 w-fit">
                {(["permissions", "users"] as const).map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={cn(
                            "relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            activeSection === section
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {activeSection === section && (
                            <motion.div
                                layoutId="role-detail-tab"
                                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            {section === "permissions" ? (
                                <Key size={14} />
                            ) : (
                                <Users size={14} />
                            )}
                            <span className="capitalize">{section}</span>
                            <span className="bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {section === "permissions"
                                    ? permissions.length
                                    : users.length}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Permissions section */}
            <AnimatePresence mode="wait">
                {activeSection === "permissions" ? (
                    <motion.div
                        key="permissions"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {Object.keys(groupedPermissions).length === 0 ? (
                            <EmptyState
                                icon={Key}
                                title="No permissions assigned"
                                description="This role doesn't have any permissions yet. Edit the role to assign permissions."
                                action={
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            router.push(`/admin/roles/${roleId}/edit`)
                                        }
                                    >
                                        <Pencil size={14} className="mr-1.5" />
                                        Assign Permissions
                                    </Button>
                                }
                            />
                        ) : (
                            Object.entries(groupedPermissions).map(
                                ([module, perms], i) => (
                                    <motion.div
                                        key={module}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className="bg-card border border-border rounded-2xl overflow-hidden"
                                    >
                                        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge
                                                    label={module}
                                                    variant={
                                                        moduleColors[module] ?? "default"
                                                    }
                                                />
                                                <span className="text-xs text-muted-foreground">
                                                    {perms.length} permission
                                                    {perms.length !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {perms.map((perm) => (
                                                <div
                                                    key={perm.id}
                                                    className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors"
                                                >
                                                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Check
                                                            size={12}
                                                            className="text-primary"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm">
                                                            <span className="font-medium text-foreground">
                                                                {perm.resource}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                .{perm.action}
                                                            </span>
                                                        </p>
                                                        {perm.description && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {perm.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )
                            )
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="users"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.2 }}
                    >
                        {users.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="No users assigned"
                                description="No users have been assigned to this role yet."
                            />
                        ) : (
                            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                <div className="divide-y divide-border">
                                    {users.map((user, i) => (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/30 transition-colors"
                                        >
                                            {/* Avatar */}
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                                                {user.first_name[0]}
                                                {user.last_name[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {user.matric_no && (
                                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                                                        {user.matric_no}
                                                    </code>
                                                )}
                                                {user.staff_id && (
                                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                                                        {user.staff_id}
                                                    </code>
                                                )}
                                                <StatusBadge
                                                    label={user.is_active ? "Active" : "Inactive"}
                                                    variant={user.is_active ? "success" : "destructive"}
                                                    dot
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
