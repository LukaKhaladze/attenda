import { Conference } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { UICard } from "@/components/ui-card";

type Props = {
  conference: Conference;
};

export function ConferenceCard({ conference }: Props) {
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
          <p className="text-sm text-gray-700">📅 {format(conference.date, "yyyy-MM-dd HH:mm")}</p>
          <p className="text-sm text-gray-700">📍 {conference.location_ka}</p>
          <p className="line-clamp-3 text-sm leading-6 text-gray-700">{conference.description_ka}</p>
        </div>
      </UICard>
    </Link>
  );
}
