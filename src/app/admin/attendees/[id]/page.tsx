import { AttendeeStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { hasAdminAccess } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";

const statusLabels: Record<AttendeeStatus, string> = {
  APPROVED: "დამტკიცებული",
  HIDDEN: "დამალული",
  PENDING: "მოლოდინში"
};

async function updateAttendee(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!hasAdminAccess(session?.user)) {
    return;
  }

  const id = String(formData.get("id") || "");
  const conferenceId = String(formData.get("conferenceId") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const company = String(formData.get("company") || "").trim();
  const position = String(formData.get("position") || "").trim();
  const motivation = String(formData.get("motivation") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const linkedinUrl = String(formData.get("linkedinUrl") || "").trim();
  const status = String(formData.get("status") || "PENDING") as AttendeeStatus;
  const consentPublicList = formData.get("consentPublicList") === "on";
  const sharePhonePublic = formData.get("sharePhonePublic") === "on";

  if (!id || !conferenceId || !fullName || !position) {
    return;
  }

  await prisma.attendee.update({
    where: { id },
    data: {
      fullName: cleanText(fullName),
      email: email ? cleanText(email) : null,
      company: company ? cleanText(company) : null,
      position: cleanText(position),
      motivation: motivation ? cleanText(motivation) : null,
      phone: phone ? cleanText(phone) : "",
      linkedinUrl: linkedinUrl ? cleanText(linkedinUrl) : "",
      status,
      consentPublicList,
      sharePhonePublic
    }
  });

  redirect(`/admin/conferences/${conferenceId}`);
}

export default async function AdminAttendeeEditPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { conferenceId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  if (!hasAdminAccess(session.user)) {
    redirect("/");
  }

  const attendee = await prisma.attendee.findUnique({
    where: { id: params.id },
    include: { conference: true }
  });

  if (!attendee) {
    notFound();
  }

  const conferenceId = searchParams.conferenceId || attendee.conferenceId;

  return (
    <Shell>
      <section className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">დამსწრის რედაქტირება</h1>
            <p className="text-sm text-brand-700">{attendee.conference.title_ka}</p>
          </div>
          <Link href={`/admin/conferences/${conferenceId}`} className="rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-800">
            უკან
          </Link>
        </div>

        <form action={updateAttendee} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <input type="hidden" name="id" value={attendee.id} />
          <input type="hidden" name="conferenceId" value={conferenceId} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">სახელი</span>
              <input name="fullName" defaultValue={attendee.fullName} required />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">პოზიცია</span>
              <input name="position" defaultValue={attendee.position ?? ""} required />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">ელფოსტა</span>
              <input name="email" type="email" defaultValue={attendee.email ?? ""} />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">კომპანია</span>
              <input name="company" defaultValue={attendee.company ?? ""} />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">ტელეფონი</span>
              <input name="phone" defaultValue={attendee.phone ?? ""} />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">LinkedIn</span>
              <input name="linkedinUrl" defaultValue={attendee.linkedinUrl ?? ""} />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">სტატუსი</span>
              <select name="status" defaultValue={attendee.status}>
                {Object.values(AttendeeStatus).map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="block text-sm font-medium text-brand-800">მოტივაცია</span>
              <textarea name="motivation" rows={4} defaultValue={attendee.motivation ?? ""} />
            </label>
          </div>

          <div className="flex flex-col gap-3 text-sm text-brand-800">
            <label className="flex items-start gap-2">
              <input type="checkbox" name="consentPublicList" defaultChecked={attendee.consentPublicList} className="mt-1" />
              <span>დამსწრე ჩანდეს საჯარო სიაში</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" name="sharePhonePublic" defaultChecked={attendee.sharePhonePublic} className="mt-1" />
              <span>ტელეფონი ჩანდეს საჯაროდ</span>
            </label>
          </div>

          <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
            მიმდინარე attendee რეგისტრაციის flow პაროლს არ იყენებს, ამიტომ აქედან მხოლოდ პროფილის მონაცემების რედაქტირებაა შესაძლებელი.
          </p>

          <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#3173f1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-[#255fce] sm:w-auto">
            შენახვა
          </button>
        </form>
      </section>
    </Shell>
  );
}
