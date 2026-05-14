"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
import { UIInput } from "@/components/ui-input";

type Props = {
  conferenceId: string;
  lang?: "ka" | "en";
};

const positionOptionsKa = [
  "დამფუძნებელი",
  "ოპერაციული დირექტორი",
  "ტექნოლოგიების ხელმძღვანელი",
  "პროექტის მენეჯერი",
  "პროდუქტის მენეჯერი",
  "მარკეტინგის მენეჯერი",
  "გაყიდვებისა და ბიზნეს განვითარების მენეჯერი",
  "პროგრამული უზრუნველყოფის დეველოპერი",
  "მომხმარებლის გამოცდილებისა და ინტერფეისის დიზაინერი",
  "კონსულტანტი / სფეროს სპეციალისტი",
  "სხვა"
];

const positionOptionsEn = [
  "Founder",
  "COO",
  "Head of Technology",
  "Project Manager",
  "Product Manager",
  "Marketing Manager",
  "Sales & Business Development Manager",
  "Software Developer",
  "UX/UI Designer",
  "Consultant / Domain Specialist",
  "Other"
];

export function RegistrationForm({ conferenceId, lang = "ka" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const startedAt = useMemo(() => Date.now(), []);
  const isEnglish = lang === "en";
  const positionOptions = isEnglish ? positionOptionsEn : positionOptionsKa;

  async function readJsonSafe(response: Response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  async function uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await readJsonSafe(response);
    if (!response.ok) throw new Error(data?.error ?? (isEnglish ? "Photo upload failed" : "ფოტოს ატვირთვა ვერ მოხერხდა"));
    return data.url as string;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setUploadNotice(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const file = formData.get("photo") as File;
      let photoUrl = "";

      if (file && file.size > 0) {
        try {
          photoUrl = await uploadPhoto(file);
        } catch {
          photoUrl = "";
          throw new Error(lang === "en" ? "Photo upload failed. Please try again." : "ფოტოს ატვირთვა ვერ მოხერხდა. სცადე თავიდან.");
        }
      }

      const payload = {
        conferenceId,
        fullName: String(formData.get("fullName") || ""),
        email: String(formData.get("email") || ""),
        company: String(formData.get("company") || ""),
        position: String(formData.get("position") || ""),
        motivation: String(formData.get("motivation") || ""),
        phone: String(formData.get("phone") || ""),
        linkedinUrl: String(formData.get("linkedinUrl") || ""),
        photoUrl,
        consentPublicList: formData.get("consentPublicList") === "on",
        sharePhonePublic: formData.get("sharePhonePublic") === "on",
        website: String(formData.get("website") || ""),
        formStartedAt: startedAt
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await readJsonSafe(response);

      if (!response.ok) throw new Error(data?.error ?? (isEnglish ? "Registration failed" : "რეგისტრაცია ვერ შესრულდა"));

      const redirectTo = typeof data?.redirectTo === "string" ? data.redirectTo : `/attendees?conferenceId=${conferenceId}`;
      router.push(isEnglish ? `${redirectTo}&lang=en` : redirectTo);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : (isEnglish ? "Unknown error" : "უცნობი შეცდომა"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-24">
      <UIHeader title={isEnglish ? "Registration" : "რეგისტრაცია"} backHref="/" />
      <UICard className="space-y-3 overflow-hidden">
        <div className="hidden">
          <label htmlFor="website">{isEnglish ? "Website" : "ვებსაიტი"}</label>
          <input id="website" name="website" autoComplete="off" tabIndex={-1} />
        </div>

        <UIInput label={isEnglish ? "Full Name" : "სახელი და გვარი"} name="fullName" required requiredMark maxLength={120} />
        <UIInput label={isEnglish ? "Email" : "ელფოსტა"} name="email" type="email" required requiredMark maxLength={180} placeholder="you@example.com" />
        <UIInput label={isEnglish ? "Company" : "კომპანია"} name="company" maxLength={120} placeholder={isEnglish ? "e.g. TechCorp Georgia" : "მაგ: TechCorp Georgia"} />
        <label className="block min-w-0 space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            {isEnglish ? "Position" : "პოზიცია"} <span className="text-error">*</span>
          </span>
          <select name="position" required defaultValue="" className="w-full">
            <option value="" disabled>
              {isEnglish ? "Select a position" : "აირჩიე პოზიცია"}
            </option>
            {positionOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0 space-y-1.5">
          <span className="text-sm font-medium text-gray-700">{isEnglish ? "Motivation for attending" : "ღონისძიებაზე დასწრების მოტივაცია"}</span>
          <textarea
            name="motivation"
            maxLength={150}
            rows={3}
            placeholder={isEnglish ? "Briefly describe why you want to attend (max 150 chars)" : "მოკლედ აღწერე რატომ გინდა დასწრება (მაქს. 150 სიმბოლო)"}
            className="w-full resize-none"
          />
        </label>
        <UIInput label={isEnglish ? "Phone" : "ტელეფონი"} name="phone" placeholder="+995..." />
        <UIInput
          label={isEnglish ? "LinkedIn URL" : "LinkedIn ბმული"}
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/..."
        />

        <label className="block min-w-0 space-y-1.5">
          <span className="text-sm font-medium text-gray-700">{isEnglish ? "Profile Photo" : "პროფილის ფოტო"}</span>
          <input name="photo" type="file" accept="image/*" className="w-full min-w-0" />
        </label>

        <label className="grid min-w-0 grid-cols-[18px,minmax(0,1fr)] items-start gap-x-3 gap-y-1 text-sm text-gray-700">
          <input type="checkbox" name="sharePhonePublic" />
          <span className="min-w-0 leading-6">{isEnglish ? "I allow my phone number to be publicly visible" : "ვადასტურებ, რომ ტელეფონი საჯაროდ ჩანდეს"}</span>
        </label>

        <label className="grid min-w-0 grid-cols-[18px,minmax(0,1fr)] items-start gap-x-3 gap-y-1 text-sm text-gray-700">
          <input type="checkbox" name="consentPublicList" defaultChecked />
          <span className="min-w-0 leading-6">{isEnglish ? "I agree to show my information in the attendee list" : "ვეთანხმები, რომ ჩემი ინფორმაცია გამოჩნდეს სიაში"}</span>
        </label>

        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-error">{error}</p> : null}
        {uploadNotice ? <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">{uploadNotice}</p> : null}
      </UICard>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        <div className="mx-auto w-full max-w-3xl">
          <UIButton fullWidth size="lg" disabled={loading} type="submit">
            {loading ? (isEnglish ? "Submitting..." : "იგზავნება...") : (isEnglish ? "Register" : "რეგისტრაცია")}
          </UIButton>
        </div>
      </div>
    </form>
  );
}
