import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { Shell } from "@/components/shell";
import { prisma } from "@/lib/prisma";

const valuePoints = [
  {
    title: "მზად landing page-სთან ერთად",
    body: "ბრენდირებული გვერდი, QR და გაზიარებადი ბმული."
  },
  {
    title: "ჰოსტის სწრაფი approval flow",
    body: "დამტკიცება და დამალვა ერთ ეკრანიდან."
  },
  {
    title: "ნეთვორქინგი რეალურ შეხვედრებამდე",
    body: "დამსწრეები პოულობენ ერთმანეთს და გზავნიან შეხვედრებს."
  }
];

const featureStories = [
  {
    title: "ქასთომ კონფერენციის გვერდი და სუბდომენი",
    body: "საკუთარი გვერდი და სუბდომენი.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80"
  },
  {
    title: "ჰოსტის პანელი მინიჭებული კონფერენციისთვის",
    body: "ჰოსტი მართავს რეგისტრაციებს.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
  },
  {
    title: "დამსწრეები, შეხვედრები და რეალური ნეთვორქინგი",
    body: "საჯარო პროფილები და შეხვედრები.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80"
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

        <section id="features" className="relative z-10 -mt-16 px-5 sm:-mt-20 sm:px-8 lg:-mt-24 lg:px-10 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl overflow-hidden rounded-[40px] border border-[#dbeafe] bg-[linear-gradient(180deg,#ffffff,#f8fbff)] shadow-[0_34px_90px_rgba(15,23,42,0.08)]">
            <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="space-y-8 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                <div className="max-w-3xl space-y-5">
                  <h2 className="text-3xl font-bold leading-[1.02] tracking-[-0.05em] text-gray-900 sm:text-[2.85rem]">
                    პლატფორმა, სადაც კონფერენციის მთავარი პროცესები ერთდება
                  </h2>
                </div>

                <div className="grid gap-4">
                  {valuePoints.map((item, index) => (
                    <div
                      key={item.title}
                      className="grid gap-4 rounded-[28px] border border-[#e4ecff] bg-white p-5 shadow-[0_12px_30px_rgba(37,99,235,0.06)] sm:grid-cols-[auto_1fr]"
                    >
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#60a5fa)] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)]">
                        0{index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-gray-600">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[28px] bg-[linear-gradient(180deg,#081225,#10285d)] p-5 text-white">
                    <p className="text-3xl font-bold">{conferenceCount > 0 ? `${conferenceCount}+` : "2+"}</p>
                    <p className="mt-2 text-sm text-white/70">ღონისძიება</p>
                  </div>
                  <div className="rounded-[28px] border border-[#dbeafe] bg-[#f8fbff] p-5">
                    <p className="text-3xl font-bold text-gray-900">{attendeeCount > 0 ? `${attendeeCount}+` : "50+"}</p>
                    <p className="mt-2 text-sm text-gray-600">დამსწრე</p>
                  </div>
                  <div className="rounded-[28px] border border-[#dbeafe] bg-[#f8fbff] p-5">
                    <p className="text-3xl font-bold text-gray-900">{approvedMeetingCount > 0 ? `${approvedMeetingCount}+` : "10+"}</p>
                    <p className="mt-2 text-sm text-gray-600">შეხვედრა</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#dbeafe] bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_32%),linear-gradient(180deg,#eef5ff,#ffffff)] px-6 py-8 sm:px-8 sm:py-10 lg:border-l lg:border-t-0 lg:px-10 lg:py-12">
                <div className="space-y-5">
                  <div className="rounded-[32px] bg-[linear-gradient(135deg,#081225,#153371)] p-6 text-white shadow-[0_24px_60px_rgba(8,18,37,0.28)] sm:p-7">
                    <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em]">
                      საჯარო გვერდი, approval და ნეთვორქინგი
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[28px] border border-[#dbeafe] bg-white p-5 shadow-[0_12px_30px_rgba(37,99,235,0.06)]">
                      <p className="text-lg font-semibold text-gray-900">ბრენდირებული გვერდი</p>
                      <p className="mt-2 text-sm leading-7 text-gray-600">სუბდომენი და მთავარი კონტენტი.</p>
                    </div>
                    <div className="rounded-[28px] border border-[#dbeafe] bg-white p-5 shadow-[0_12px_30px_rgba(37,99,235,0.06)]">
                      <p className="text-lg font-semibold text-gray-900">ერთი workflow</p>
                      <p className="mt-2 text-sm leading-7 text-gray-600">რეგისტრაცია, approval და შეხვედრები.</p>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[#dbeafe] bg-white p-5 shadow-[0_12px_30px_rgba(37,99,235,0.06)]">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-sm font-medium text-primary">საჯარო გვერდი</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">ჰოსტის პანელი</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">ნეთვორქინგი</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#081225] px-5 py-16 sm:px-8 lg:px-10 lg:py-20 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl space-y-8">
            <div className="max-w-2xl space-y-4 text-white">
              <h2 className="text-3xl font-bold leading-tight sm:text-[2.5rem]">სრული stack კონფერენციისთვის</h2>
            </div>

            <div className="space-y-8">
            {featureStories.map((feature, index) => (
              <article key={feature.title} className={`grid gap-6 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10 lg:p-8 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div
                  className="min-h-[320px] rounded-[24px] bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(15,23,42,.12), rgba(15,23,42,.4)), url(${feature.image})`
                  }}
                />
                <div className="space-y-5">
                  <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-2xl bg-[#2563eb] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)]">
                    0{index + 1}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-white">{feature.title}</h3>
                    <p className="max-w-xl text-base leading-8 text-white/72">{feature.body}</p>
                  </div>
                </div>
              </article>
            ))}
            </div>
          </div>
        </section>

        <section id="process" className="px-5 py-16 sm:px-8 lg:px-10 lg:py-20 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl space-y-16">
            <div className="space-y-5 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">როგორ მუშაობს</p>
              <h2 className="text-4xl font-bold tracking-[-0.04em] text-gray-900 sm:text-[3.35rem]">სამი მარტივი ნაბიჯი</h2>
            </div>

            <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
              {steps.map((item) => (
                <div key={item.step} className="mx-auto flex max-w-[340px] flex-col items-center text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#fb923c,#f97316)] text-white shadow-[0_18px_34px_rgba(249,115,22,0.28)]">
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
                  <p className="mt-6 text-sm font-medium text-[#f97316]">Step {item.step.replace(/^0/, "")}</p>
                  <h3 className="mt-2 text-[2rem] font-semibold tracking-[-0.03em] text-gray-900">{item.title}</h3>
                  <p className="mt-3 text-lg leading-8 text-gray-500">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#fb7185,#f97316,#f59e0b)] px-8 py-12 text-center text-white shadow-[0_32px_80px_rgba(249,115,22,0.24)] sm:px-12 sm:py-16">
              <div className="mx-auto max-w-3xl">
                <h3 className="text-4xl font-bold tracking-[-0.05em] sm:text-[3.2rem]">მზად ხარ უკეთესი ივენთისთვის?</h3>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/88 sm:text-[1.3rem]">
                  დავგეგმოთ როგორ გაუშვებ რეგისტრაციას, approval-ს და ნეთვორქინგს ერთ სისტემაში.
                </p>
                <a
                  href="#contact"
                  className="mt-8 inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/40 bg-white/20 px-8 text-lg font-semibold text-white shadow-[0_12px_28px_rgba(255,255,255,0.12)] backdrop-blur transition hover:bg-white hover:text-[#111827]"
                >
                  დავჯავშნოთ ზარი
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="px-5 py-16 sm:px-8 lg:px-10 lg:py-20 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl overflow-hidden rounded-[40px] border border-[#d9e7ff] bg-[linear-gradient(180deg,#f8fbff,#eef5ff)] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6 p-8 sm:p-10 lg:p-14">
                <div className="space-y-4">
                  <h2 className="max-w-xl text-3xl font-bold leading-tight text-gray-900 sm:text-[2.6rem]">
                    თუ გჭირდება სისტემა კონფერენციისთვის, ერთად დავგეგმოთ როგორ გაეშვება
                  </h2>
                  <p className="max-w-xl text-base leading-8 text-gray-600">გაჩვენებთ როგორ იმუშავებს შენს ღონისძიებაზე.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:hello@attenda.ge"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,99,235,0.24)]"
                  >
                    hello@attenda.ge
                  </a>
                  <a
                    href="tel:+995599000000"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-primary/20 bg-white px-6 text-sm font-semibold text-primary"
                  >
                    +995 599 000 000
                  </a>
                </div>
              </div>

              <div className="border-t border-[#d9e7ff] bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.14),transparent_34%),linear-gradient(180deg,#eef5ff,#ffffff)] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <div className="mx-auto max-w-xl lg:mx-0">
                  <LeadCaptureForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="px-5 pb-12 sm:px-8 lg:px-10 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl rounded-[40px] bg-[#07101f] px-6 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-xl font-bold tracking-[-0.03em]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-[0_10px_24px_rgba(37,99,235,0.34)]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
                    </svg>
                  </span>
                  <span>Networkapp</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-white/50">კონტაქტი</p>
                <div className="space-y-3 text-sm">
                  <a href="mailto:hello@attenda.ge" className="block text-white/80 transition hover:text-white">hello@attenda.ge</a>
                  <a href="tel:+995599000000" className="block text-white/80 transition hover:text-white">+995 599 000 000</a>
                  <span className="block text-white/55">თბილისი, საქართველო</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-white/50">სოციალური არხები</p>
                <div className="space-y-3 text-sm">
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="block text-white/80 transition hover:text-white">LinkedIn</a>
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="block text-white/80 transition hover:text-white">Facebook</a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="block text-white/80 transition hover:text-white">Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </section>
    </Shell>
  );
}
