// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { feeAccountApi } from "../services/feeManagementApi";
// import type { GenerateFeeAccountsPayload } from "../types";

// export function useGenerateFeeAccounts() {
//     const qc = useQueryClient();
//     return useMutation({
//         mutationFn: (payload: GenerateFeeAccountsPayload) =>
//             feeAccountApi.generate(payload),
//         onSuccess: () => {
//             // Invalidate everything downstream
//             qc.invalidateQueries({ queryKey: ["fee-accounts"] });
//         },
//     });
// }
import { useMutation } from "@tanstack/react-query";
import { feeManagementMutationOptions } from "@/services/feeManagementApi";

export function useGenerateFeeAccounts() {
    return useMutation({
        ...feeManagementMutationOptions.generateFeeAccounts(),
    });
}
