"use client";

import { FormEvent, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UIInput } from "@/components/ui-input";

const SALES_EMAIL = "hello@attenda.ge";

export function LeadCaptureForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openMailClient(payload: { name: string; email: string; phone: string; callMeBack: boolean }) {
    const subject = encodeURIComponent(`ახალი ლიდი — ${payload.name}`);
    const body = encodeURIComponent(
      [
        "ახალი მოთხოვნა საიტიდან:",
        "",
        `სახელი: ${payload.name}`,
        `ელფოსტა: ${payload.email}`,
        `ტელეფონი: ${payload.phone}`,
        `დამირეკეთ: ${payload.callMeBack ? "კი" : "არა"}`
      ].join("\n")
    );

    window.location.href = `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        callMeBack: formData.get("callMeBack") === "on"
      };

      if (!payload.name || !payload.email || !payload.phone) {
        setError("გთხოვ, შეავსე სახელი, ელფოსტა და ტელეფონი.");
        return;
      }

      openMailClient(payload);
      setMessage("მოთხოვნა მზადაა გასაგზავნად. გაიხსნა შენი ელფოსტის ფანჯარა.");
      form.reset();
    } catch {
      setError("მოთხოვნის დაწყება ვერ მოხერხდა. სცადე თავიდან.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#dbeafe] bg-white shadow-[0_24px_60px_rgba(37,99,235,0.12)]">
      <div className="border-b border-[#dbeafe] bg-[linear-gradient(135deg,#2563eb,#38bdf8)] px-6 py-6 text-white sm:px-8">
        <p className="text-sm font-medium text-white/80">დატოვე მოთხოვნა</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em]">მოკლე ფორმა დემოსთვის</h3>
        <p className="mt-2 text-sm leading-7 text-white/82">
          დაგიკავშირდებით, გაჩვენებთ workflow-ს და მოგიმზადებთ შენს ღონისძიებაზე მორგებულ სცენარს.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 px-6 py-6 sm:px-8">
        <UIInput label="სახელი" name="name" required placeholder="მაგ: ნიკა ცინცაძე" />
        <UIInput label="ელფოსტა" name="email" type="email" required placeholder="you@company.com" />
        <UIInput label="ტელეფონი" name="phone" required placeholder="+995 5XX XX XX XX" />

        <label className="flex min-h-11 items-start gap-3 rounded-2xl border border-gray-200 bg-[#f8fbff] px-4 py-3 text-sm text-gray-700">
          <input type="checkbox" name="callMeBack" className="mt-1 h-4 w-4 rounded border-gray-300" />
          <span>დამირეკეთ და თავად გამაცანით როგორ იმუშავებს პლატფორმა ჩემს ღონისძიებაზე</span>
        </label>

        <UIButton type="submit" fullWidth size="lg" disabled={loading} className="shadow-[0_18px_44px_rgba(37,99,235,0.22)]">
          {loading ? "მუშავდება..." : "მოთხოვნის გაგზავნა"}
        </UIButton>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-error">{error}</p> : null}
        {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      </form>
    </div>
  );
}
