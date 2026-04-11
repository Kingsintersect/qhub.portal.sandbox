"use client";

import { use, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { roleSchema, type RoleFormValues } from "@/schemas/roles.schema";
import { usePermissions, useRoleDetail, useRoles } from "../../hooks/useRolesData";
import PermissionPicker from "../../components/PermissionPicker";

interface EditRolePageProps {
    params: Promise<{ id: string }>;
}

export default function EditRolePage({ params }: EditRolePageProps) {
    const { id } = use(params);
    const roleId = Number(id);
    const router = useRouter();
    const { role, permissions: rolePermissions, loading } = useRoleDetail(roleId);
    const { permissions: allPermissions } = usePermissions();
    const { updateRole, syncPermissions, isMutating } = useRoles();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors, isDirty },
    } = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema) as Resolver<RoleFormValues>,
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            is_default: false,
            permission_ids: [],
        },
    });

    const selectedPermissions = useWatch({ control, name: "permission_ids" }) ?? [];
    const isDefaultRole = useWatch({ control, name: "is_default" }) ?? false;

    useEffect(() => {
        if (!role) return;
        reset({
            name: role.name,
            slug: role.slug,
            description: role.description ?? "",
            is_default: role.is_default,
            permission_ids: rolePermissions.map((permission) => permission.id),
        });
    }, [reset, role, rolePermissions]);

    const onSubmit = async (values: RoleFormValues) => {
        try {
            await updateRole(roleId, {
                name: values.name,
                slug: values.slug,
                description: values.description || "",
                is_default: values.is_default,
                permission_ids: values.permission_ids,
            });

            const permissionsChanged =
                JSON.stringify([...values.permission_ids].sort()) !==
                JSON.stringify([...rolePermissions.map((permission) => permission.id)].sort());

            if (permissionsChanged) {
                await syncPermissions(roleId, values.permission_ids);
            }

            router.push(`/admin/roles/${roleId}`);
        } catch {
            return;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-muted rounded w-32" />
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-20 bg-muted rounded" />
                    <div className="h-48 bg-muted rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Back button */}
            <button
                onClick={() => router.push(`/admin/roles/${roleId}`)}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft size={16} />
                Back to {role?.name ?? "Role"}
            </button>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-xl font-bold text-foreground">Edit Role</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Update role details and manage permissions
                </p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSubmit(onSubmit)}
                className="bg-card border border-border rounded-2xl p-6 space-y-6"
            >
                {/* Name & Slug */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-name">Role Name</Label>
                        <Input id="edit-name" {...register("name")} />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-slug">Slug</Label>
                        <Input
                            id="edit-slug"
                            className="font-mono text-sm"
                            {...register("slug")}
                        />
                        {errors.slug && (
                            <p className="text-xs text-red-500">{errors.slug.message}</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <Label htmlFor="edit-desc">Description</Label>
                    <Textarea
                        id="edit-desc"
                        rows={3}
                        {...register("description")}
                    />
                    {errors.description && (
                        <p className="text-xs text-red-500">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                {/* Default toggle */}
                <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Default Role
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Automatically assign to newly registered users
                        </p>
                    </div>
                    <Switch
                        checked={isDefaultRole}
                        onCheckedChange={(val) => setValue("is_default", val, { shouldDirty: true })}
                    />
                </div>

                {/* Permissions */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Permissions</Label>
                        <motion.span
                            key={selectedPermissions.length}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                        >
                            {selectedPermissions.length} selected
                        </motion.span>
                    </div>
                    <PermissionPicker
                        permissions={allPermissions}
                        selected={selectedPermissions}
                        onChange={(ids) => setValue("permission_ids", ids, { shouldDirty: true })}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/admin/roles/${roleId}`)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isMutating || !isDirty}>
                        {isMutating ? (
                            <Loader2 size={14} className="animate-spin mr-2" />
                        ) : (
                            <Save size={14} className="mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </motion.form>
        </div>
    );
}
