import { z } from "zod";

export const createBookingSchema = z.object({
  hostId: z.string().uuid(),
  durationId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  locationType: z.enum(["online", "phone", "in_person"]),
  startsAt: z.string().datetime(),
  userTimezone: z.string(),
  locale: z.enum(["pl", "en"]),
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  guestNotes: z.string().max(1000).optional(),
  intakeResponses: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),
  turnstileToken: z.string().min(1),
});

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  bufferBefore: z.number().optional(),
  bufferAfter: z.number().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
});

export const hostSettingsSchema = z.object({
  minNoticeMinutes: z.number().min(0),
  maxHorizonDays: z.number().min(1).max(365),
  dailyBookingLimit: z.number().min(1).max(50),
  defaultBufferBefore: z.number().min(0),
  defaultBufferAfter: z.number().min(0),
  adminEmail: z.string().email(),
});

export const durationSchema = z.object({
  minutes: z.number().min(5).max(480),
  label: z.string().min(1),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const locationSchema = z.object({
  type: z.enum(["online", "phone", "in_person"]),
  label: z.string().min(1),
  address: z.string().optional(),
  onlineUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const intakeQuestionTypeSchema = z.enum([
  "select",
  "multiselect",
  "text",
  "textarea",
  "phone",
  "email",
]);

export const intakeQuestionOptionSchema = z.object({
  value: z.string().min(1),
  labelPl: z.string().min(1),
  labelEn: z.string().min(1),
  emoji: z.string().max(8).optional(),
});

export const intakeQuestionShowWhenSchema = z
  .object({
    locationType: z.enum(["online", "phone", "in_person"]).optional(),
    meetingType: z.enum(["business", "social"]).optional(),
  })
  .nullable()
  .optional();

export const intakeQuestionSchema = z
  .object({
    key: z
      .string()
      .min(1)
      .max(64)
      .regex(/^[a-z0-9_]+$/),
    type: intakeQuestionTypeSchema,
    labelPl: z.string().min(1),
    labelEn: z.string().min(1),
    placeholderPl: z.string().optional(),
    placeholderEn: z.string().optional(),
    options: z.array(intakeQuestionOptionSchema).optional(),
    required: z.boolean().default(false),
    sortOrder: z.number().default(0),
    isActive: z.boolean().default(true),
    showWhen: intakeQuestionShowWhenSchema,
  })
  .superRefine((data, ctx) => {
    if (
      (data.type === "select" || data.type === "multiselect") &&
      (!data.options || data.options.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options are required for select and multiselect types",
        path: ["options"],
      });
    }
  });

export const reorderIntakeQuestionsSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});
