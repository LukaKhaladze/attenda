import { Conference } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { UICard } from "@/components/ui-card";
import { richTextToPlain } from "@/lib/rich-text";

type Props = {
  conference: Conference;
};

export function ConferenceCard({ conference }: Props) {
  const description = richTextToPlain(conference.description_ka);

  return (
    <Link href={`/conference/${conference.slug}`}>
      <UICard className="overflow-hidden p-0 active:scale-[0.98]">
        <div
          className="h-52 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(17,24,39,.2), rgba(30,58,138,.75)), url(${conference.coverImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80"})`
          }}
        >
          <div className="flex h-full flex-col justify-end p-4 text-white">
            <span className="mb-2 inline-flex w-fit rounded-full bg-white/20 px-2 py-1 text-xs">კონფერენცია</span>
            <h2 className="text-2xl font-bold">{conference.title_ka}</h2>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <p className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="2" />
            </svg>
            {format(conference.date, "yyyy-MM-dd HH:mm")}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
            </svg>
            {conference.location_ka}
          </p>
          <p className="line-clamp-3 text-sm leading-6 text-gray-700">{description}</p>
        </div>
      </UICard>
    </Link>
  );
}
