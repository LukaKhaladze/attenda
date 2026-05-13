import { subHours } from "date-fns";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminSignInForm } from "@/components/admin-signin-form";
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
    return (
      <Shell>
        <AdminSignInForm />
      </Shell>
    );
  }

  if (!hasAdminAccess(session.user)) {
    if (session.user.role === "HOST") {
      redirect("/host");
    }
    return (
      <Shell>
        <AdminSignInForm />
      </Shell>
    );
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
        <div className="rounded-3xl border border-[#d9e7ff] bg-[linear-gradient(135deg,#eef4ff_0%,#e1ecff_100%)] p-5 shadow-[0_18px_40px_rgba(49,115,241,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#3173f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
              ADMIN
            </span>
            <p className="text-sm font-medium text-[#17305f]">
              შენ შესული ხარ როგორც ადმინი
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#47618f]">
            აქედან მართავ კონფერენციებს, ანიჭებ ჰოსტებს და აკონტროლებ რეგისტრაციებს.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-brand-900">ადმინისტრირება</h1>
          <AdminLogoutButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-[#d9e7ff] bg-white p-4 shadow-[0_14px_30px_rgba(49,115,241,0.06)]">
            <p className="text-sm text-brand-700">ჯამური დამსწრეები</p>
            <p className="text-3xl font-bold text-brand-900">{total}</p>
            <p className="mt-2 text-xs leading-5 text-brand-600">სულ რამდენი დამსწრეა დარეგისტრირებული ყველა კონფერენციაზე ერთად.</p>
          </article>
          <article className="rounded-2xl border border-[#d9e7ff] bg-white p-4 shadow-[0_14px_30px_rgba(49,115,241,0.06)]">
            <p className="text-sm text-brand-700">ბოლო 24 საათი</p>
            <p className="text-3xl font-bold text-brand-900">{last24h}</p>
            <p className="mt-2 text-xs leading-5 text-brand-600">ბოლო 24 საათში დამატებული ახალი რეგისტრაციების რაოდენობა ყველა ღონისძიებიდან.</p>
          </article>
          <article className="rounded-2xl border border-[#d9e7ff] bg-white p-4 shadow-[0_14px_30px_rgba(49,115,241,0.06)]">
            <p className="text-sm text-brand-700">ჰოსტის ანგარიშები</p>
            <p className="text-3xl font-bold text-brand-900">{hostCount}</p>
            <p className="mt-2 text-xs leading-5 text-brand-600">რამდენი HOST ტიპის ანგარიშია შექმნილი სისტემაში ჯამურად.</p>
          </article>
        </div>

        <div className="rounded-2xl border border-[#d9e7ff] bg-white p-5 shadow-[0_18px_40px_rgba(49,115,241,0.06)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-brand-900">ახალი კონფერენცია</h2>
            {conferences.length > 0 ? (
              <details className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm">
                <summary className="cursor-pointer font-medium text-red-700">საშიში მოქმედებები</summary>
                <div className="mt-3 space-y-3">
                  <p className="text-xs leading-5 text-red-700">ეს ღილაკი ერთიანად წაშლის ყველა კონფერენციას. გამოიყენე მხოლოდ საჭიროების შემთხვევაში.</p>
                  <form action={deleteAllConferences}>
                    <button
                      type="submit"
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      ყველა კონფერენციის წაშლა
                    </button>
                  </form>
                </div>
              </details>
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
            <button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3173f1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-[#255fce] sm:col-span-3 sm:justify-self-start">
              დამატება
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-[#d9e7ff] bg-white p-5 shadow-[0_18px_40px_rgba(49,115,241,0.06)]">
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
