import { AttendeeStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Shell } from "@/components/shell";
import { hasAdminAccess } from "@/lib/admin";
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
  if (!hasAdminAccess(session?.user)) {
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

  redirect(`/admin/conferences/${id}`);
}

async function assignHost(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!hasAdminAccess(session?.user)) {
    return;
  }

  const conferenceId = String(formData.get("conferenceId") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (!conferenceId || !email || !password) {
    return;
  }

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: name || undefined,
      passwordHash,
      role: "HOST"
    },
    create: {
      name: name || email.split("@")[0],
      email,
      passwordHash,
      role: "HOST"
    }
  });

  await prisma.hostConference.upsert({
    where: {
      userId_conferenceId: {
        userId: user.id,
        conferenceId
      }
    },
    update: {},
    create: {
      userId: user.id,
      conferenceId
    }
  });

  redirect(`/admin/conferences/${conferenceId}`);
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

  await prisma.conference.delete({ where: { id } });
  redirect("/admin");
}

export default async function AdminConferencePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  if (!hasAdminAccess(session.user)) {
    redirect("/");
  }

  const conference = await prisma.conference.findUnique({
    where: { id: params.id },
    include: {
      hostAssignments: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    }
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
  const requestHeaders = headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");
  const origin =
    host
      ? `${forwardedProto || "https"}://${host}`
      : process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const subdomainUrl = conference.customSubdomain && process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${conference.customSubdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : null;
  const shareUrl = subdomainUrl || `${origin}/conference/${conference.slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(subdomainUrl || shareUrl)}`;

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
            <label className="space-y-1 sm:col-span-2">
              <span className="block text-sm font-medium text-brand-800">სლაგი</span>
              <span className="block text-xs text-brand-600">ეს მისამართი გამოიყენება სარეზერვო საჯარო ბმულისთვის.</span>
              <input name="slug" defaultValue={conference.slug} placeholder="სლაგი (ლათინური ასოებით)" required />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="block text-sm font-medium text-brand-800">ქასთომ სუბდომენი</span>
              <span className="block text-xs text-brand-600">მაგალითი: `event` გახდება `event.networkapp.ge`.</span>
              <input name="customSubdomain" defaultValue={conference.customSubdomain ?? ""} placeholder="მაგ: event" />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="block text-sm font-medium text-brand-800">სათაური</span>
              <input name="title_ka" defaultValue={conference.title_ka} placeholder="სათაური" required />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">თარიღი და დრო</span>
              <input type="datetime-local" name="date" defaultValue={conference.date.toISOString().slice(0, 16)} required />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">ლოკაცია</span>
              <input name="location_ka" defaultValue={conference.location_ka} placeholder="ლოკაცია" required />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-brand-800">ქავერის სურათი</span>
              <input type="file" name="coverImageFile" accept="image/*" className="w-full border-dashed" />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">ვებსაიტის ბმული</span>
              <input name="websiteUrl" defaultValue={conference.websiteUrl ?? ""} placeholder="ვებსაიტის ბმული (არასავალდებულო)" />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-brand-800">რუკის ბმული</span>
              <input name="mapUrl" defaultValue={conference.mapUrl ?? ""} placeholder="რუკის ბმული (არასავალდებულო)" />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="block text-sm font-medium text-brand-800">დღის წესრიგი</span>
              <textarea name="agenda" defaultValue={agenda} rows={5} placeholder="დღის წესრიგი — თითო ჩანაწერი ახალ ხაზზე" />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="block text-sm font-medium text-brand-800">სპიკერები</span>
              <textarea name="speakers" defaultValue={speakers} rows={5} placeholder="სპიკერები — თითო ჩანაწერი ახალ ხაზზე" />
            </label>
            <label className="space-y-1 sm:col-span-2">
              <span className="block text-sm font-medium text-brand-800">აღწერა</span>
              <textarea className="sm:col-span-2" name="description_ka" defaultValue={conference.description_ka} rows={4} placeholder="აღწერა" required />
            </label>
          </div>
          {conference.coverImageUrl ? (
            <p className="text-xs text-brand-700">
              მიმდინარე ქავერი დაყენებულია. ახალი ფაილის ატვირთვის შემთხვევაში ჩანაცვლდება.
            </p>
          ) : null}
          {subdomainUrl ? <p className="text-xs text-brand-700">სუბდომენის მისამართი: {subdomainUrl}</p> : null}
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#3173f1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-[#255fce] sm:w-auto">
              შენახვა
            </button>
            <button formAction={deleteConference} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 sm:w-auto">
              წაშლა
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h2 className="mb-3 text-xl font-semibold text-brand-900">გაზიარება (ჰოსტისთვის)</h2>
          <p className="mb-3 text-sm text-brand-700">ეს ბმული ან QR გაუგზავნე ჰოსტს, რომ დამსწრეებს გაუზიაროს.</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="კონფერენციის QR კოდი" className="h-44 w-44 rounded-lg border border-brand-100 bg-white p-2" />
            <div className="w-full">
              <p className="mb-1 text-xs text-brand-700">კონფერენციის ბმული</p>
              <p className="break-all rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-900">{shareUrl}</p>
              {subdomainUrl ? (
                <>
                  <p className="mb-1 mt-3 text-xs text-brand-700">სარეზერვო slug ბმული</p>
                  <p className="break-all rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-900">{origin}/conference/{conference.slug}</p>
                  <p className="mb-1 mt-3 text-xs text-brand-700">ქასთომ სუბდომენი</p>
                  <p className="break-all rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-900">{subdomainUrl}</p>
                </>
              ) : null}
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800 hover:bg-brand-50"
              >
                გვერდის გახსნა
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-xl font-semibold text-brand-900">ჰოსტის წვდომა</h2>
          <form action={assignHost} className="grid gap-3 lg:grid-cols-4">
            <input type="hidden" name="conferenceId" value={conference.id} />
            <input name="name" placeholder="ჰოსტის სახელი" />
            <input name="email" type="email" placeholder="ჰოსტის ელფოსტა" required />
            <input name="password" placeholder="საწყისი პაროლი" required />
            <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#3173f1] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-[#255fce] lg:w-auto">
              ჰოსტის მინიჭება
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {conference.hostAssignments.length === 0 ? (
              <p className="rounded-lg border border-dashed border-brand-200 p-4 text-sm text-brand-700">
                ამ კონფერენციაზე ჰოსტი ჯერ არ არის მინიჭებული.
              </p>
            ) : (
              conference.hostAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-xl border border-brand-100 p-4">
                  <p className="text-sm font-semibold text-brand-900">{assignment.user.name || assignment.user.email}</p>
                  <p className="text-sm text-brand-700">{assignment.user.email}</p>
                  <p className="text-xs text-brand-600">ჰოსტის პანელი: /host/signin</p>
                </div>
              ))
            )}
          </div>
        </div>

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
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <form action={`/api/admin/attendees/${attendee.id}`} method="post" className="flex gap-2">
                            <input type="hidden" name="redirectTo" value={`/admin/conferences/${conference.id}`} />
                            <select name="status" defaultValue={attendee.status}>
                              {Object.values(AttendeeStatus).map((status) => (
                                <option key={status} value={status}>
                                  {statusLabels[status]}
                                </option>
                              ))}
                            </select>
                            <button className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#3173f1] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#255fce]">განახლება</button>
                          </form>
                          <Link
                            href={`/admin/attendees/${attendee.id}?conferenceId=${conference.id}`}
                            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50"
                          >
                            რედაქტირება
                          </Link>
                        </div>
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
