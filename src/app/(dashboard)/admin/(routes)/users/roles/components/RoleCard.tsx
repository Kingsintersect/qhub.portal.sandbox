"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    MoreHorizontal,
    Users,
    Copy,
    Pencil,
    Trash2,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/custom/StatusBadge";
import type { Role } from "@/types/roles";

interface RoleCardProps {
    role: Role;
    index: number;
    onView: (role: Role) => void;
    onEdit: (role: Role) => void;
    onDuplicate: (role: Role) => void;
    onDelete: (role: Role) => void;
}

export default function RoleCard({
    role,
    index,
    onView,
    onEdit,
    onDuplicate,
    onDelete,
}: RoleCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="group relative bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
            onClick={() => onView(role)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShieldCheck size={18} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-sm">{role.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{role.slug}</p>
                    </div>
                </div>

                {/* Actions menu */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {menuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(false);
                                }}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-0 top-full mt-1 z-50 w-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpen(false);
                                        onEdit(role);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-foreground"
                                >
                                    <Pencil size={14} /> Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpen(false);
                                        onDuplicate(role);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-foreground"
                                >
                                    <Copy size={14} /> Duplicate
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpen(false);
                                        onDelete(role);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-red-500"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 min-h-8">
                {role.description || "No description provided"}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users size={13} />
                        <span>{role.users_count ?? 0} users</span>
                    </div>
                    {role.is_default && (
                        <StatusBadge label="Default" variant="info" dot />
                    )}
                </div>
                <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ChevronRight size={14} />
                </div>
            </div>

            {/* Permission count badge */}
            {role.permissions && role.permissions.length > 0 && (
                <div className="absolute top-4 right-12 opacity-0 group-hover:opacity-0">
                    <StatusBadge
                        label={`${role.permissions.length} permissions`}
                        variant="purple"
                    />
                </div>
            )}
        </motion.div>
    );
}
