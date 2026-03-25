"use client";

import { FormEvent, useState } from "react";
import { UIButton } from "@/components/ui-button";
import { UIInput } from "@/components/ui-input";

type Props = {
  triggerLabel: string;
  triggerClassName?: string;
};

export function CallbackRequestModal({ triggerLabel, triggerClassName = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

      const response = await fetch("/api/contact-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "ფორმის გაგზავნა ვერ მოხერხდა. სცადე თავიდან.");
        return;
      }

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
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#f8fbff,#eef5fb)] shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
            <div className="border-b border-white/15 bg-[linear-gradient(135deg,#0f172a,#149aa4,#5ae2e8)] px-5 py-5 text-white sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="text-left">
                  <p className="text-sm font-medium text-white/72">დაგვიტოვე მოთხოვნა</p>
                  <h3 className="mt-2 text-[1.7rem] font-bold tracking-[-0.04em] leading-[1.12]">დავგეგმოთ ზარი</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/82">
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-xl text-white transition hover:bg-white/10"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-6">
              {success ? (
                <div className="space-y-4 text-left">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold tracking-[-0.04em] text-gray-900">მიღებულია</h4>
                    <p className="max-w-sm text-sm leading-6 text-gray-600">მადლობა. მალე დაგიკავშირდებით.</p>
                  </div>
                  <UIButton
                    fullWidth
                    size="lg"
                    onClick={() => setOpen(false)}
                    className="!bg-[#5ae2e8] !text-[#0b1733] shadow-[0_18px_44px_rgba(90,226,232,0.22)] hover:!bg-[#45d3da]"
                  >
                    დახურვა
                  </UIButton>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4 text-left">
                  <UIInput label="სახელი" name="name" required />
                  <UIInput label="ელფოსტა" name="email" type="email" required />
                  <UIInput label="ტელეფონი" name="phone" required />

                  {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-error">{error}</p> : null}

                  <UIButton
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={loading}
                    className="!bg-[#5ae2e8] !text-[#0b1733] shadow-[0_18px_44px_rgba(90,226,232,0.22)] hover:!bg-[#45d3da]"
                  >
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
