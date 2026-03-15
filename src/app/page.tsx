import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CallbackRequestModal } from "@/components/callback-request-modal";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

const platformCards = [
  {
    title: "საჯარო გვერდი",
    body: "ბრენდირებული გვერდი, agenda და სპიკერები ერთ სივრცეში.",
    icon: "page"
  },
  {
    title: "ჰოსტის პანელი",
    body: "დამტკიცება, დამალვა და ძირითადი მართვა ერთ ეკრანიდან.",
    icon: "panel"
  },
  {
    title: "ნეთვორქინგი",
    body: "საჯარო პროფილები და შეხვედრების შეთავაზებები.",
    icon: "network"
  },
  {
    title: "QR და გაზიარება",
    body: "მარტივი გავრცელება სტუმრებისთვის და სპიკერებისთვის.",
    icon: "share"
  }
];

const steps = [
  {
    step: "01",
    title: "ადმინი ამატებს კონფერენციას",
    body: "იქმნება გვერდი, სუბდომენი და ჰოსტის წვდომა."
  },
  {
    step: "02",
    title: "ჰოსტი მართავს რეგისტრაციებს",
    body: "ამტკიცებს დამსწრეებს და ანახლებს ინფორმაციას."
  },
  {
    step: "03",
    title: "დამსწრეები უკეთ ნეთვორქინგობენ",
    body: "საჯარო პროფილები და შეხვედრების შეთავაზებები."
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

  let conferenceCount = 0;
  let attendeeCount = 0;
  let approvedMeetingCount = 0;

  if (process.env.DATABASE_URL) {
    try {
      [conferenceCount, attendeeCount, approvedMeetingCount] = await Promise.all([
        prisma.conference.count(),
        prisma.attendee.count({ where: { status: "APPROVED" } }),
        prisma.meetingOffer.count({ where: { status: "ACCEPTED" } })
      ]);
    } catch {
      conferenceCount = 0;
      attendeeCount = 0;
      approvedMeetingCount = 0;
    }
  }

  return (
    <Shell hideHeader>
      <section className="-mx-4 -mt-4 space-y-0 pb-12 sm:-mx-6 sm:-mt-4 lg:-mx-8 lg:-mt-4">
        <section className="px-0 pt-0">
          <div className="relative overflow-hidden border-y border-white/10 bg-[#0b1733] shadow-[0_24px_80px_rgba(11,23,51,0.26)] sm:rounded-[0]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-90"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1800&q=80)"
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(37,27,18,0.2),rgba(25,19,18,0.34)_16%,rgba(11,16,28,0.66)_54%,rgba(8,12,24,0.92)_82%,rgba(7,11,22,0.96)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.24),transparent_34%),radial-gradient(circle_at_right_bottom,rgba(34,211,238,0.14),transparent_18%)]" />

            <header className="relative px-5 py-5 sm:px-8 lg:px-10 2xl:px-12">
              <div className="mx-auto flex max-w-screen-2xl items-center justify-between rounded-[22px] border border-white/20 bg-white/10 px-5 py-4 shadow-[0_18px_40px_rgba(14,17,23,0.22)] backdrop-blur-md">
                <Link href="/" className="flex items-center gap-3 text-[1.35rem] font-bold tracking-[-0.03em] text-white">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,0.34)]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
                    </svg>
                  </span>
                  <span>Networkapp</span>
                </Link>

                <nav className="hidden items-center gap-10 text-sm font-medium text-white md:flex">
                  <a href="#features" className="transition hover:text-white">ფუნქციები</a>
                  <a href="#process" className="transition hover:text-white">პროცესი</a>
                  <a href="#contact" className="transition hover:text-white">კონტაქტი</a>
                </nav>

                <a
                  href="#contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-[#0b1733] shadow-[0_10px_24px_rgba(255,255,255,0.18)] transition hover:bg-white/90"
                >
                  კონტაქტი
                </a>
              </div>
            </header>

            <div className="relative mx-auto flex min-h-[760px] max-w-screen-2xl items-end px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[860px] lg:px-10 lg:py-14 2xl:px-12">
              <div className="max-w-[720px] space-y-7 text-white xl:max-w-[80%]">
                <span className="inline-flex min-h-10 items-center rounded-full border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur">
                  კონფერენციების მართვა და ნეთვორქინგი ერთ სივრცეში
                </span>

                <div className="space-y-5">
                  <h1 className="max-w-[1100px] text-5xl font-bold leading-[0.92] tracking-[-0.045em] sm:text-6xl lg:text-[5.35rem]">
                    შექმენი ივენთი,
                    <br />
                    რომელიც <span className="text-[#60a5fa]">მუშაობს</span>
                  </h1>
                  <p className="max-w-[880px] text-lg leading-8 text-white/84 sm:text-[1.35rem] sm:leading-9">
                    ბრენდირებული გვერდი, დამსწრეთა მართვა, ჰოსტის პანელი და შეხვედრების შეთავაზებები ერთ პლატფორმაში.
                  </p>
                </div>

                <div className="flex flex-col gap-4 pt-1 sm:flex-row">
                  <a
                    href="#features"
                    className="inline-flex min-h-14 items-center justify-center rounded-[18px] bg-[#2563eb] px-9 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.34)] transition hover:bg-[#1d4ed8]"
                  >
                    ნახე ფუნქციები
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex min-h-14 items-center justify-center rounded-[18px] border border-white/28 bg-white/8 px-9 py-4 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white hover:text-black"
                  >
                    კონტაქტი
                  </a>
                </div>

                <div className="grid max-w-[460px] grid-cols-3 gap-7 pt-6">
                  <div>
                    <p className="text-[2.15rem] font-bold tracking-[-0.05em] text-white">{attendeeCount > 0 ? `${attendeeCount}+` : "2.4K+"}</p>
                    <p className="mt-1 text-sm text-white/70">დადასტურებული დამსწრე</p>
                  </div>
                  <div>
                    <p className="text-[2.15rem] font-bold tracking-[-0.05em] text-white">{conferenceCount > 0 ? `${conferenceCount}+` : "150+"}</p>
                    <p className="mt-1 text-sm text-white/70">აქტიური გვერდი</p>
                  </div>
                  <div>
                    <p className="text-[2.15rem] font-bold tracking-[-0.05em] text-white">{approvedMeetingCount > 0 ? `${approvedMeetingCount}+` : "8K+"}</p>
                    <p className="mt-1 text-sm text-white/70">შეხვედრის შეთავაზება</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-[linear-gradient(180deg,#eef6fb_0%,#dcecf5_100%)] px-5 py-20 sm:px-8 lg:px-10 lg:py-24 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl space-y-12">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <h2 className="text-4xl font-bold tracking-[-0.04em] text-[#0f172a] sm:text-[3.1rem]">ერთი პლატფორმა მთელი ივენთისთვის</h2>
              <p className="text-lg leading-8 text-slate-600">რეგისტრაცია, დამტკიცება, ჰოსტის მართვა და ნეთვორქინგი ერთ მოქნილ სისტემაში.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {platformCards.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[30px] border border-white/80 bg-white p-7 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(15,23,42,0.12)]"
                >
                  <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#60a5fa,#2563eb)] text-white shadow-[0_14px_32px_rgba(37,99,235,0.2)]">
                    {feature.icon === "page" ? (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M8 3h7l4 4v14H8z" />
                        <path d="M15 3v5h5" />
                      </svg>
                    ) : feature.icon === "panel" ? (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M7 8h10M7 12h6M7 16h8" />
                      </svg>
                    ) : feature.icon === "network" ? (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <circle cx="8" cy="8" r="3" />
                        <circle cx="16" cy="8" r="3" />
                        <circle cx="12" cy="16" r="3" />
                        <path d="M10.5 10.5 11 13M13.5 10.5 13 13" />
                      </svg>
                    ) : (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                        <path d="M12 16V4" />
                        <path d="m7 9 5-5 5 5" />
                      </svg>
                    )}
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-[#0f172a]">{feature.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl space-y-16">
            <div className="space-y-4 text-center">
              <h2 className="text-4xl font-bold leading-[1.12] tracking-[-0.04em] text-[#0f172a] sm:text-[3.2rem]">
                სამი მარტივი ნაბიჯი
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-500">მუშაობის ლოგიკა მარტივია როგორც ორგანიზატორისთვის, ისე ჰოსტისა და დამსწრისთვის.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
              {steps.map((item) => (
                <div key={item.step} className="mx-auto flex max-w-[360px] flex-col items-center text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#3b82f6,#2563eb)] text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)]">
                    {item.step === "01" ? (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <circle cx="11" cy="11" r="6" />
                        <path d="m20 20-3.5-3.5" />
                      </svg>
                    ) : item.step === "02" ? (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <rect x="3" y="4" width="18" height="17" rx="2" />
                        <path d="M8 2v4M16 2v4M3 10h18" />
                        <path d="m9 15 2 2 4-4" />
                      </svg>
                    ) : (
                      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M7 12a3 3 0 0 1 3-3h4" />
                        <path d="M17 12a3 3 0 0 1-3 3h-4" />
                        <path d="M8.5 15.5 4 20" />
                        <path d="M19.5 8.5 15 4" />
                      </svg>
                    )}
                  </div>
                  <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-[#2563eb]">ნაბიჯი {item.step}</p>
                  <h3 className="mt-3 text-[1.95rem] font-semibold leading-[1.24] tracking-[-0.03em] text-[#0f172a]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-lg leading-[1.8] text-slate-500">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[38px] bg-[linear-gradient(135deg,#1d4ed8,#2563eb,#38bdf8)] px-8 py-14 text-center text-white shadow-[0_32px_80px_rgba(37,99,235,0.2)] sm:px-12 sm:py-16">
              <div className="mx-auto max-w-3xl">
                <h3 className="text-4xl font-bold leading-[1.12] tracking-[-0.05em] sm:text-[3.2rem]">
                  მზად ხარ შემდეგი ივენთისთვის?
                </h3>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-[1.8] text-white/88 sm:text-[1.2rem]">
                  დაგეხმარებით სწრაფად ააწყო გვერდი, approval flow და ჰოსტის სამუშაო პროცესი ერთ სისტემაში.
                </p>
                <CallbackRequestModal
                  triggerLabel="დავჯავშნოთ ზარი"
                  triggerClassName="mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/35 bg-white/18 px-8 text-lg font-semibold text-white shadow-[0_12px_28px_rgba(255,255,255,0.12)] backdrop-blur transition hover:bg-white hover:text-[#111827]"
                />
              </div>
            </div>
          </div>
        </section>

        <footer id="contact" className="-mx-4 bg-[#141c27] px-5 pb-12 pt-16 text-white sm:-mx-6 sm:px-8 lg:-mx-8 lg:px-10 lg:pt-20 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl px-1 sm:px-2 lg:px-4">
            <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr_0.65fr]">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-xl font-bold tracking-[-0.03em]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
                    </svg>
                  </span>
                  <span>Networkapp</span>
                </div>
                <p className="max-w-md text-base leading-8 text-white/62">
                  პლატფორმა კონფერენციებისთვის, სადაც გვერდი, approval და ნეთვორქინგი ერთდება ერთ სივრცეში.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-base font-semibold text-white">პროდუქტი</p>
                <div className="space-y-3 text-base text-white/62">
                  <a href="#features" className="block transition hover:text-white">ფუნქციები</a>
                  <a href="#process" className="block transition hover:text-white">პროცესი</a>
                  <a href="#contact" className="block transition hover:text-white">კონტაქტი</a>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-base font-semibold text-white">კონტაქტი</p>
                <div className="space-y-3 text-base text-white/62">
                  <a href="mailto:hello@attenda.ge" className="block transition hover:text-white">hello@attenda.ge</a>
                  <a href="tel:+995599000000" className="block transition hover:text-white">+995 599 000 000</a>
                  <span className="block text-white/50">თბილისი, საქართველო</span>
                </div>
              </div>
            </div>

            <div className="mt-14 border-t border-white/10 pt-8 text-center text-sm text-white/40">
              © 2026 Networkapp. ყველა უფლება დაცულია.
            </div>
          </div>
        </footer>
      </section>
    </Shell>
  );
}
