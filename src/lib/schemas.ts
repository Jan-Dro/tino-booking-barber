import { z } from "zod";

export const bookingInputSchema = z.object({
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7).max(30),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const availabilityQuerySchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const adminBookingsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "confirmed", "cancelled"]).default("all"),
});
