"use client";

import { useState } from "react";
import { Plus, LayoutTemplate, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/custom/SectionCard";
import StatusBadge from "@/components/custom/StatusBadge";
import EmptyState from "@/components/custom/EmptyState";
import {
    useNotificationTemplates,
    useCreateTemplate,
    useUpdateTemplate,
    useDeleteTemplate,
} from "@/hooks/useNotifications";
import type { NotificationTemplate, CreateTemplatePayload, UpdateTemplatePayload } from "@/types/notifications";
import { TemplateFormModal } from "./TemplateFormModal";
import { DeleteTemplateModal } from "./DeleteTemplateModal";
import { ChannelBadge } from "./NotificationBadges";

export function TemplatesPanel() {
    const { data: templates = [], isLoading } = useNotificationTemplates();
    const createTemplate = useCreateTemplate();
    const updateTemplate = useUpdateTemplate();
    const deleteTemplate = useDeleteTemplate();

    const [formOpen, setFormOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [selected, setSelected] = useState<NotificationTemplate | null>(null);

    const openCreate = () => {
        setSelected(null);
        setFormMode("create");
        setFormOpen(true);
    };

    const openEdit = (t: NotificationTemplate) => {
        setSelected(t);
        setFormMode("edit");
        setFormOpen(true);
    };

    const openDelete = (t: NotificationTemplate) => {
        setSelected(t);
        setDeleteOpen(true);
    };

    const handleFormSubmit = async (data: CreateTemplatePayload) => {
        try {
            if (formMode === "create") {
                await createTemplate.mutateAsync(data);
                toast.success("Template created");
            } else if (selected) {
                await updateTemplate.mutateAsync({
                    id: selected.id,
                    payload: data as UpdateTemplatePayload,
                });
                toast.success("Template updated");
            }
            setFormOpen(false);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            await deleteTemplate.mutateAsync(selected.id);
            toast.success("Template deleted");
            setDeleteOpen(false);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        }
    };

    return (
        <>
            <SectionCard
                title="Notification Templates"
                icon={LayoutTemplate}
                badge={
                    <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-1.5">
                        {templates.length}
                    </span>
                }
                actions={
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="size-4" data-icon="inline-start" />
                        New Template
                    </Button>
                }
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                ) : templates.length === 0 ? (
                    <EmptyState
                        icon={LayoutTemplate}
                        title="No templates yet"
                        description="Create reusable templates with variable support for emails, SMS, and in-app messages."
                        action={<Button onClick={openCreate}><Plus className="size-4" data-icon="inline-start" />New Template</Button>}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Subject</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-25">Channel</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-20">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide w-40">Updated</th>
                                    <th className="w-20" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {templates.map((t) => (
                                    <tr key={t.id} className="group/row hover:bg-accent/40 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-xs font-medium text-foreground">{t.name}</span>
                                        </td>
                                        <td className="py-3 px-4 max-w-70">
                                            <p className="text-sm text-foreground truncate" title={t.subject}>{t.subject}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <ChannelBadge channel={t.channel} />
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge
                                                label={t.isActive ? "Active" : "Inactive"}
                                                variant={t.isActive ? "success" : "default"}
                                                dot
                                            />
                                        </td>
                                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(t.updatedAt).toLocaleDateString("en-GB", {
                                                day: "2-digit", month: "short", year: "numeric",
                                            })}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1 justify-end opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="size-7" onClick={() => openEdit(t)} title="Edit">
                                                    <Edit2 size={13} />
                                                </Button>
                                                <Button
                                                    size="icon" variant="ghost"
                                                    className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => openDelete(t)} title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            <TemplateFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                mode={formMode}
                template={selected ?? undefined}
                onSubmit={handleFormSubmit}
                isSubmitting={createTemplate.isPending || updateTemplate.isPending}
            />

            <DeleteTemplateModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                template={selected}
                onConfirm={handleDelete}
                isDeleting={deleteTemplate.isPending}
            />
        </>
    );
}
