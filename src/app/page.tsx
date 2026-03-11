import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { UICard } from "@/components/ui-card";
import { prisma } from "@/lib/prisma";

const audience = [
  {
    title: "კონფერენციის ორგანიზატორებისთვის",
    body: "ბრენდირებული გვერდი, სუბდომენი, QR და სრული კონტროლი ერთი პლატფორმიდან."
  },
  {
    title: "ივენთ ჰოსტებისთვის",
    body: "საკუთარი პანელი, სადაც დამსწრეების დამტკიცება და კონტენტის განახლება რამდენიმე წამში ხდება."
  },
  {
    title: "B2B ნეთვორქინგზე ორიენტირებული გუნდებისთვის",
    body: "დამსწრეები ხედავენ ერთმანეთს, ფილტრავენ სიას და გეგმავენ შეხვედრებს ღონისძიებამდე."
  }
];

const featureStories = [
  {
    title: "ქასთომ კონფერენციის გვერდი და სუბდომენი",
    body: "თითო ღონისძიება იღებს საკუთარ საჯარო გვერდს, უნიკალურ ბმულს და სურვილის შემთხვევაში ქასთომ სუბდომენს.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80"
  },
  {
    title: "ჰოსტის პანელი მინიჭებული კონფერენციისთვის",
    body: "ჰოსტი ხედავს მხოლოდ თავის ღონისძიებას, ამტკიცებს რეგისტრაციებს და არედაქტირებს კონფერენციის მთავარ ინფორმაციას.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
  },
  {
    title: "დამსწრეები, შეხვედრები და რეალური ნეთვორქინგი",
    body: "დამტკიცებული პროფილები ჩნდება საჯარო სიაში, სადაც დამსწრეები პოულობენ ერთმანეთს და აგზავნიან შეხვედრის შეთავაზებებს.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80"
  }
];

const steps = [
  {
    step: "01",
    title: "ადმინი ამატებს კონფერენციას",
    body: "იქმნება ღონისძიება, სუბდომენი, საჯარო გვერდი და ჰოსტის წვდომა."
  },
  {
    step: "02",
    title: "ჰოსტი მართავს რეგისტრაციებს",
    body: "ჰოსტი თავის პანელში ამტკიცებს დამსწრეებს და ანახლებს კონფერენციის ინფორმაციას."
  },
  {
    step: "03",
    title: "დამსწრეები უკეთ ნეთვორქინგობენ",
    body: "დადასტურებული დამსწრეები ჩანან საჯაროდ და აგზავნიან შეხვედრის შეთავაზებებს."
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
      <section className="space-y-12 pb-12">
        <section className="px-5 pt-5 sm:px-8 lg:px-10 2xl:px-12">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1733] shadow-[0_24px_80px_rgba(11,23,51,0.26)]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-90"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1800&q=80)"
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(37,27,18,0.2),rgba(25,19,18,0.34)_16%,rgba(11,16,28,0.66)_54%,rgba(8,12,24,0.92)_82%,rgba(7,11,22,0.96)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.24),transparent_34%),radial-gradient(circle_at_right_bottom,rgba(34,211,238,0.14),transparent_18%)]" />

            <header className="relative px-4 py-4 sm:px-6 lg:px-8">
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
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#2563eb] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.32)] transition hover:bg-[#1d4ed8]"
                >
                  კონტაქტი
                </a>
              </div>
            </header>

            <div className="relative mx-auto flex min-h-[760px] max-w-screen-2xl items-end px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[860px] lg:px-10 lg:py-14">
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
                    className="inline-flex min-h-14 items-center justify-center rounded-[18px] bg-white/88 px-9 py-4 text-lg font-semibold text-gray-900 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur transition hover:bg-white"
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

        <section id="features" className="px-5 sm:px-8 lg:px-10 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563eb]">ვისთვის არის პლატფორმა</p>
              
              <h2 className="max-w-3xl text-3xl font-bold text-gray-900 sm:text-4xl">ერთი პლატფორმა სამი ძირითადი როლისთვის</h2>
              <p className="max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
                ორგანიზატორი ამზადებს ინფრასტრუქტურას, ჰოსტი მართავს პროცესს, დამსწრე კი იღებს უკეთეს გამოცდილებას.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {audience.map((item) => (
                <UICard key={item.title} className="min-h-[190px] border border-gray-100 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-6 transition-transform duration-200 hover:-translate-y-1">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
                      <path d="M5 20c1.7-3.4 4.4-5 7-5s5.3 1.6 7 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{item.body}</p>
                </UICard>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 sm:px-8 lg:px-10 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl space-y-8">
            {featureStories.map((feature, index) => (
              <article key={feature.title} className={`grid gap-6 overflow-hidden rounded-[32px] border border-gray-200 bg-[linear-gradient(180deg,#ffffff,#f4f9ff)] p-5 shadow-[0_18px_48px_rgba(17,24,39,0.06)] lg:grid-cols-2 lg:items-center lg:gap-10 lg:p-8 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div
                  className="min-h-[280px] rounded-[24px] bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(15,23,42,.12), rgba(15,23,42,.4)), url(${feature.image})`
                  }}
                />
                <div className="space-y-5">
                  <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-2xl bg-[#2563eb] text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)]">
                    0{index + 1}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-gray-900">{feature.title}</h3>
                    <p className="max-w-xl text-base leading-8 text-gray-600">{feature.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="px-5 sm:px-8 lg:px-10 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl space-y-5 rounded-[28px] border border-gray-200 bg-white px-5 py-6 shadow-[0_18px_48px_rgba(17,24,39,0.06)] sm:px-6 lg:px-8 lg:py-8">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563eb]">როგორ მუშაობს</p>
              <h2 className="text-3xl font-bold text-gray-900">სამი ნაბიჯი გაშვებიდან შეხვედრამდე</h2>
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
          </div>
        </section>

        <section id="contact" className="px-5 sm:px-8 lg:px-10 2xl:px-12">
          <div className="mx-auto max-w-screen-2xl overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] px-5 py-8 text-white shadow-[0_20px_60px_rgba(37,99,235,0.25)] sm:px-8 lg:px-10 lg:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">კონტაქტი</p>
                
                <h2 className="text-3xl font-bold">თუ გჭირდება ბრენდირებული საკონფერენციო პლატფორმა, დავგეგმოთ დემო</h2>
                <p className="max-w-2xl text-sm leading-7 text-white/84">თუ გჭირდება პლატფორმა კონფერენციისთვის, გაჩვენებთ სამუშაო დემოს და დაგიგეგმავთ გაშვებას.</p>
              </div>
              <div className="rounded-[24px] border border-white/20 bg-white/10 p-5 backdrop-blur">
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-white/80">ელფოსტა</p>
                    <a href="mailto:hello@attenda.ge" className="mt-1 block text-lg font-semibold text-white">hello@attenda.ge</a>
                  </div>
                  <div>
                    <p className="font-semibold text-white/80">ტელეფონი</p>
                    <a href="tel:+995599000000" className="mt-1 block text-lg font-semibold text-white">+995 599 000 000</a>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4">
                    <p className="text-sm font-semibold text-white/80">დემოს მიზანი</p>
                    <p className="mt-2 text-base font-semibold text-white">როგორ მიიღებთ მეტ რეგისტრაციას და უკეთეს ნეთვორქინგს ერთ პლატფორმაში.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="px-5 sm:px-8 lg:px-10 2xl:px-12">
          <div className="mx-auto grid max-w-screen-2xl gap-8 rounded-[28px] bg-[#081225] px-6 py-8 text-white sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xl font-bold tracking-[-0.03em]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,0.34)]">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
                  </svg>
                </span>
                <span>Networkapp</span>
              </div>
              <p className="max-w-md text-sm leading-7 text-white/70">
                პლატფორმა კონფერენციებისთვის, სადაც ერთ სივრცეში ერთიანდება რეგისტრაცია, დამსწრეთა დამტკიცება და ნეთვორქინგი.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">კონტაქტი</p>
              <div className="space-y-3 text-sm">
                <a href="mailto:hello@attenda.ge" className="block text-white/80 transition hover:text-white">hello@attenda.ge</a>
                <a href="tel:+995599000000" className="block text-white/80 transition hover:text-white">+995 599 000 000</a>
                <span className="block text-white/60">თბილისი, საქართველო</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">სოციალური არხები</p>
              <div className="space-y-3 text-sm">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="block text-white/80 transition hover:text-white">LinkedIn</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="block text-white/80 transition hover:text-white">Facebook</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="block text-white/80 transition hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
        </footer>
      </section>
    </Shell>
  );
}
