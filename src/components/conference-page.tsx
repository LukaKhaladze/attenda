import { Conference } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";

type Props = {
  conference: Conference & { agendaHighlights: string[] | null; speakers: string[] | null };
};

export function ConferencePage({ conference }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-soft">
      {conference.coverImageUrl ? (
        <div
          className="h-64 bg-cover bg-center md:h-80"
          style={{ backgroundImage: `linear-gradient(rgba(16,76,69,.15), rgba(16,76,69,.5)), url(${conference.coverImageUrl})` }}
        />
      ) : null}
      <div className="space-y-6 px-6 py-8 md:px-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-brand-900 md:text-4xl">{conference.title_ka}</h1>
          <p className="text-sm text-brand-700">
            {format(conference.date, "yyyy-MM-dd HH:mm")} • {conference.location_ka}
          </p>
          <p className="max-w-3xl leading-7 text-brand-800">{conference.description_ka}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-brand-900">დღის highlights</h2>
            {conference.agendaHighlights && conference.agendaHighlights.length > 0 ? (
              <ul className="space-y-2 text-sm text-brand-700">
                {conference.agendaHighlights.map((item) => (
                  <li key={item} className="rounded-xl bg-brand-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-brand-700">აგენდა მალე განახლდება.</p>
            )}
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-brand-900">სპიკერები</h2>
            {conference.speakers && conference.speakers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {conference.speakers.map((speaker) => (
                  <span key={speaker} className="rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-800">
                    {speaker}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand-700">სპიკერების სია მალე დაემატება.</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {conference.websiteUrl ? (
            <a href={conference.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-700 underline">
              ვებსაიტი
            </a>
          ) : null}
          {conference.mapUrl ? (
            <a href={conference.mapUrl} target="_blank" rel="noreferrer" className="text-brand-700 underline">
              რუკა
            </a>
          ) : null}
        </div>

        <Link
          href={`/register?conferenceId=${conference.id}`}
          className="inline-flex rounded-2xl bg-brand-600 px-5 py-3 font-medium text-white hover:bg-brand-700"
        >
          დარეგისტრირდი როგორც დამსწრე
        </Link>
      </div>
    </section>
  );
}
