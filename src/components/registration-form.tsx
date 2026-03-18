"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
import { UIInput } from "@/components/ui-input";

type Props = {
  conferenceId: string;
};

const positionOptions = [
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

export function RegistrationForm({ conferenceId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const startedAt = useMemo(() => Date.now(), []);

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
    if (!response.ok) throw new Error(data?.error ?? "ფოტოს ატვირთვა ვერ მოხერხდა");
    return data.url as string;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
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
          setUploadNotice("ფოტოს ატვირთვა ვერ მოხერხდა, რეგისტრაცია გაგრძელდა ფოტოს გარეშე.");
        }
      }

      const payload = {
        conferenceId,
        fullName: String(formData.get("fullName") || ""),
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

      if (!response.ok) throw new Error(data?.error ?? "რეგისტრაცია ვერ შესრულდა");

      setSuccess("რეგისტრაცია წარმატებულია. გადამისამართება მიმდინარეობს...");
      form.reset();
      setTimeout(() => router.push(`/attendees?conferenceId=${conferenceId}`), 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "უცნობი შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-24">
      <UIHeader title="რეგისტრაცია" backHref="/" />
      <UICard className="space-y-3 overflow-hidden">
        <div className="hidden">
          <label htmlFor="website">ვებსაიტი</label>
          <input id="website" name="website" autoComplete="off" tabIndex={-1} />
        </div>

        <UIInput label="სახელი" name="fullName" required requiredMark maxLength={120} />
        <UIInput label="კომპანია" name="company" maxLength={120} placeholder="მაგ: TechCorp Georgia" />
        <label className="block min-w-0 space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            პოზიცია <span className="text-error">*</span>
          </span>
          <select name="position" required defaultValue="" className="w-full">
            <option value="" disabled>
              აირჩიე პოზიცია
            </option>
            {positionOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0 space-y-1.5">
          <span className="text-sm font-medium text-gray-700">ღონისძიებაზე დასწრების მოტივაცია</span>
          <textarea
            name="motivation"
            maxLength={150}
            rows={3}
            placeholder="მოკლედ აღწერე რატომ გინდა დასწრება (მაქს. 150 სიმბოლო)"
            className="w-full resize-none"
          />
        </label>
        <UIInput label="ტელეფონი" name="phone" placeholder="+995..." />
        <UIInput
          label="LinkedIn ბმული"
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/..."
        />

        <label className="block min-w-0 space-y-1.5">
          <span className="text-sm font-medium text-gray-700">პროფილის ფოტო</span>
          <input name="photo" type="file" accept="image/*" className="w-full border-dashed" />
        </label>

        <label className="flex min-w-0 items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" name="sharePhonePublic" className="mt-1" />
          <span className="min-w-0 leading-6">ვადასტურებ, რომ ტელეფონი საჯაროდ ჩანდეს</span>
        </label>

        <label className="flex min-w-0 items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" name="consentPublicList" className="mt-1" defaultChecked />
          <span className="min-w-0 leading-6">ვეთანხმები, რომ ჩემი ინფორმაცია გამოჩნდეს სიაში</span>
        </label>

        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-error">{error}</p> : null}
        {uploadNotice ? <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">{uploadNotice}</p> : null}
        {success ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-success">{success}</p> : null}
      </UICard>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        <div className="mx-auto w-full max-w-3xl">
          <UIButton fullWidth size="lg" disabled={loading} type="submit">
            {loading ? "იგზავნება..." : "რეგისტრაცია"}
          </UIButton>
        </div>
      </div>
    </form>
  );
}
