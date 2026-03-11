import { AttendeeStatus } from "@prisma/client";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Shell } from "@/components/shell";
import { hasAdminAccess, hasHostAccess } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { getCurrentSessionUser, getHostScopedConference } from "@/lib/host";
import { uploadImageFile } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

const statusLabels: Record<AttendeeStatus, string> = {
  APPROVED: "დადასტურებული",
  HIDDEN: "არ ჩანს საჯაროდ",
  PENDING: "მოლოდინში"
};

async function updateHostConference(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return;
  }

  const id = String(formData.get("id") || "");
  if (!id) {
    return;
  }

  const conference = await getHostScopedConference(id, session.user.id, true);
  if (!conference) {
    return;
  }

  const title = String(formData.get("title_ka") || "").trim();
  const description = String(formData.get("description_ka") || "").trim();
  const location = String(formData.get("location_ka") || "").trim();
  const dateRaw = String(formData.get("date") || "");
  const date = new Date(dateRaw);
  const slug = String(formData.get("slug") || "").trim();
  const customSubdomain = String(formData.get("customSubdomain") || "").trim().toLowerCase() || null;

  if (!title || !description || !location || !slug || Number.isNaN(date.valueOf())) {
    return;
  }

  const agenda = String(formData.get("agenda") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const speakers = String(formData.get("speakers") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const existingCoverImageUrl = String(formData.get("existingCoverImageUrl") || "").trim();
  const coverImageFile = formData.get("coverImageFile");
  const uploadedCoverImageUrl =
    coverImageFile instanceof File && coverImageFile.size > 0
      ? await uploadImageFile(coverImageFile, "conference-covers")
      : null;

  await prisma.conference.update({
    where: { id },
    data: {
      slug,
      customSubdomain,
      title_ka: title,
      description_ka: description,
      location_ka: location,
      date,
      coverImageUrl: uploadedCoverImageUrl || existingCoverImageUrl || null,
      websiteUrl: String(formData.get("websiteUrl") || "").trim() || null,
      mapUrl: String(formData.get("mapUrl") || "").trim() || null,
      agendaHighlights: agenda,
      speakers
    }
  });

  redirect(`/host/conferences/${id}`);
}

export default async function HostConferencePage({ params }: { params: { id: string } }) {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    redirect("/host/signin");
  }

  if (!hasHostAccess(sessionUser) && !hasAdminAccess(sessionUser)) {
    redirect("/");
  }

  const conference = await getHostScopedConference(params.id, sessionUser.id, true);
  if (!conference) {
    notFound();
  }

  const attendees = await prisma.attendee.findMany({
    where: { conferenceId: conference.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  const agenda = ((conference.agendaHighlights as string[] | null) ?? []).join("\n");
  const speakers = ((conference.speakers as string[] | null) ?? []).join("\n");
  const requestHeaders = headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");
  const origin =
    host
      ? `${forwardedProto || "https"}://${host}`
      : process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const shareUrl = conference.customSubdomain && process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${conference.customSubdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : `${origin}/conference/${conference.slug}`;

  return (
    <Shell>
      <section className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">კონფერენციის მართვა</h1>
            <p className="text-sm text-brand-700">{conference.title_ka}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/host" className="rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-800">
              უკან
            </Link>
            <AdminLogoutButton callbackUrl="/host/signin" />
          </div>
        </div>

        <form action={updateHostConference} className="space-y-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-brand-900">კონფერენციის ინფორმაცია</h2>
          <input type="hidden" name="id" value={conference.id} />
          <input type="hidden" name="existingCoverImageUrl" value={conference.coverImageUrl ?? ""} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="slug" defaultValue={conference.slug} placeholder="ბმულის სლაგი" required />
            <input name="customSubdomain" defaultValue={conference.customSubdomain ?? ""} placeholder="ქასთომ სუბდომენი (მაგ: itmeet)" />
            <input name="title_ka" defaultValue={conference.title_ka} placeholder="სათაური" required />
            <input type="datetime-local" name="date" defaultValue={conference.date.toISOString().slice(0, 16)} required />
            <input name="location_ka" defaultValue={conference.location_ka} placeholder="ლოკაცია" required />
            <input name="websiteUrl" defaultValue={conference.websiteUrl ?? ""} placeholder="ვებსაიტის URL" />
            <input name="mapUrl" defaultValue={conference.mapUrl ?? ""} placeholder="რუქის URL" />
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-brand-800">ქავერის სურათი</span>
              <input type="file" name="coverImageFile" accept="image/*" className="w-full border-dashed" />
            </label>
            <textarea name="agenda" defaultValue={agenda} rows={5} placeholder="დღის წესრიგი — თითო ჩანაწერი ახალ ხაზზე" />
            <textarea name="speakers" defaultValue={speakers} rows={5} placeholder="სპიკერები — თითო ჩანაწერი ახალ ხაზზე" />
            <textarea className="sm:col-span-2" name="description_ka" defaultValue={conference.description_ka} rows={4} placeholder="აღწერა" required />
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-brand-700 break-all">{shareUrl}</p>
            <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">შენახვა</button>
          </div>
        </form>

        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-900">რეგისტრაციები ({attendees.length})</h2>
            <Link href={`/conference/${conference.slug}`} className="rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-800">
              საჯარო გვერდი
            </Link>
          </div>

          {attendees.length === 0 ? (
            <p className="rounded-lg border border-dashed border-brand-200 p-4 text-sm text-brand-700">ამ კონფერენციაზე რეგისტრაცია ჯერ არ არის.</p>
          ) : (
            <div className="space-y-3">
              {attendees.map((attendee) => (
                <article key={attendee.id} className="rounded-xl border border-brand-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-brand-900">{attendee.fullName}</p>
                      <p className="text-sm text-brand-700">
                        {[attendee.position, attendee.company].filter(Boolean).join(" • ") || "პროფილი არასრულია"}
                      </p>
                      <p className="text-xs text-brand-600">{statusLabels[attendee.status]}</p>
                    </div>
                    <form action={`/api/host/attendees/${attendee.id}`} method="post" className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="redirectTo" value={`/host/conferences/${conference.id}`} />
                      <input type="hidden" name="status" value="APPROVED" />
                      <button className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white">დადასტურება</button>
                    </form>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={`/api/host/attendees/${attendee.id}`} method="post">
                      <input type="hidden" name="redirectTo" value={`/host/conferences/${conference.id}`} />
                      <input type="hidden" name="status" value="PENDING" />
                      <button className="rounded-lg border border-brand-200 px-3 py-2 text-xs text-brand-800">მოლოდინში დატოვება</button>
                    </form>
                    <form action={`/api/host/attendees/${attendee.id}`} method="post">
                      <input type="hidden" name="redirectTo" value={`/host/conferences/${conference.id}`} />
                      <input type="hidden" name="status" value="HIDDEN" />
                      <button className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700">დამალვა</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}
