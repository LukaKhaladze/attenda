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
  company: z.string().max(120, "მაქსიმუმ 120 სიმბოლო").optional(),
  position: z.string().max(120, "მაქსიმუმ 120 სიმბოლო").optional(),
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

export const hostRegisterSchema = z.object({
  organizerName: z.string().min(2, "ორგანიზატორის სახელი სავალდებულოა").max(120),
  organizerEmail: z.string().email("ელფოსტა არასწორია"),
  organizerPhone: phoneSchema,
  organizerCompany: z.string().min(2, "კომპანია სავალდებულოა").max(120),
  title_ka: z.string().min(3, "კონფერენციის სათაური სავალდებულოა").max(180),
  date: z.string().min(1, "თარიღი სავალდებულოა"),
  location_ka: z.string().min(2, "ლოკაცია სავალდებულოა").max(160),
  description_ka: z.string().min(20, "აღწერა უნდა იყოს მინიმუმ 20 სიმბოლო"),
  websiteUrl: z.string().url("ვებსაიტის ბმული არასწორია").optional().or(z.literal("")),
  mapUrl: z.string().url("რუკის ბმული არასწორია").optional().or(z.literal("")),
  coverImageUrl: z.string().url("სურათის ბმული არასწორია").optional().or(z.literal(""))
});

export const attendeeQuerySchema = z.object({
  q: z.string().optional(),
  hasCompany: z.enum(["true", "false"]).optional(),
  hasLinkedin: z.enum(["true", "false"]).optional(),
  sort: z.enum(["az", "new"]).optional(),
  conferenceId: z.string().cuid().optional()
});

export const attendeeStatusSchema = z.object({
  status: z.enum(["APPROVED", "HIDDEN", "PENDING"])
});

export const meetingSchema = z.object({
  attendeeId: z.string().cuid(),
  title: z.string().min(3, "შეხვედრის სათაური სავალდებულოა"),
  startsAt: z.string().min(1, "აირჩიე დრო"),
  durationMinutes: z.number().int().min(15).max(180),
  notes: z.string().max(500).optional()
});
