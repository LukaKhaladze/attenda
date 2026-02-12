import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto mt-24 max-w-lg rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-soft">
      <h1 className="mb-2 text-2xl font-bold text-brand-900">გვერდი ვერ მოიძებნა</h1>
      <p className="mb-4 text-sm text-brand-700">თხოვნილი მონაცემი შესაძლოა წაშლილია ან დროებით მიუწვდომელია.</p>
      <Link href="/" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
        მთავარზე დაბრუნება
      </Link>
    </section>
  );
}
