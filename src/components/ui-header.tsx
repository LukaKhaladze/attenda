import Link from "next/link";

type Props = {
  title: string;
  backHref?: string;
};

export function UIHeader({ title, backHref }: Props) {
  const backLabel = backHref?.includes("lang=en") ? "Back" : "უკან";
  return (
    <header className="sticky top-0 z-50 mb-4 flex items-center gap-3 border-b border-gray-200 bg-background/95 px-1 py-3 backdrop-blur">
      {backHref ? (
        <Link href={backHref} className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700">
          {backLabel}
        </Link>
      ) : null}
      <h1 className="text-lg font-semibold text-primary">{title}</h1>
    </header>
  );
}
