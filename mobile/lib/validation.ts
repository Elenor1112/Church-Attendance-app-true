import { z } from "zod";

const phone = z.string().min(8, "Phone number is required").regex(/^[+\d\s()-]+$/, "Invalid phone number");

export const loginSchema = z.object({
  phone,
  password: z.string().min(4, "Password is required"),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone,
  birthday: z.string().min(1, "Birthday is required"),
  spousePhone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const manualMemberSchema = registerSchema.extend({
  role: z.enum(["member", "admin", "super-admin"]),
});

export const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  birthday: z.string().optional(),
});

export const sendAlertSchema = z.object({
  type: z.enum(["standard", "custom"]),
  message: z.string().min(3, "Message is required"),
  recipientIds: z.array(z.string()).min(1, "Choose at least one recipient"),
});

export const qrPayloadSchema = z.object({
  type: z.literal("church-attendance"),
  memberId: z.string().min(1),
  phone: z.string().min(1),
  issuedAt: z.number(),
});
