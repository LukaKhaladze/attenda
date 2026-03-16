import { subHours } from "date-fns";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Shell } from "@/components/shell";
import { hasAdminAccess } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { uploadImageFile } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function createConference(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!hasAdminAccess(session?.user)) {
    return;
  }

  const title = String(formData.get("title_ka") || "").trim();
  const location = String(formData.get("location_ka") || "").trim();
  const dateRaw = String(formData.get("date") || "");
  const date = new Date(dateRaw);
  const customSubdomain = String(formData.get("customSubdomain") || "").trim().toLowerCase() || null;
  const coverImageFile = formData.get("coverImageFile");
  const coverImageUrl =
    coverImageFile instanceof File && coverImageFile.size > 0
      ? await uploadImageFile(coverImageFile, "conference-covers")
      : null;

  if (!title || !location || Number.isNaN(date.valueOf())) {
    return;
  }

  const baseSlug = slugify(title) || "conference";
  const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

  const conference = await prisma.conference.create({
    data: {
      slug,
      customSubdomain,
      title_ka: title,
      location_ka: location,
      date,
      coverImageUrl,
      description_ka: "კონფერენციის აღწერა მალე განახლდება.",
      agendaHighlights: [],
      speakers: []
    }
  });

  redirect(`/admin/conferences/${conference.id}`);
}

async function deleteConference(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!hasAdminAccess(session?.user)) {
    return;
  }

  const id = String(formData.get("id") || "");
  if (!id) {
    return;
  }

  await prisma.conference.delete({
    where: { id }
  });

  redirect("/admin");
}

async function deleteAllConferences() {
  "use server";

  const session = await getServerSession(authOptions);
  if (!hasAdminAccess(session?.user)) {
    return;
  }

  await prisma.conference.deleteMany({});
  redirect("/admin");
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  if (!hasAdminAccess(session.user)) {
    redirect("/");
  }

  const [conferences, total, last24h, hostCount] = await Promise.all([
    prisma.conference.findMany({
      orderBy: { date: "asc" },
      include: {
        _count: {
          select: {
            attendees: true
          }
        }
      }
    }),
    prisma.attendee.count(),
    prisma.attendee.count({
      where: {
        createdAt: {
          gte: subHours(new Date(), 24)
        }
      }
    }),
    prisma.user.count({
      where: { role: "HOST" }
    })
  ]);

  return (
    <Shell>
      <section className="space-y-6 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-brand-900">ადმინისტრირება</h1>
          <AdminLogoutButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
            <p className="text-sm text-brand-700">ჯამური დამსწრეები</p>
            <p className="text-3xl font-bold text-brand-900">{total}</p>
          </article>
          <article className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
            <p className="text-sm text-brand-700">ბოლო 24 საათი</p>
            <p className="text-3xl font-bold text-brand-900">{last24h}</p>
          </article>
          <article className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
            <p className="text-sm text-brand-700">ჰოსტის ანგარიშები</p>
            <p className="text-3xl font-bold text-brand-900">{hostCount}</p>
          </article>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-brand-900">ახალი კონფერენცია</h2>
            {conferences.length > 0 ? (
              <form action={deleteAllConferences}>
                <button
                  type="submit"
                  className="rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200"
                >
                  ყველა კონფერენციის წაშლა
                </button>
              </form>
            ) : null}
          </div>
          <form action={createConference} className="grid gap-3 sm:grid-cols-3">
            <input name="title_ka" placeholder="სათაური" required />
            <input name="location_ka" placeholder="ლოკაცია" required />
            <input type="datetime-local" name="date" required />
            <label className="space-y-1 sm:col-span-3">
              <span className="block text-sm font-medium text-brand-800">ქასთომ სუბდომენი</span>
              <span className="block text-xs text-brand-600">მაგალითი: `event` მიუთითებს მისამართს `event.networkapp.ge`.</span>
              <input name="customSubdomain" placeholder="მაგ: event" />
            </label>
            <label className="sm:col-span-3">
              <span className="mb-1 block text-sm font-medium text-brand-800">ქავერის სურათი</span>
              <input type="file" name="coverImageFile" accept="image/*" className="w-full border-dashed" />
            </label>
            <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 sm:col-span-3 sm:justify-self-start">
              დამატება
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-xl font-semibold text-brand-900">კონფერენციების სია</h2>
          {conferences.length === 0 ? (
            <p className="rounded-lg border border-dashed border-brand-200 p-4 text-sm text-brand-700">კონფერენციები ჯერ არ არის დამატებული.</p>
          ) : (
            <div className="grid gap-3">
              {conferences.map((conference) => (
                <article
                  key={conference.id}
                  className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 transition hover:border-brand-300"
                >
                  <Link href={`/admin/conferences/${conference.id}`} className="block">
                    <p className="text-lg font-semibold text-brand-900">{conference.title_ka}</p>
                    <p className="mt-1 text-sm text-brand-700">{conference.location_ka}</p>
                    <p className="text-sm text-brand-700">{conference.date.toISOString().slice(0, 16).replace("T", " ")}</p>
                    <p className="mt-2 text-xs text-brand-800">დამსწრეები: {conference._count.attendees}</p>
                    {conference.customSubdomain ? <p className="mt-1 text-xs text-brand-700">სუბდომენი: {conference.customSubdomain}.networkapp.ge</p> : null}
                  </Link>

                  <div className="mt-4 flex justify-end">
                    <form action={deleteConference}>
                      <input type="hidden" name="id" value={conference.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200"
                      >
                        წაშლა
                      </button>
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
