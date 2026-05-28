"use client";

import { PermissionGate } from "@/lib/permissions/PermissionGate";
import { usePermissions } from "@/lib/permissions/usePermissions";
import FeeManagementPage from "./FeeManagement";
import FinancialSummaryPage from "./FinancialSummary";
import FinancialTransactionsPage from "./FinancialTransactions";

// ========== FEE MANAGEMENT SHELL ==========
// Requires: fees:configure OR fees:manage (permission 22 or 21)
export function FeeManagementShell() {
   const { can } = usePermissions();

   const canManage = can({ resource: "fees", action: "manage" });
   const canConfigure = can({ resource: "fees", action: "configure" });

   return (
      <div className="space-y-8">
         <PermissionGate
            require={[
               { resource: "fees", action: "configure" },
               { resource: "fees", action: "manage" }
            ]}
            mode="any"
         >
            <FeeManagementPage
               canManage={canManage}
               canConfigure={canConfigure}
            />
         </PermissionGate>
      </div>
   );
}

// ========== FINANCIAL SUMMARY SHELL ==========
// Requires: finance:view (permission 21)
export function FinancialSummaryShell() {
   const { can } = usePermissions();

   const canView = can({ resource: "finance", action: "view.dashboard" });
   const canManage = can({ resource: "fees", action: "manage" });
   const canExport = can({ resource: "finance", action: "export" });
   const canViewTransactions = can({ resource: "finance", action: "view.transactions" });

   return (
      <div className="space-y-8">
         <PermissionGate
            require={[
               { resource: "finance", action: "view.dashboard" },
               { resource: "finance", action: "view.transactions" },
               { resource: "fees", action: "manage" },
            ]}
            mode="any"
         >
            <FinancialSummaryPage
               canView={canView}
               canManage={canManage}
               canExport={canExport}
               canViewTransactions={canViewTransactions}
            />
         </PermissionGate>
      </div>
   );
}

// ========== FINANCIAL TRANSACTIONS SHELL ==========
// Requires: finance:view.transactions (permission 25)
export function FinancialTransactionsShell() {
   const { can } = usePermissions();

   const canViewTransactions = can({ resource: "finance", action: "view.transactions" });
   const canManage = can({ resource: "fees", action: "manage" });
   const canExport = can({ resource: "finance", action: "export" });

   return (
      <div className="space-y-8">
         <PermissionGate require={{ resource: "finance", action: "view.transactions" }}>
            <FinancialTransactionsPage
               canViewTransactions={canViewTransactions}
               canManage={canManage}
               canExport={canExport}
            />
         </PermissionGate>
      </div>
   );
}
