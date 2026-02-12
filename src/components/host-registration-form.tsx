"use client";

import { FormEvent, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIHeader } from "@/components/ui-header";
import { UIInput } from "@/components/ui-input";

export function HostRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      organizerName: String(formData.get("organizerName") || ""),
      organizerEmail: String(formData.get("organizerEmail") || ""),
      organizerPhone: String(formData.get("organizerPhone") || ""),
      organizerCompany: String(formData.get("organizerCompany") || ""),
      title_ka: String(formData.get("title_ka") || ""),
      date: String(formData.get("date") || ""),
      location_ka: String(formData.get("location_ka") || ""),
      description_ka: String(formData.get("description_ka") || ""),
      websiteUrl: String(formData.get("websiteUrl") || ""),
      mapUrl: String(formData.get("mapUrl") || ""),
      coverImageUrl: String(formData.get("coverImageUrl") || "")
    };

    const response = await fetch("/api/host-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "მოთხოვნა ვერ შესრულდა");
      return;
    }

    setSuccess("კონფერენცია წარმატებით დაემატა. შეგიძლია უკვე დაარეგისტრირო დამსწრეები.");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-24">
      <UIHeader title="ჰოსტის რეგისტრაცია" backHref="/" />
      <UICard className="space-y-3">
        <UIInput label="სახელი და გვარი" name="organizerName" required requiredMark />
        <UIInput label="ელფოსტა" name="organizerEmail" type="email" required requiredMark />
        <UIInput label="ტელეფონი" name="organizerPhone" required requiredMark />
        <UIInput label="კომპანია" name="organizerCompany" required requiredMark />

        <hr className="border-gray-200" />

        <UIInput label="კონფერენციის სათაური" name="title_ka" required requiredMark />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">თარიღი და დრო <span className="text-error">*</span></span>
          <input name="date" type="datetime-local" required className="w-full" />
        </label>
        <UIInput label="ლოკაცია" name="location_ka" required requiredMark />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">აღწერა <span className="text-error">*</span></span>
          <textarea name="description_ka" required rows={4} className="w-full" />
        </label>

        <UIInput label="ვებსაიტის ბმული" name="websiteUrl" type="url" placeholder="https://..." />
        <UIInput label="რუკის ბმული" name="mapUrl" type="url" placeholder="https://..." />
        <UIInput label="ქავერის ფოტო URL" name="coverImageUrl" type="url" placeholder="https://..." />

        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-error">{error}</p> : null}
        {success ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-success">{success}</p> : null}
      </UICard>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        <div className="mx-auto max-w-[430px]">
          <UIButton fullWidth size="lg" disabled={loading} type="submit">
            {loading ? "იგზავნება..." : "კონფერენციის დამატება"}
          </UIButton>
        </div>
      </div>
    </form>
  );
}
