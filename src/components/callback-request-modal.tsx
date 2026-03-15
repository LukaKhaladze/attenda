"use client";

import { FormEvent, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UIInput } from "@/components/ui-input";

const SALES_EMAIL = "hello@attenda.ge";

type Props = {
  triggerLabel: string;
  triggerClassName?: string;
};

export function CallbackRequestModal({ triggerLabel, triggerClassName = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function openMailClient(payload: { name: string; email: string; phone: string }) {
    const subject = encodeURIComponent(`დარეკვის მოთხოვნა — ${payload.name}`);
    const body = encodeURIComponent(
      [
        "ახალი მოთხოვნა საიტიდან:",
        "",
        `სახელი: ${payload.name}`,
        `ელფოსტა: ${payload.email}`,
        `ტელეფონი: ${payload.phone}`
      ].join("\n")
    );

    window.location.href = `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        phone: String(formData.get("phone") || "").trim()
      };

      if (!payload.name || !payload.email || !payload.phone) {
        setError("გთხოვ, შეავსე სახელი, ელფოსტა და ტელეფონი.");
        return;
      }

      openMailClient(payload);
      setSuccess(true);
      form.reset();
    } catch {
      setError("ფორმის გაგზავნა ვერ მოხერხდა. სცადე თავიდან.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020617]/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[32px] border border-white/20 bg-[linear-gradient(180deg,#f8fbff,#eef5fb)] shadow-[0_36px_90px_rgba(15,23,42,0.28)]">
            <div className="border-b border-white/15 bg-[linear-gradient(135deg,#0f172a,#1d4ed8,#38bdf8)] px-6 py-7 text-white sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="text-left">
                  <p className="text-sm font-medium text-white/72">დაგვიტოვე მოთხოვნა</p>
                  <h3 className="mt-2 text-[2rem] font-bold tracking-[-0.04em]">დავგეგმოთ ზარი</h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-white/82">
                    შეავსე ფორმა და მალე დაგიკავშირდებით, რათა შევაფასოთ თქვენი ივენთის საჭიროებები.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="დახურვა"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                    setSuccess(false);
                  }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-xl text-white transition hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-7 sm:px-8">
              {success ? (
                <div className="space-y-5 text-left">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold tracking-[-0.04em] text-gray-900">მიღებულია</h4>
                    <p className="max-w-md text-base leading-7 text-gray-600">მადლობა. მალე დაგიკავშირდებით.</p>
                  </div>
                  <UIButton fullWidth size="lg" onClick={() => setOpen(false)}>
                    დახურვა
                  </UIButton>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5 text-left">
                  <UIInput label="სახელი" name="name" required placeholder="მაგ: ნიკა ცინცაძე" />
                  <UIInput label="ელფოსტა" name="email" type="email" required placeholder="you@company.com" />
                  <UIInput label="ტელეფონი" name="phone" required placeholder="+995 5XX XX XX XX" />

                  {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-error">{error}</p> : null}

                  <UIButton type="submit" fullWidth size="lg" disabled={loading} className="shadow-[0_18px_44px_rgba(37,99,235,0.22)]">
                    {loading ? "იგზავნება..." : "გაგზავნა"}
                  </UIButton>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
