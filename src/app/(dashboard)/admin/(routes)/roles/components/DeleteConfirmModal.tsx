"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/custom/Modal";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    description: string;
    itemName: string;
}

export default function DeleteConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    itemName,
}: DeleteConfirmModalProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await onConfirm();
            onClose();
        } catch {
            // Error handled by parent
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="sm"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting && <Loader2 size={14} className="animate-spin mr-2" />}
                        Delete
                    </Button>
                </>
            }
        >
            <div className="flex flex-col items-center text-center py-2">
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4"
                >
                    <AlertTriangle size={24} className="text-red-500" />
                </motion.div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                    {description}
                </p>
                <div className="bg-muted rounded-lg px-3 py-1.5">
                    <p className="text-sm font-medium text-foreground">{itemName}</p>
                </div>
            </div>
        </Modal>
    );
}
