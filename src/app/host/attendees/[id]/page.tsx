import { AttendeeStatus } from "@prisma/client";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Shell } from "@/components/shell";
import { hasAdminAccess, hasHostAccess } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { getHostScopedConference } from "@/lib/host";
import { prisma } from "@/lib/prisma";
import { cleanText } from "@/lib/sanitize";

const statusLabels: Record<AttendeeStatus, string> = {
  APPROVED: "დადასტურებული",
  HIDDEN: "არ ჩანს საჯაროდ",
  PENDING: "მოლოდინში"
};

async function updateHostAttendee(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return;
  }

  const attendeeId = String(formData.get("attendeeId") || "");
  const conferenceId = String(formData.get("conferenceId") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const company = String(formData.get("company") || "").trim();
  const position = String(formData.get("position") || "").trim();
  const motivation = String(formData.get("motivation") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const linkedinUrl = String(formData.get("linkedinUrl") || "").trim();
  const status = String(formData.get("status") || "APPROVED") as AttendeeStatus;
  const consentPublicList = formData.get("consentPublicList") === "on";
  const sharePhonePublic = formData.get("sharePhonePublic") === "on";

  if (!attendeeId || !conferenceId || !fullName || !position) {
    return;
  }

  const conference = await getHostScopedConference(conferenceId, session.user.id, true);
  if (!conference) {
    return;
  }

  const attendee = await prisma.attendee.findUnique({
    where: { id: attendeeId },
    select: { id: true, conferenceId: true }
  });
  if (!attendee || attendee.conferenceId !== conference.id) {
    return;
  }

  await prisma.attendee.update({
    where: { id: attendeeId },
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

  redirect(`/host/conferences/${conference.id}?saved=1`);
}

export default async function HostAttendeeEditPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { conferenceId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/host/signin");
  }

  if (!hasHostAccess(session.user) && !hasAdminAccess(session.user)) {
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
  const conference = await getHostScopedConference(conferenceId, session.user.id, true);
  if (!conference || attendee.conferenceId !== conference.id) {
    notFound();
  }

  return (
    <Shell>
      <section className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">დამსწრის რედაქტირება</h1>
            <p className="text-sm text-brand-700">{attendee.conference.title_ka}</p>
          </div>
          <Link href={`/host/conferences/${conference.id}`} className="rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-800">
            უკან
          </Link>
        </div>

        <form action={updateHostAttendee} className="space-y-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <input type="hidden" name="attendeeId" value={attendee.id} />
          <input type="hidden" name="conferenceId" value={conference.id} />

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
                {Object.values(AttendeeStatus).map((item) => (
                  <option key={item} value={item}>
                    {statusLabels[item]}
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

          <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#3173f1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-[#255fce] sm:w-auto">
            შენახვა
          </button>
        </form>
      </section>
    </Shell>
  );
}
