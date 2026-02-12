import { AttendeeStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Shell } from "@/components/shell";
import { isAdminEmail } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { uploadImageFile } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<AttendeeStatus, string> = {
  APPROVED: "დამტკიცებული",
  HIDDEN: "დამალული",
  PENDING: "მოლოდინში"
};

async function updateConference(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return;
  }

  const id = String(formData.get("id") || "");
  if (!id) {
    return;
  }

  const title = String(formData.get("title_ka") || "").trim();
  const description = String(formData.get("description_ka") || "").trim();
  const location = String(formData.get("location_ka") || "").trim();
  const dateRaw = String(formData.get("date") || "");
  const date = new Date(dateRaw);
  const slug = String(formData.get("slug") || "").trim();

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

  redirect(`/admin/conferences/${id}`);
}

async function deleteConference(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return;
  }

  const id = String(formData.get("id") || "");
  if (!id) {
    return;
  }

  await prisma.conference.delete({ where: { id } });
  redirect("/admin");
}

export default async function AdminConferencePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/");
  }

  const conference = await prisma.conference.findUnique({
    where: { id: params.id }
  });

  if (!conference) {
    notFound();
  }

  const attendees = await prisma.attendee.findMany({
    where: { conferenceId: conference.id },
    orderBy: { createdAt: "desc" }
  });

  const agenda = ((conference.agendaHighlights as string[] | null) ?? []).join("\n");
  const speakers = ((conference.speakers as string[] | null) ?? []).join("\n");

  return (
    <Shell>
      <section className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">კონფერენციის მართვა</h1>
            <p className="text-sm text-brand-700">{conference.title_ka}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="rounded-xl border border-brand-200 px-3 py-2 text-sm text-brand-800">
              უკან
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <form action={updateConference} className="space-y-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-brand-900">დეტალები</h2>
          <input type="hidden" name="id" value={conference.id} />
          <input type="hidden" name="existingCoverImageUrl" value={conference.coverImageUrl ?? ""} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="slug" defaultValue={conference.slug} placeholder="სლაგი (ლათინური ასოებით)" required />
            <input name="title_ka" defaultValue={conference.title_ka} placeholder="სათაური" required />
            <input type="datetime-local" name="date" defaultValue={conference.date.toISOString().slice(0, 16)} required />
            <input name="location_ka" defaultValue={conference.location_ka} placeholder="ლოკაცია" required />
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-brand-800">ქავერის სურათი</span>
              <input type="file" name="coverImageFile" accept="image/*" className="w-full border-dashed" />
            </label>
            <input name="websiteUrl" defaultValue={conference.websiteUrl ?? ""} placeholder="ვებსაიტის ბმული (არასავალდებულო)" />
            <input name="mapUrl" defaultValue={conference.mapUrl ?? ""} placeholder="რუკის ბმული (არასავალდებულო)" />
            <textarea name="agenda" defaultValue={agenda} rows={5} placeholder="დღის წესრიგი — თითო ჩანაწერი ახალ ხაზზე" />
            <textarea name="speakers" defaultValue={speakers} rows={5} placeholder="სპიკერები — თითო ჩანაწერი ახალ ხაზზე" />
            <textarea className="sm:col-span-2" name="description_ka" defaultValue={conference.description_ka} rows={4} placeholder="აღწერა" required />
          </div>
          {conference.coverImageUrl ? (
            <p className="text-xs text-brand-700">
              მიმდინარე ქავერი დაყენებულია. ახალი ფაილის ატვირთვის შემთხვევაში ჩანაცვლდება.
            </p>
          ) : null}
          <div className="flex items-center gap-3">
            <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">შენახვა</button>
            <button formAction={deleteConference} className="rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200">
              წაშლა
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-900">დამსწრეები ({attendees.length})</h2>
            <a href={`/api/admin/attendees/export?conferenceId=${conference.id}`} className="rounded-xl bg-brand-100 px-3 py-2 text-sm text-brand-800">
              CSV ექსპორტი
            </a>
          </div>

          {attendees.length === 0 ? (
            <p className="rounded-lg border border-dashed border-brand-200 p-4 text-sm text-brand-700">ამ კონფერენციაზე დამსწრე ჯერ არ არის.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-100 text-left text-brand-700">
                    <th className="px-2 py-2">სახელი</th>
                    <th className="px-2 py-2">კომპანია</th>
                    <th className="px-2 py-2">პოზიცია</th>
                    <th className="px-2 py-2">სტატუსი</th>
                    <th className="px-2 py-2">ქმედება</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="border-b border-brand-50">
                      <td className="px-2 py-2">{attendee.fullName}</td>
                      <td className="px-2 py-2">{attendee.company || "-"}</td>
                      <td className="px-2 py-2">{attendee.position || "-"}</td>
                      <td className="px-2 py-2">{statusLabels[attendee.status]}</td>
                      <td className="px-2 py-2">
                        <form action={`/api/admin/attendees/${attendee.id}`} method="post" className="flex gap-2">
                          <input type="hidden" name="redirectTo" value={`/admin/conferences/${conference.id}`} />
                          <select name="status" defaultValue={attendee.status}>
                            {Object.values(AttendeeStatus).map((status) => (
                              <option key={status} value={status}>
                                {statusLabels[status]}
                              </option>
                            ))}
                          </select>
                          <button className="rounded-lg bg-brand-600 px-2 py-1 text-xs text-white">განახლება</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}
