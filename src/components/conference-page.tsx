import { Conference } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { UICard } from "@/components/ui-card";

type Props = {
  conference: Conference & { agendaHighlights: string[] | null; speakers: string[] | null };
};

export function ConferencePage({ conference }: Props) {
  return (
    <section className="space-y-4 pb-24">
      <UICard className="overflow-hidden p-0">
        <div
          className="h-64 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(17,24,39,.2), rgba(30,58,138,.75)), url(${conference.coverImageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80"})`
          }}
        >
          <div className="flex h-full flex-col justify-end p-4 text-white">
            <span className="mb-2 inline-flex w-fit rounded-full bg-white/20 px-2 py-1 text-xs">კონფერენცია</span>
            <h1 className="text-2xl font-bold">{conference.title_ka}</h1>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-sm text-gray-700">📅 {format(conference.date, "yyyy-MM-dd HH:mm")}</p>
          <p className="text-sm text-gray-700">📍 {conference.location_ka}</p>
          <p className="text-sm leading-6 text-gray-700">{conference.description_ka}</p>
        </div>
      </UICard>

      <UICard>
        <h2 className="mb-2 text-base font-semibold text-gray-900">რას მიიღებ</h2>
        <div className="space-y-2">
          {(conference.agendaHighlights || ["დავაკავშირებდები 500+ პროფესიონალს", "შექმენი ახალი ბიზნეს კავშირები", "გაიგებ იდეებს და გამოცდილებას", "მიიღე ექსკლუზიური შესაძლებლობები"]).map((item) => (
            <div key={item} className="rounded-md border border-gray-100 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </UICard>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4">
        <div className="mx-auto flex w-full max-w-[430px] gap-2">
          <Link href={`/register?conferenceId=${conference.id}`} className="w-full rounded-md bg-primary px-4 py-3 text-center font-medium text-white">
            დარეგისტრირდი
          </Link>
          <Link href={`/attendees?conferenceId=${conference.id}`} className="w-full rounded-md border-2 border-primary px-4 py-3 text-center font-medium text-primary">
            დამსწრეთა ნახვა
          </Link>
        </div>
      </div>
    </section>
  );
}
