import { AttendeeStatus } from "@prisma/client";
import { subHours } from "date-fns";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Shell } from "@/components/shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<AttendeeStatus, string> = {
  APPROVED: "დამტკიცებული",
  HIDDEN: "დამალული",
  PENDING: "მოლოდინში"
};

async function saveConference(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return;
  }

  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title_ka") || "").trim();
  const description = String(formData.get("description_ka") || "").trim();
  const date = new Date(String(formData.get("date") || ""));
  const location = String(formData.get("location_ka") || "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") || "").trim();
  const websiteUrl = String(formData.get("websiteUrl") || "").trim();
  const mapUrl = String(formData.get("mapUrl") || "").trim();
  const agenda = String(formData.get("agenda") || "").split("\n").map((item) => item.trim()).filter(Boolean);
  const speakers = String(formData.get("speakers") || "").split("\n").map((item) => item.trim()).filter(Boolean);

  if (!slug || !title || !description || Number.isNaN(date.valueOf()) || !location) {
    return;
  }

  await prisma.conference.upsert({
    where: { slug },
    create: {
      slug,
      title_ka: title,
      description_ka: description,
      date,
      location_ka: location,
      coverImageUrl: coverImageUrl || null,
      websiteUrl: websiteUrl || null,
      mapUrl: mapUrl || null,
      agendaHighlights: agenda,
      speakers
    },
    update: {
      title_ka: title,
      description_ka: description,
      date,
      location_ka: location,
      coverImageUrl: coverImageUrl || null,
      websiteUrl: websiteUrl || null,
      mapUrl: mapUrl || null,
      agendaHighlights: agenda,
      speakers
    }
  });
}

async function deleteConference(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return;
  }

  const id = String(formData.get("id") || "");
  if (!id) {
    return;
  }

  await prisma.conference.delete({
    where: { id }
  });
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const [conference, total, last24h, attendees] = await Promise.all([
    prisma.conference.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.attendee.count(),
    prisma.attendee.count({
      where: {
        createdAt: {
          gte: subHours(new Date(), 24)
        }
      }
    }),
    prisma.attendee.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        conference: true
      }
    })
  ]);

  return (
    <Shell>
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-brand-900">ადმინისტრირება</h1>
          <AdminLogoutButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
            <p className="text-sm text-brand-700">ჯამური დამსწრეები</p>
            <p className="text-3xl font-bold text-brand-900">{total}</p>
          </article>
          <article className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
            <p className="text-sm text-brand-700">ბოლო 24 საათი</p>
            <p className="text-3xl font-bold text-brand-900">{last24h}</p>
          </article>
        </div>

        <form action={saveConference} className="space-y-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-brand-900">კონფერენციის მართვა</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="slug" defaultValue={conference?.slug ?? "main-conference"} placeholder="slug" required />
            <input name="title_ka" defaultValue={conference?.title_ka ?? ""} placeholder="სათაური" required />
            <input
              type="datetime-local"
              name="date"
              defaultValue={conference?.date.toISOString().slice(0, 16) ?? ""}
              required
            />
            <input name="location_ka" defaultValue={conference?.location_ka ?? ""} placeholder="ლოკაცია" required />
            <input name="coverImageUrl" defaultValue={conference?.coverImageUrl ?? ""} placeholder="ქავერის სურათის URL" />
            <input name="websiteUrl" defaultValue={conference?.websiteUrl ?? ""} placeholder="ვებსაიტის URL" />
            <input name="mapUrl" defaultValue={conference?.mapUrl ?? ""} placeholder="რუკის URL" />
            <textarea name="agenda" defaultValue={((conference?.agendaHighlights as string[] | null) ?? []).join("\n")} rows={5} placeholder="Agenda ხაზებად" />
            <textarea name="speakers" defaultValue={((conference?.speakers as string[] | null) ?? []).join("\n")} rows={5} placeholder="სპიკერები ხაზებად" />
            <textarea className="sm:col-span-2" name="description_ka" defaultValue={conference?.description_ka ?? ""} rows={4} placeholder="აღწერა" required />
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">შენახვა</button>
            {conference ? (
              <>
                <input type="hidden" name="id" defaultValue={conference.id} />
                <button
                  formAction={deleteConference}
                  className="rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                >
                  წაშლა
                </button>
              </>
            ) : null}
          </div>
        </form>

        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-900">დამსწრეების მართვა</h2>
            <a href="/api/admin/attendees/export" className="rounded-xl bg-brand-100 px-3 py-2 text-sm text-brand-800">
              CSV ექსპორტი
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-brand-700">
                  <th className="px-2 py-2">სახელი</th>
                  <th className="px-2 py-2">კომპანია</th>
                  <th className="px-2 py-2">სტატუსი</th>
                  <th className="px-2 py-2">ქმედება</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => (
                  <tr key={attendee.id} className="border-b border-brand-50">
                    <td className="px-2 py-2">{attendee.fullName}</td>
                    <td className="px-2 py-2">{attendee.company || "-"}</td>
                    <td className="px-2 py-2">{statusLabels[attendee.status]}</td>
                    <td className="px-2 py-2">
                      <form action={`/api/admin/attendees/${attendee.id}`} method="post" className="flex gap-2">
                        <input type="hidden" name="_method" value="PATCH" />
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
        </div>
      </section>
    </Shell>
  );
}
