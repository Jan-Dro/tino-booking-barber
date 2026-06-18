import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GOOGLE_CLIENT_EMAIL: z.string().email().optional(),
  GOOGLE_PRIVATE_KEY: z.string().min(1).optional(),
  GOOGLE_CALENDAR_ID: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  BARBER_EMAIL: z.string().email().optional(),
  MONDAY_SLOTS: z.string().optional(),
  MONDAY_START: z.string().default("09:00"),
  MONDAY_END: z.string().default("17:00"),
  TUESDAY_SLOTS: z.string().optional(),
  TUESDAY_START: z.string().default("09:00"),
  TUESDAY_END: z.string().default("16:00"),
  WEDNESDAY_SLOTS: z.string().optional(),
  WEDNESDAY_START: z.string().default("17:30"),
  WEDNESDAY_END: z.string().default("18:30"),
  THURSDAY_SLOTS: z.string().optional(),
  THURSDAY_START: z.string().default("17:30"),
  THURSDAY_END: z.string().default("18:30"),
  FRIDAY_SLOTS: z.string().optional(),
  FRIDAY_START: z.string().default("17:30"),
  FRIDAY_END: z.string().default("18:30"),
  SATURDAY_SLOTS: z.string().optional(),
  SATURDAY_START: z.string().default("18:00"),
  SATURDAY_END: z.string().default("19:00"),
  SUNDAY_SLOTS: z.string().optional(),
  SUNDAY_START: z.string().default("00:00"),
  SUNDAY_END: z.string().default("00:00"),
});

let cachedPublicEnv: z.infer<typeof publicEnvSchema> | null = null;
let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getPublicEnv() {
  if (cachedPublicEnv) return cachedPublicEnv;

  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid public environment variables: ${errors}`);
  }

  cachedPublicEnv = result.data;
  return cachedPublicEnv;
}

export function getServerEnv() {
  if (cachedServerEnv) return cachedServerEnv;

  const result = serverEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    BARBER_EMAIL: process.env.BARBER_EMAIL,
    MONDAY_SLOTS: process.env.MONDAY_SLOTS,
    MONDAY_START: process.env.MONDAY_START,
    MONDAY_END: process.env.MONDAY_END,
    TUESDAY_SLOTS: process.env.TUESDAY_SLOTS,
    TUESDAY_START: process.env.TUESDAY_START,
    TUESDAY_END: process.env.TUESDAY_END,
    WEDNESDAY_SLOTS: process.env.WEDNESDAY_SLOTS,
    WEDNESDAY_START: process.env.WEDNESDAY_START,
    WEDNESDAY_END: process.env.WEDNESDAY_END,
    THURSDAY_SLOTS: process.env.THURSDAY_SLOTS,
    THURSDAY_START: process.env.THURSDAY_START,
    THURSDAY_END: process.env.THURSDAY_END,
    FRIDAY_SLOTS: process.env.FRIDAY_SLOTS,
    FRIDAY_START: process.env.FRIDAY_START,
    FRIDAY_END: process.env.FRIDAY_END,
    SATURDAY_SLOTS: process.env.SATURDAY_SLOTS,
    SATURDAY_START: process.env.SATURDAY_START,
    SATURDAY_END: process.env.SATURDAY_END,
    SUNDAY_SLOTS: process.env.SUNDAY_SLOTS,
    SUNDAY_START: process.env.SUNDAY_START,
    SUNDAY_END: process.env.SUNDAY_END,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid server environment variables: ${errors}`);
  }

  cachedServerEnv = {
    ...result.data,
    GOOGLE_PRIVATE_KEY: result.data.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  return cachedServerEnv;
}
