"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Key, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/custom/EmptyState";
import DataTable, { Column } from "@/components/custom/DataTable";
import StatusBadge from "@/components/custom/StatusBadge";
import { useRolesStore } from "@/store/dashboard/rolesStore";
import { usePermissions } from "../hooks/useRolesData";
import type { Permission } from "@/types/roles";
import type { PermissionFormValues } from "@/schemas/roles.schema";
import PermissionFormModal from "./PermissionFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

const moduleColors: Record<string, "success" | "info" | "purple" | "warning" | "orange"> = {
    academics: "info",
    finance: "success",
    admin: "purple",
    students: "warning",
};

export default function PermissionsPanel() {
    const {
        permissions,
        modules,
        moduleFilter,
        setModuleFilter,
        loading,
        createPermission,
        updatePermission,
        deletePermission,
    } = usePermissions();

    const {
        activeModal,
        openModal,
        closeModal,
        selectedPermission,
        setSelectedPermission,
    } = useRolesStore();

    const filteredPermissions = useMemo(() => {
        if (moduleFilter === "all") return permissions;
        return permissions.filter((p) => p.module === moduleFilter);
    }, [permissions, moduleFilter]);

    const columns: Column<Permission & Record<string, unknown>>[] = [
        {
            key: "resource",
            header: "Resource",
            sortable: true,
            render: (row) => (
                <span className="font-medium text-foreground">{row.resource}</span>
            ),
        },
        {
            key: "action",
            header: "Action",
            sortable: true,
            render: (row) => (
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    {row.action}
                </code>
            ),
        },
        {
            key: "module",
            header: "Module",
            sortable: true,
            render: (row) => (
                <StatusBadge
                    label={row.module}
                    variant={moduleColors[row.module] ?? "default"}
                />
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (row) => (
                <span className="text-muted-foreground text-xs max-w-50 truncate block">
                    {row.description || "—"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            width: "80px",
            align: "right",
            render: (row) => (
                <div className="flex items-center gap-1 justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPermission(row as Permission);
                            openModal("edit-permission");
                        }}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPermission(row as Permission);
                            openModal("delete-permission");
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors text-xs"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    const handleCreateSubmit = async (values: PermissionFormValues) => {
        await createPermission({
            resource: values.resource,
            action: values.action,
            module: values.module,
            description: values.description || "",
        });
    };

    const handleEditSubmit = async (values: PermissionFormValues) => {
        if (!selectedPermission) return;
        await updatePermission(selectedPermission.id, {
            resource: values.resource,
            action: values.action,
            module: values.module,
            description: values.description || "",
        });
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPermission) return;
        await deletePermission(selectedPermission.id);
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        System Permissions
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {permissions.length} permission{permissions.length !== 1 ? "s" : ""}{" "}
                        across {modules.length} module{modules.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Button onClick={() => openModal("create-permission")} size="sm">
                    <Plus size={16} className="mr-1.5" />
                    New Permission
                </Button>
            </div>

            {/* Module filter chips */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Filter size={14} className="text-muted-foreground" />
                <button
                    onClick={() => setModuleFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${moduleFilter === "all"
                            ? "bg-primary text-[--primary-foreground]"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                >
                    All
                </button>
                {modules.map((m) => (
                    <motion.button
                        key={m}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setModuleFilter(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${moduleFilter === m
                                ? "bg-primary text-[--primary-foreground]"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {m}
                    </motion.button>
                ))}
            </div>

            {/* Table */}
            {permissions.length === 0 && !loading ? (
                <EmptyState
                    icon={Key}
                    title="No permissions yet"
                    description="Create permissions to define what actions can be performed in the system."
                    action={
                        <Button onClick={() => openModal("create-permission")} size="sm">
                            <Plus size={16} className="mr-1.5" />
                            Create Permission
                        </Button>
                    }
                />
            ) : (
                <DataTable
                    data={filteredPermissions as (Permission & Record<string, unknown>)[]}
                    columns={columns}
                    loading={loading}
                    searchable
                    searchPlaceholder="Search permissions…"
                    pageSize={12}
                    rowKey="id"
                    emptyMessage="No matching permissions found"
                />
            )}

            {/* Create Modal */}
            <PermissionFormModal
                open={activeModal === "create-permission"}
                onClose={closeModal}
                onSubmit={handleCreateSubmit}
                modules={modules}
            />

            {/* Edit Modal */}
            <PermissionFormModal
                open={activeModal === "edit-permission"}
                onClose={closeModal}
                onSubmit={handleEditSubmit}
                permission={selectedPermission}
                modules={modules}
            />

            {/* Delete Modal */}
            <DeleteConfirmModal
                open={activeModal === "delete-permission"}
                onClose={closeModal}
                onConfirm={handleDeleteConfirm}
                title="Delete Permission"
                description="This permission will be removed from all roles that use it."
                itemName={
                    selectedPermission
                        ? `${selectedPermission.resource}.${selectedPermission.action}`
                        : ""
                }
            />
        </>
    );
}
