"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
   ChevronRight,
   PanelLeftClose,
   PanelLeftOpen,
   LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navConfig, NavItem, NavGroup } from "@/config/nav.config";
import { useAppStore, useSidebarStore } from "@/store";
import Logo from "@/components/branding/Logo";
import { UNIVERSITY_NAME } from "@/config/global.config";

const roleMeta: Record<string, { label: string; cls: string }> = {
   STUDENT: { label: "Student", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
   LECTURER: { label: "Lecturer", cls: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
   HOD: { label: "HOD", cls: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400" },
   DEAN: { label: "Dean", cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
   BURSARY: { label: "Bursary", cls: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400" },
   DIRECTOR: { label: "Director", cls: "bg-pink-500/15 text-pink-600 dark:text-pink-400" },
   ADMIN: { label: "Admin", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
   SUPER_ADMIN: { label: "Super Admin", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
};

function Badge({ value, variant = "default" }: { value?: string | number; variant?: string }) {
   if (value === undefined) return null;
   const cls: Record<string, string> = {
      default: "bg-sidebar-primary/15 text-sidebar-primary",
      destructive: "bg-red-500/15 text-red-600",
      warning: "bg-amber-400/15 text-amber-700",
      success: "bg-emerald-500/15 text-emerald-700",
   };
   return (
      <span className={cn("ml-auto min-w-5 h-5 rounded-full px-1.5 text-[10px] font-bold flex items-center justify-center shrink-0", cls[variant] ?? cls.default)}>
         {value}
      </span>
   );
}

function CollapseTooltip({ label, badge, badgeVariant }: { label: string; badge?: string | number; badgeVariant?: string }) {
   return (
      <div className="pointer-events-none absolute left-full ml-2.5 z-50 hidden group-hover:flex items-center gap-2 bg-popover border border-border text-popover-foreground text-xs rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap">
         <span className="font-medium">{label}</span>
         {badge !== undefined && <Badge value={badge} variant={badgeVariant} />}
      </div>
   );
}

function NavItem_({ item, depth = 0, collapsed }: { item: NavItem; depth?: number; collapsed: boolean }) {
   const pathname = usePathname();
   // const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
   const isActive = item.href
      ? item.matchExactOnly
         ? pathname === item.href
         : pathname === item.href || pathname.startsWith(item.href + "/")
      : false;
   const hasChildren = !!item.children?.length;
   const defaultOpen = hasChildren
      ? item.children!.some((c) => c.href === pathname || c.children?.some((cc) => cc.href === pathname))
      : false;
   const [open, setOpen] = useState(defaultOpen);
   const Icon = item.icon;
   const pl = collapsed ? 0 : 12 + depth * 14;

   if (hasChildren) {
      return (
         <div>
            <button
               onClick={() => !collapsed && setOpen((p) => !p)}
               title={collapsed ? item.title : undefined}
               style={{ paddingLeft: `${pl}px` }}
               className={cn(
                  "w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  open && !collapsed && "bg-sidebar-accent/60",
                  collapsed && "justify-center px-2!"
               )}
            >
               <Icon size={17} className={cn("shrink-0", isActive && "text-sidebar-primary")} />
               <AnimatePresence initial={false}>
                  {!collapsed && (
                     <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 text-left overflow-hidden whitespace-nowrap"
                     >
                        {item.title}
                     </motion.span>
                  )}
               </AnimatePresence>
               {!collapsed && (
                  <>
                     <Badge value={item.badge} variant={item.badgeVariant} />
                     <ChevronRight size={13} className={cn("shrink-0 transition-transform duration-200 text-muted-foreground", open && "rotate-90")} />
                  </>
               )}
               {collapsed && <CollapseTooltip label={item.title} badge={item.badge} badgeVariant={item.badgeVariant} />}
            </button>
            <AnimatePresence initial={false}>
               {open && !collapsed && (
                  <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "auto", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.22, ease: "easeInOut" }}
                     className="overflow-hidden"
                  >
                     <div className="mt-0.5 ml-3 pl-2.5 border-l border-sidebar-border space-y-0.5">
                        {item.children!.map((child) => (
                           <NavItem_ key={child.title} item={child} depth={depth + 1} collapsed={false} />
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      );
   }

   return (
      <Link
         href={item.href ?? "#"}
         title={collapsed ? item.title : undefined}
         style={{ paddingLeft: `${pl}px` }}
         className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative",
            isActive
               ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
               : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2!"
         )}
      >
         <Icon size={17} className="shrink-0" />
         <AnimatePresence initial={false}>
            {!collapsed && (
               <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 overflow-hidden whitespace-nowrap"
               >
                  {item.title}
               </motion.span>
            )}
         </AnimatePresence>
         {!collapsed && <Badge value={item.badge} variant={item.badgeVariant} />}
         {isActive && collapsed && <span className="absolute right-1 top-1.5 w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground opacity-80" />}
         {collapsed && <CollapseTooltip label={item.title} badge={item.badge} badgeVariant={item.badgeVariant} />}
      </Link>
   );
}

function Group({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
   return (
      <div className="space-y-0.5">
         {group.label && !collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 pt-4 pb-1.5">
               {group.label}
            </p>
         )}
         {group.label && collapsed && <div className="my-2 mx-2 border-t border-sidebar-border" />}
         {group.items.map((item) => (
            <NavItem_ key={item.title} item={item} collapsed={collapsed} />
         ))}
      </div>
   );
}

export default function Sidebar() {
   const { user } = useAppStore();
   const { collapsed, toggle } = useSidebarStore();
   const logoRef = useRef<HTMLDivElement>(null);

   const handleLogout = async () => {
      await signOut({ callbackUrl: "/auth/signin" });
   };

   useEffect(() => {
      if (logoRef.current) {
         gsap.fromTo(logoRef.current,
            { scale: 0.6, opacity: 0, rotate: -20 },
            { scale: 1, opacity: 1, rotate: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.1 }
         );
      }
   }, []);

   if (!user) return null;

   const roleKey = user.role as keyof typeof navConfig;
   const groups = navConfig[roleKey];
   const meta = roleMeta[user.role];
   const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

   return (
      <motion.aside
         animate={{ width: collapsed ? 68 : 264 }}
         transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
         className="flex flex-col h-screen bg-sidebar border-r border-sidebar-border shrink-0 relative will-change-[width] overflow-hidden"
      >
         {/* Logo */}
         <div className={cn("flex items-center h-16 border-b border-sidebar-border shrink-0 px-4 gap-3", collapsed && "justify-center px-2")}>
            <div ref={logoRef}>
               <Logo
                  href="/"
                  showText={false}
                  imageWidth={32}
                  imageHeight={32}
                  imageClassName="h-8 w-8 rounded-lg"
               />
            </div>
            <AnimatePresence initial={false}>
               {!collapsed && (
                  <motion.div
                     initial={{ opacity: 0, x: -8 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -8 }}
                     transition={{ duration: 0.18 }}
                     className="overflow-hidden"
                  >
                     <p className="font-bold text-sm text-sidebar-foreground whitespace-nowrap leading-tight">{UNIVERSITY_NAME}</p>
                     <p className="text-[10px] text-muted-foreground whitespace-nowrap">Portal Workspace</p>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Nav scroll area */}
         <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5">
            {groups.map((group, i) => <Group key={i} group={group} collapsed={collapsed} />)}
         </div>

         {/* Footer */}
         <div className="shrink-0 border-t border-sidebar-border p-2 space-y-1">
            <div className={cn("flex items-center gap-2.5 rounded-xl px-2 py-2", collapsed && "justify-center")}>
               <div className="w-8 h-8 rounded-full bg-linear-to-br from-sidebar-primary to-emerald-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
               </div>
               <AnimatePresence initial={false}>
                  {!collapsed && (
                     <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden flex-1 min-w-0"
                     >
                        <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.name}</p>
                        <span className={cn("inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none mt-0.5", meta.cls)}>
                           {meta.label}
                        </span>
                     </motion.div>
                  )}
               </AnimatePresence>
               {!collapsed && (
                  <button onClick={handleLogout} className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Logout">
                     <LogOut size={14} />
                  </button>
               )}
            </div>
            <button
               onClick={toggle}
               className={cn("w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors", collapsed && "justify-center px-2")}
            >
               {collapsed ? <PanelLeftOpen size={15} /> : (
                  <>
                     <PanelLeftClose size={15} />
                     <span>Collapse</span>
                  </>
               )}
            </button>
         </div>
      </motion.aside>
   );
}
