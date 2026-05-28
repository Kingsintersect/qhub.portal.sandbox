"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import Modal from "@/components/custom/Modal";
import { Button } from "@/components/ui/button";
import type { Setting } from "@/types/school";

interface DeleteSettingModalProps {
    open: boolean;
    onClose: () => void;
    setting: Setting | null;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
}

export function DeleteSettingModal({
    open,
    onClose,
    setting,
    onConfirm,
    isDeleting,
}: DeleteSettingModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            size="sm"
            footer={
                <div className="flex justify-end gap-2 p-5 pt-0">
                    <Button variant="outline" onClick={onClose} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
                        Delete
                    </Button>
                </div>
            }
        >
            <div className="p-5 flex gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle size={18} className="text-destructive" />
                </div>
                <div>
                    <p className="font-semibold text-foreground text-sm">Delete setting?</p>
                    {setting && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            This will permanently remove{" "}
                            <span className="font-mono font-medium text-foreground">
                                {setting.key}
                            </span>
                            . This action cannot be undone.
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
}
