"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom/EmptyState";
import { useRolesStore } from "@/store/dashboard/rolesStore";
import { useRoles, usePermissions } from "../hooks/useRolesData";
import type { Role } from "@/types/roles";
import type { RoleFormValues } from "@/schemas/roles.schema";
import RoleCard from "./RoleCard";
import RoleFormModal from "./RoleFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function RolesPanel() {
    const router = useRouter();
    const { roles, loading, createRole, updateRole, deleteRole, duplicateRole } = useRoles();
    const { permissions } = usePermissions();
    const { activeModal, openModal, closeModal, selectedRole, setSelectedRole } =
        useRolesStore();

    const handleView = (role: Role) => {
        router.push(`/admin/roles/${role.id}`);
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        openModal("edit-role");
    };

    const handleDuplicate = async (role: Role) => {
        try {
            await duplicateRole(role.id);
        } catch {
            toast.error("Failed to duplicate role");
        }
    };

    const handleDeleteClick = (role: Role) => {
        setSelectedRole(role);
        openModal("delete-role");
    };

    const handleCreateSubmit = async (values: RoleFormValues) => {
        await createRole({
            name: values.name,
            slug: values.slug,
            description: values.description || "",
            is_default: values.is_default,
            permission_ids: values.permission_ids,
        });
    };

    const handleEditSubmit = async (values: RoleFormValues) => {
        if (!selectedRole) return;
        await updateRole(selectedRole.id, {
            name: values.name,
            slug: values.slug,
            description: values.description || "",
            is_default: values.is_default,
            permission_ids: values.permission_ids,
        });
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRole) return;
        await deleteRole(selectedRole.id);
    };

    if (loading && roles.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-card border border-border rounded-2xl p-5 animate-pulse"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-muted" />
                            <div className="space-y-1.5 flex-1">
                                <div className="h-4 bg-muted rounded w-24" />
                                <div className="h-3 bg-muted rounded w-16" />
                            </div>
                        </div>
                        <div className="h-3 bg-muted rounded w-full mb-2" />
                        <div className="h-3 bg-muted rounded w-3/4 mb-4" />
                        <div className="h-3 bg-muted rounded w-20" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">System Roles</h2>
                    <p className="text-sm text-muted-foreground">
                        {roles.length} role{roles.length !== 1 ? "s" : ""} configured
                    </p>
                </div>
                <Button onClick={() => openModal("create-role")} size="sm">
                    <Plus size={16} className="mr-1.5" />
                    New Role
                </Button>
            </div>

            {/* Grid */}
            {roles.length === 0 ? (
                <EmptyState
                    icon={ShieldCheck}
                    title="No roles yet"
                    description="Create your first role to start managing access permissions."
                    action={
                        <Button onClick={() => openModal("create-role")} size="sm">
                            <Plus size={16} className="mr-1.5" />
                            Create Role
                        </Button>
                    }
                />
            ) : (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.06 } },
                    }}
                >
                    {roles.map((role, i) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            index={i}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </motion.div>
            )}

            {/* Create Modal */}
            <RoleFormModal
                open={activeModal === "create-role"}
                onClose={closeModal}
                onSubmit={handleCreateSubmit}
                permissions={permissions}
            />

            {/* Edit Modal */}
            <RoleFormModal
                open={activeModal === "edit-role"}
                onClose={closeModal}
                onSubmit={handleEditSubmit}
                role={selectedRole}
                permissions={permissions}
            />

            {/* Delete Modal */}
            <DeleteConfirmModal
                open={activeModal === "delete-role"}
                onClose={closeModal}
                onConfirm={handleDeleteConfirm}
                title="Delete Role"
                description="This action cannot be undone. All users with this role will lose their associated permissions."
                itemName={selectedRole?.name ?? ""}
            />
        </>
    );
}
