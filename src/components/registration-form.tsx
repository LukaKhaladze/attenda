"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type Props = {
  conferenceId: string;
};

export function RegistrationForm({ conferenceId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const startedAt = useMemo(() => Date.now(), []);

  async function uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "ფოტოს ატვირთვა ვერ მოხერხდა");
    }

    return data.url as string;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const file = formData.get("photo") as File;
      let photoUrl = "";

      if (file && file.size > 0) {
        photoUrl = await uploadPhoto(file);
      }

      const payload = {
        conferenceId,
        fullName: String(formData.get("fullName") || ""),
        company: String(formData.get("company") || ""),
        position: String(formData.get("position") || ""),
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "რეგისტრაცია ვერ შესრულდა");
      }

      setSuccess("რეგისტრაცია წარმატებულია. გადამისამართება მიმდინარეობს...");
      form.reset();
      setTimeout(() => {
        router.push("/attendees");
      }, 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "უცნობი შეცდომა");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
      <h2 className="text-xl font-semibold text-brand-900">დამსწრის რეგისტრაცია</h2>
      <div className="hidden">
        <label htmlFor="website">ვებსაიტი</label>
        <input id="website" name="website" autoComplete="off" tabIndex={-1} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">სახელი და გვარი *</label>
          <input name="fullName" required maxLength={120} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">კომპანია</label>
          <input name="company" maxLength={120} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">პოზიცია</label>
          <input name="position" maxLength={120} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">ტელეფონი *</label>
          <input name="phone" required placeholder="+995..." />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">LinkedIn ბმული *</label>
          <input name="linkedinUrl" required type="url" placeholder="https://linkedin.com/in/..." />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium">პროფილის ფოტო (არასავალდებულო)</label>
          <input name="photo" type="file" accept="image/*" className="w-full border-dashed" />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="sharePhonePublic" className="mt-1" />
        <span>ვადასტურებ, რომ ჩემი ტელეფონი საჯაროდ ჩანდეს დამსწრეთა დეტალში</span>
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consentPublicList" required className="mt-1" />
        <span>ვوافقი, რომ ჩემი ინფორმაცია გამოჩნდეს დამსწრეთა სიაში *</span>
      </label>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <button
        disabled={loading}
        className="inline-flex rounded-xl bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "იგზავნება..." : "რეგისტრაცია"}
      </button>
    </form>
  );
}
