import { z } from "zod"

export const AssessmentTypeSchema = z.enum(["assignment", "quiz", "forum"])

export const AssessmentResponseSchema = z.object({
  id: z.number(),
  assessmentType: AssessmentTypeSchema,
  name: z.string(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(),
  maxGrade: z.number().nullable(),
  course: z.object({
    moodleShortName: z.string(),
    moodleFullName: z.string(),
    courseOffering: z.object({
      course: z.object({ code: z.string(), title: z.string() }),
    }),
  }),
})

export const AssessmentListResponseSchema = z.object({
  data: z.array(AssessmentResponseSchema),
})
