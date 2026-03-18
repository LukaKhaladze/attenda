"use client";

import { FormEvent, useEffect, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UICard } from "@/components/ui-card";
import { UIInput } from "@/components/ui-input";

type AttendeeProfile = {
  fullName: string;
  company: string | null;
  position: string | null;
  motivation: string | null;
  phone: string;
  linkedinUrl: string;
  photoUrl: string | null;
  sharePhonePublic: boolean;
  consentPublicList: boolean;
};

export function AttendeeProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<AttendeeProfile>({
    fullName: "",
    company: "",
    position: "",
    motivation: "",
    phone: "",
    linkedinUrl: "",
    photoUrl: "",
    sharePhonePublic: false,
    consentPublicList: true
  });

  async function readJsonSafe(response: Response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/attendee-profile");
      const data = await readJsonSafe(response);
      if (!response.ok) {
        setError(data?.error ?? "პროფილი ვერ ჩაიტვირთა");
        setLoading(false);
        return;
      }

      setForm({
        fullName: data.item.fullName || "",
        company: data.item.company || "",
        position: data.item.position || "",
        motivation: data.item.motivation || "",
        phone: data.item.phone || "",
        linkedinUrl: data.item.linkedinUrl || "",
        photoUrl: data.item.photoUrl || "",
        sharePhonePublic: Boolean(data.item.sharePhonePublic),
        consentPublicList: Boolean(data.item.consentPublicList)
      });
      setLoading(false);
    }

    load().catch(() => {
      setError("პროფილი ვერ ჩაიტვირთა");
      setLoading(false);
    });
  }, []);

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
    setSaving(true);
    setError(null);
    setMessage(null);

    const target = event.currentTarget;
    const formData = new FormData(target);
    const file = formData.get("photo") as File;
    let photoUrl = form.photoUrl || "";

    if (file && file.size > 0) {
      try {
        photoUrl = await uploadPhoto(file);
      } catch {
        photoUrl = form.photoUrl || "";
      }
    }

    const payload = {
      fullName: form.fullName,
      company: form.company || "",
      position: form.position || "",
      motivation: form.motivation || "",
      phone: form.phone,
      linkedinUrl: form.linkedinUrl,
      photoUrl,
      sharePhonePublic: form.sharePhonePublic,
      consentPublicList: form.consentPublicList
    };

    try {
      const response = await fetch("/api/attendee-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await readJsonSafe(response);

      if (!response.ok) {
        setError(data?.error ?? "განახლება ვერ შესრულდა");
        return;
      }

      setForm((prev) => ({ ...prev, photoUrl }));
      setMessage("პროფილი განახლდა წარმატებით");
    } catch {
      setError("განახლება ვერ შესრულდა");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-600">იტვირთება...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <UICard className="space-y-3">
        <UIInput label="სახელი" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
        <UIInput label="კომპანია" value={form.company || ""} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} />
        <UIInput label="პოზიცია" value={form.position || ""} onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))} required />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">ღონისძიებაზე დასწრების მოტივაცია</span>
          <textarea
            value={form.motivation || ""}
            onChange={(event) => setForm((prev) => ({ ...prev, motivation: event.target.value }))}
            maxLength={150}
            rows={3}
            placeholder="მაქს. 150 სიმბოლო"
            className="w-full resize-none"
          />
        </label>
        <UIInput label="ტელეფონი" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
        <UIInput label="LinkedIn ბმული" type="url" value={form.linkedinUrl} onChange={(event) => setForm((prev) => ({ ...prev, linkedinUrl: event.target.value }))} />
        <label className="block min-w-0 space-y-1.5">
          <span className="text-sm font-medium text-gray-700">ახალი პროფილის ფოტო</span>
          <input name="photo" type="file" accept="image/*" className="w-full min-w-0" />
        </label>

        <label className="grid min-w-0 grid-cols-[18px,minmax(0,1fr)] items-start gap-x-3 gap-y-1 text-sm text-gray-700">
          <input type="checkbox" checked={form.sharePhonePublic} onChange={(event) => setForm((prev) => ({ ...prev, sharePhonePublic: event.target.checked }))} />
          <span className="min-w-0 leading-6">ტელეფონი საჯაროდ გამოჩნდეს</span>
        </label>

        <label className="grid min-w-0 grid-cols-[18px,minmax(0,1fr)] items-start gap-x-3 gap-y-1 text-sm text-gray-700">
          <input type="checkbox" checked={form.consentPublicList} onChange={(event) => setForm((prev) => ({ ...prev, consentPublicList: event.target.checked }))} />
          <span className="min-w-0 leading-6">ჩემი პროფილი დარჩეს საჯარო დამსწრეთა სიაში</span>
        </label>

        <UIButton type="submit" disabled={saving} fullWidth>
          {saving ? "ინახება..." : "პროფილის განახლება"}
        </UIButton>

        {error ? <p className="text-sm text-error">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}
      </UICard>
    </form>
  );
}
