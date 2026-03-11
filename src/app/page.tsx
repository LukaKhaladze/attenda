import { format } from "date-fns";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Conference } from "@prisma/client";
import { Shell } from "@/components/shell";
import { UICard } from "@/components/ui-card";
import { prisma } from "@/lib/prisma";

const benefits = [
  {
    title: "ადმინისტრატორი ამზადებს სტრუქტურას",
    body: "კონფერენცია, საჯარო გვერდი, QR, სუბდომენი და ჰოსტის წვდომა ერთიანად იქმნება ადმინისტრატორის პანელიდან."
  },
  {
    title: "ჰოსტი მართავს ოპერაციას",
    body: "მინიჭებული ჰოსტი შედის საკუთარ /host პანელში, ამტკიცებს რეგისტრაციებს და ანახლებს ღონისძიების შიგთავსს."
  },
  {
    title: "დამსწრე იღებს მარტივ გამოცდილებას",
    body: "რეგისტრაცია, საჯარო სია, პროფილი, შეხვედრის შეთავაზება და შეტყობინებები აგებულია ერთი ბუნებრივი ნაკადით."
  }
];

const steps = [
  {
    step: "01",
    title: "ადმინი ქმნის კონფერენციას",
    body: "ადმინისტრატორი ამატებს კონფერენციას, აყენებს სუბდომენს და ჰოსტს უნიშნავს წვდომას."
  },
  {
    step: "02",
    title: "ჰოსტი მართავს რეგისტრაციებს",
    body: "ჰოსტი /host პანელიდან ამტკიცებს დამსწრეებს ერთი კლიკით და საჭიროების შემთხვევაში ცვლის კონფერენციის ინფორმაციას."
  },
  {
    step: "03",
    title: "დამსწრეები უკეთ ნეთვორქინგობენ",
    body: "დადასტურებული სტუმრები ჩანან საჯაროდ, პოულობენ ერთმანეთს და აგზავნიან შეხვედრის შეთავაზებებს."
  }
];

export default async function HomePage() {
  const requestHeaders = headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = (forwardedHost || requestHeaders.get("host") || "").split(":")[0].toLowerCase();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.toLowerCase();

  if (process.env.DATABASE_URL && rootDomain && host.endsWith(`.${rootDomain}`)) {
    const subdomain = host.replace(`.${rootDomain}`, "");

    if (subdomain && subdomain !== "www") {
      const conferenceBySubdomain = await prisma.conference.findUnique({
        where: { customSubdomain: subdomain },
        select: { slug: true }
      }).catch(() => null);

      if (conferenceBySubdomain?.slug) {
        redirect(`/conference/${conferenceBySubdomain.slug}`);
      }
    }
  }

  let conferences: Array<Conference & { _count: { attendees: number } }> = [];
  let attendeeCount = 0;
  let approvedMeetingCount = 0;

  if (process.env.DATABASE_URL) {
    try {
      [conferences, attendeeCount, approvedMeetingCount] = await Promise.all([
        prisma.conference.findMany({
          orderBy: { date: "asc" },
          take: 3,
          include: {
            _count: {
              select: { attendees: true }
            }
          }
        }),
        prisma.attendee.count({ where: { status: "APPROVED" } }),
        prisma.meetingOffer.count({ where: { status: "ACCEPTED" } })
      ]);
    } catch {
      conferences = [];
      attendeeCount = 0;
      approvedMeetingCount = 0;
    }
  }

  return (
    <Shell>
      <section className="space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1733] shadow-[0_20px_70px_rgba(11,23,51,0.28)]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-90"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1800&q=80)"
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,25,17,0.22),rgba(29,22,18,0.34)_18%,rgba(11,16,28,0.66)_54%,rgba(8,12,24,0.9)_78%,rgba(7,11,22,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,214,170,0.26),transparent_34%),radial-gradient(circle_at_right_bottom,rgba(243,141,56,0.14),transparent_18%)]" />

          <div className="relative flex min-h-[720px] items-end px-6 py-10 sm:px-10 sm:py-12 lg:min-h-[820px] lg:px-14 lg:py-14">
            <div className="max-w-[620px] space-y-7 text-white">
              <span className="inline-flex min-h-10 items-center rounded-full border border-white/30 bg-white/82 px-4 text-sm font-semibold text-[#5c5751] shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur">
                The future of professional networking
              </span>

              <div className="space-y-5">
                <h1 className="max-w-[620px] text-5xl font-bold leading-[0.92] tracking-[-0.045em] sm:text-6xl lg:text-[5.35rem]">
                  Meet people
                  <br />
                  who <span className="text-[#f28b34]">matter</span>
                </h1>
                <p className="max-w-[520px] text-lg leading-8 text-white/84 sm:text-[1.35rem] sm:leading-9">
                  Launch branded conference pages, manage registrations, approve attendees,
                  and turn event traffic into real meetings from one host-ready platform.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-1 sm:flex-row">
                <Link
                  href="#features"
                  className="inline-flex min-h-14 items-center justify-center rounded-[18px] bg-[#f28b34] px-9 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(242,139,52,0.32)] transition hover:bg-[#ef7f20]"
                >
                  Explore Features
                </Link>
                <Link
                  href="/host/signin"
                  className="inline-flex min-h-14 items-center justify-center rounded-[18px] bg-white/88 px-9 py-4 text-lg font-semibold text-gray-900 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white"
                >
                  Host Login
                </Link>
              </div>

              <div className="grid max-w-[430px] grid-cols-3 gap-7 pt-6">
                <div>
                  <p className="text-[2.15rem] font-bold tracking-[-0.05em] text-white">{attendeeCount > 0 ? `${attendeeCount}+` : "2.4K+"}</p>
                  <p className="mt-1 text-sm text-white/70">Registered Attendees</p>
                </div>
                <div>
                  <p className="text-[2.15rem] font-bold tracking-[-0.05em] text-white">{conferences.length > 0 ? `${conferences.length * 50}+` : "150+"}</p>
                  <p className="mt-1 text-sm text-white/70">Event Pages Live</p>
                </div>
                <div>
                  <p className="text-[2.15rem] font-bold tracking-[-0.05em] text-white">{approvedMeetingCount > 0 ? `${approvedMeetingCount}+` : "8K+"}</p>
                  <p className="mt-1 text-sm text-white/70">Meetings Coordinated</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f28b34]">რატომ იყენებენ ორგანიზატორები</p>
            <h2 className="text-3xl font-bold text-gray-900">პლატფორმა, რომელიც კონფერენციის მფლობელს სრულ კონტროლს აძლევს</h2>
            <p className="max-w-2xl text-sm leading-7 text-gray-600">
              Attenda მუშაობს როგორც საკონფერენციო ოპერაციული სისტემა: ადმინისტრატორი ამზადებს ღონისძიებას,
              ჰოსტი მართავს საკუთარ პანელს, დამსწრეები კი იღებენ მარტივ გამოცდილებას რეგისტრაციიდან შეხვედრებამდე.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <UICard className="min-h-[196px] bg-[linear-gradient(180deg,#ffffff,#f9fbff)]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">ქასთომ ბმული, QR და სუბდომენი თითო ღონისძიებისთვის</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                თითო კონფერენცია იღებს საკუთარ საჯარო გვერდს, QR კოდს და სურვილის შემთხვევაში სუბდომენს, როგორიცაა
                itmeet.yourdomain.com, რომ ბრენდინგი ღონისძიების იდენტობას დაემთხვეს.
              </p>
            </UICard>

            <UICard className="min-h-[196px] bg-[linear-gradient(180deg,#ffffff,#fdfaf7)]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f28b34]/10 text-[#f28b34]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                  <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 20c1.2-3.1 3.5-5 5-5s3.8 1.9 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">ჰოსტის პანელი დამსწრეთა სწრაფი დამტკიცებით</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                ადმინისტრატორი კონფერენციას ჰოსტს უნიშნავს, ჰოსტი შედის საკუთარ /host პანელში, ამტკიცებს რეგისტრაციებს ერთი კლიკით
                და მართავს საკუთარ ღონისძიებას ადმინის ჩარევის გარეშე.
              </p>
            </UICard>

            <UICard className="min-h-[196px] bg-[linear-gradient(180deg,#ffffff,#f8fbfa)]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">ნეთვორქინგი, რომელიც რეალურ შეხვედრებად იქცევა</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                დამსწრეები წინასწარ ხედავენ ერთმანეთს, პოულობენ სწორ ადამიანებს, აგზავნიან შეხვედრის შეთავაზებებს და ღონისძიებაზე
                უფრო მაღალი ხარისხის კავშირებით მოდიან.
              </p>
            </UICard>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f28b34]">მაგალითები</p>
              <h2 className="text-3xl font-bold text-gray-900">ადმინისტრატორის მიერ შექმნილი კონფერენციები ჰოსტისთვის მზადაა</h2>
            </div>
            <Link href="/admin" className="hidden text-sm font-semibold text-primary underline sm:inline">
              ადმინის პანელის გახსნა
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {conferences.length > 0 ? (
              conferences.map((conference) => (
                <Link key={conference.id} href={`/conference/${conference.slug}`}>
                  <UICard className="h-full overflow-hidden p-0 transition-transform duration-200 hover:-translate-y-1">
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(11,23,51,.08), rgba(11,23,51,.72)), url(${conference.coverImageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"})`
                      }}
                    >
                      <div className="flex h-full flex-col justify-between p-4 text-white">
                        <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                          საჯარო გვერდი
                        </span>
                        <div>
                          <p className="text-2xl font-bold">{conference.title_ka}</p>
                          <p className="mt-2 text-sm text-white/80">{conference._count.attendees} რეგისტრაცია</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {format(conference.date, "dd MMMM, HH:mm")}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {conference.location_ka}
                      </p>
                      <p className="line-clamp-3 text-sm leading-6 text-gray-600">{conference.description_ka}</p>
                    </div>
                  </UICard>
                </Link>
              ))
            ) : (
              <>
                <UICard className="min-h-[240px] bg-[linear-gradient(180deg,#ffffff,#f9fbff)]">
                  <p className="text-lg font-semibold text-gray-900">ადმინის მიერ მომზადებული კონფერენციის გვერდი</p>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    ადმინისტრატორი ამზადებს გვერდს, მინიჭებს ჰოსტს, ხოლო ჰოსტი უკვე საკუთარ პანელში აგრძელებს კონფერენციის ოპერირებას.
                  </p>
                </UICard>
                <UICard className="min-h-[240px] bg-[linear-gradient(180deg,#ffffff,#fdfaf7)]">
                  <p className="text-lg font-semibold text-gray-900">რეგისტრაცია, დამტკიცება და საჯარო სია</p>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    დამსწრე პირველად შედის მოლოდინში, ჰოსტი ადასტურებს ერთ კლიკში და ამის შემდეგ ის ავტომატურად ჩნდება საჯარო გვერდზე.
                  </p>
                </UICard>
                <UICard className="min-h-[240px] bg-[linear-gradient(180deg,#ffffff,#f8fbfa)]">
                  <p className="text-lg font-semibold text-gray-900">ჰოსტის ბრენდინგი და სუბდომენი</p>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    საჭიროების შემთხვევაში თითო კონფერენცია მუშაობს საკუთარ მისამართზე, რაც პლატფორმას თეთრი ეტიკეტის პროდუქტად აქცევს.
                  </p>
                </UICard>
              </>
            )}
          </div>
        </section>

        <section className="space-y-5 rounded-[28px] border border-gray-200 bg-white px-5 py-6 shadow-[0_18px_48px_rgba(17,24,39,0.06)] sm:px-6">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f28b34]">როგორ მუშაობს</p>
            <h2 className="text-3xl font-bold text-gray-900">სამი როლი, ერთი გამართული ნაკადი</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {steps.map((item) => (
              <UICard key={item.step} className="min-h-[180px] border-gray-100 bg-[linear-gradient(180deg,#ffffff,#fbfcff)]">
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white">
                  {item.step}
                </span>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{item.body}</p>
              </UICard>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#f28b34,#f49c47)] px-5 py-8 text-white shadow-[0_20px_60px_rgba(242,139,52,0.25)] sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">B2B კონფერენციებისთვის</p>
              <h2 className="text-3xl font-bold">მართე კონფერენცია ბრენდირებული ლენდინგით და ჰოსტის საკუთარი პანელით</h2>
              <p className="max-w-2xl text-sm leading-7 text-white/84">
                გამოიყენე Attenda.ge როგორც პლატფორმა, სადაც ადმინი ამზადებს ღონისძიებას, ჰოსტი მართავს საკუთარ ოპერაციას და დამსწრეები
                წინასწარ იწყებენ საჭირო კავშირების შექმნას.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/host/signin"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-[#d56d18] transition hover:bg-[#fff7ef]"
              >
                ჰოსტის შესვლა
              </Link>
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/35 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                ადმინის პანელი
              </Link>
            </div>
          </div>
        </section>
      </section>
    </Shell>
  );
}
