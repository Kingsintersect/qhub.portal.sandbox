import { z } from "zod"
import { PaymentMethodSchema, PaymentStatusSchema } from "./common.schema"

export const InitiatePaymentDtoSchema = z.object({
  invoiceId: z.number().int().positive(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  method: PaymentMethodSchema,
})

export const InitiatePaymentResponseSchema = z.object({
  paymentId: z.number(),
  referenceNumber: z.string(),
  // null when method is BANK_TRANSFER or other offline methods
  checkoutUrl: z.string().url().nullable(),
  status: z.literal("PENDING"),
})

export const VerifyPaymentResponseSchema = z.object({
  paymentId: z.number(),
  status: PaymentStatusSchema,
  invoice: z.object({
    id: z.number(),
    amountPaid: z.string(),
    status: z.enum(["PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"]),
  }),
})

export const PaymentHistoryItemSchema = z.object({
  id: z.number(),
  amount: z.string(),
  method: PaymentMethodSchema,
  referenceNumber: z.string(),
  status: PaymentStatusSchema,
  paidAt: z.string().datetime({ offset: true }),
})

export const PaymentHistoryResponseSchema = z.object({
  data: z.array(PaymentHistoryItemSchema),
})
