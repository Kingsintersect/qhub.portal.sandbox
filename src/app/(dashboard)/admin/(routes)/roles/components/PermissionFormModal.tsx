"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "@/components/custom/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { permissionSchema, type PermissionFormValues } from "@/schemas/roles.schema";
import type { Permission } from "@/types/roles";

interface PermissionFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: PermissionFormValues) => Promise<void>;
    permission?: Permission | null;
    modules: string[];
}

export default function PermissionFormModal({
    open,
    onClose,
    onSubmit,
    permission,
    modules,
}: PermissionFormModalProps) {
    const isEdit = !!permission;
    const [submitting, setSubmitting] = useState(false);
    const [customModule, setCustomModule] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<PermissionFormValues>({
        resolver: zodResolver(permissionSchema),
        defaultValues: {
            resource: permission?.resource ?? "",
            action: permission?.action ?? "",
            module: permission?.module ?? "",
            description: permission?.description ?? "",
        },
    });

    const handleFormSubmit = async (values: PermissionFormValues) => {
        setSubmitting(true);
        try {
            await onSubmit(values);
            reset();
            onClose();
        } catch {
            // Error handled by parent
        } finally {
            setSubmitting(false);
        }
    };

    const moduleValue = watch("module");

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit Permission" : "Create New Permission"}
            subtitle={
                isEdit
                    ? `Editing "${permission.resource}.${permission.action}"`
                    : "Define a new permission for the system"
            }
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit(handleFormSubmit)}
                        disabled={submitting}
                    >
                        {submitting && <Loader2 size={14} className="animate-spin mr-2" />}
                        {isEdit ? "Save Changes" : "Create Permission"}
                    </Button>
                </>
            }
        >
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {/* Resource & Action */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="perm-resource">Resource</Label>
                        <Input
                            id="perm-resource"
                            placeholder="e.g. results, courses, fees"
                            {...register("resource")}
                        />
                        {errors.resource && (
                            <p className="text-xs text-red-500">{errors.resource.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="perm-action">Action</Label>
                        <Input
                            id="perm-action"
                            placeholder="e.g. view.own, upload, approve"
                            {...register("action")}
                        />
                        {errors.action && (
                            <p className="text-xs text-red-500">{errors.action.message}</p>
                        )}
                    </div>
                </div>

                {/* Module */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="perm-module">Module</Label>
                        <button
                            type="button"
                            onClick={() => {
                                setCustomModule(!customModule);
                                if (!customModule) setValue("module", "");
                            }}
                            className="text-xs text-primary hover:underline"
                        >
                            {customModule ? "Choose existing" : "Add new module"}
                        </button>
                    </div>
                    {customModule || modules.length === 0 ? (
                        <Input
                            id="perm-module"
                            placeholder="e.g. academics, finance, admin"
                            {...register("module")}
                        />
                    ) : (
                        <select
                            id="perm-module"
                            value={moduleValue}
                            onChange={(e) => setValue("module", e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-transparent border border-border rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                        >
                            <option value="">Select a module…</option>
                            {modules.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.module && (
                        <p className="text-xs text-red-500">{errors.module.message}</p>
                    )}
                </div>

                {/* Preview */}
                <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">Permission slug preview</p>
                    <p className="text-sm font-mono text-foreground">
                        {watch("resource") || "resource"}.{watch("action") || "action"}
                    </p>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <Label htmlFor="perm-desc">Description</Label>
                    <Textarea
                        id="perm-desc"
                        placeholder="What does this permission allow?"
                        rows={2}
                        {...register("description")}
                    />
                    {errors.description && (
                        <p className="text-xs text-red-500">{errors.description.message}</p>
                    )}
                </div>
            </form>
        </Modal>
    );
}
