import { z } from "zod";

const linkedInValidator = z
  .string()
  .url("LinkedIn ბმული არასწორია")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.hostname.includes("linkedin.com");
    } catch {
      return false;
    }
  }, "LinkedIn ბმული უნდა იყოს linkedin.com");

const phoneSchema = z
  .string()
  .min(7, "ტელეფონის ნომერი სავალდებულოა")
  .max(30, "ტელეფონის ნომერი ძალიან გრძელია")
  .regex(/^\+?[0-9()\-\s]{7,30}$/, "ტელეფონის ფორმატი არასწორია");

export const registerSchema = z.object({
  conferenceId: z.string().cuid("კონფერენციის იდენტიფიკატორი არასწორია"),
  fullName: z.string().min(2, "სახელი და გვარი სავალდებულოა").max(120, "მაქსიმუმ 120 სიმბოლო"),
  company: z.string().min(2, "კომპანია სავალდებულოა").max(120, "მაქსიმუმ 120 სიმბოლო"),
  position: z.string().min(2, "პოზიცია სავალდებულოა").max(120, "მაქსიმუმ 120 სიმბოლო"),
  phone: phoneSchema,
  linkedinUrl: linkedInValidator,
  photoUrl: z.string().url("ფოტოს ბმული არასწორია").optional().or(z.literal("")),
  consentPublicList: z.literal(true, {
    errorMap: () => ({ message: "მონიშნე თანხმობა საჯარო სიაში გამოსაჩენად" })
  }),
  sharePhonePublic: z.boolean().default(false),
  website: z.string().optional(),
  formStartedAt: z.number()
});

export const attendeeQuerySchema = z.object({
  q: z.string().optional(),
  position: z.string().max(120).optional(),
  hasCompany: z.enum(["true", "false"]).optional(),
  hasLinkedin: z.enum(["true", "false"]).optional(),
  sort: z.enum(["az", "new"]).optional(),
  conferenceId: z.string().cuid().optional()
});

export const attendeeStatusSchema = z.object({
  status: z.enum(["APPROVED", "HIDDEN", "PENDING"])
});

export const attendeeProfileUpdateSchema = z.object({
  fullName: z.string().min(2, "სახელი და გვარი სავალდებულოა").max(120),
  company: z.string().max(120).optional().or(z.literal("")),
  position: z.string().max(120).optional().or(z.literal("")),
  phone: phoneSchema,
  linkedinUrl: linkedInValidator,
  photoUrl: z.string().url("ფოტოს ბმული არასწორია").optional().or(z.literal("")),
  sharePhonePublic: z.boolean(),
  consentPublicList: z.boolean()
});
