import { z } from 'zod';

export const FinancialSummaryFiltersSchema = z.object({
    status: z.string().optional(),
    academicYear: z.string().optional(),
    semester: z.string().optional(),
    program: z.string().optional(),
});

export type FinancialSummaryFilters = z.infer<typeof FinancialSummaryFiltersSchema>;
