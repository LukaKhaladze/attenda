import { Shell } from "@/components/shell";

export default async function HomePage() {
  return (
    <Shell>
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">კონფერენციის მოწვევა ბმულით ან QR-ით</h1>
        <p className="text-sm leading-6 text-gray-700">
          დამსწრეებისთვის ყველა ღონისძიების სია აღარ ჩანს საჯაროდ. ჰოსტმა უნდა გაგიზიაროს კონკრეტული
          კონფერენციის ბმული ან QR კოდი.
        </p>
        <p className="text-sm text-gray-700">
          ღონისძიების შესაქმნელად და გაზიარების ბმულის/QR-ის მისაღებად გამოიყენე <a className="text-primary underline" href="/admin">ადმინის პანელი</a>.
        </p>
      </section>
    </Shell>
  );
}
