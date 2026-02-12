import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const conference = await prisma.conference.upsert({
    where: { slug: "tech-connect-tbilisi-2026" },
    update: {
      title_ka: "Tech Connect Tbilisi 2026",
      description_ka:
        "ყოველწლიური კონფერენცია ტექნოლოგიურ ლიდერებსა და დამსწრეებს შორის პირდაპირი პროფესიული კავშირების გასამყარებლად.",
      date: new Date("2026-05-16T09:00:00.000Z"),
      location_ka: "თბილისი, ექსპო ჯორჯია - პავილიონი 11",
      coverImageUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
      websiteUrl: "https://exampleconf.ge",
      mapUrl: "https://maps.google.com/?q=Expo+Georgia+Tbilisi",
      agendaHighlights: [
        "კარიერის ქსელის განვითარება",
        "პროდუქტის სტრატეგიის პანელი",
        "AI და eCommerce პრაქტიკული სესიები"
      ],
      speakers: ["ნინო კობახიძე", "გიორგი ბერიძე", "მარიამ გაბუნია"]
    },
    create: {
      slug: "tech-connect-tbilisi-2026",
      title_ka: "Tech Connect Tbilisi 2026",
      description_ka:
        "ყოველწლიური კონფერენცია ტექნოლოგიურ ლიდერებსა და დამსწრეებს შორის პირდაპირი პროფესიული კავშირების გასამყარებლად.",
      date: new Date("2026-05-16T09:00:00.000Z"),
      location_ka: "თბილისი, ექსპო ჯორჯია - პავილიონი 11",
      coverImageUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
      websiteUrl: "https://exampleconf.ge",
      mapUrl: "https://maps.google.com/?q=Expo+Georgia+Tbilisi",
      agendaHighlights: [
        "კარიერის ქსელის განვითარება",
        "პროდუქტის სტრატეგიის პანელი",
        "AI და eCommerce პრაქტიკული სესიები"
      ],
      speakers: ["ნინო კობახიძე", "გიორგი ბერიძე", "მარიამ გაბუნია"]
    }
  });

  const names = [
    ["ლაშა მჭედლიშვილი", "Attenda", "CTO"],
    ["ნინო ხუციშვილი", "თიბისი", "პროდუქტის მენეჯერი"],
    ["გიორგი ჯავახიშვილი", "Space", "ინჟინერი"],
    ["სალომე აბაშიძე", "Liberty", "UX დიზაინერი"],
    ["მარიამ გიგაშვილი", "DataLab", "ანალიტიკოსი"],
    ["დავით კირვალიძე", "Payze", "Growth Lead"],
    ["ანა ქავთარაძე", "Caucasus Tech", "HR პარტნიორი"],
    ["შოთა ლომიძე", "Adjara Group", "IT მენეჯერი"],
    ["ქეთევან ბერიძე", "Credo", "ბიზნეს ანალიტიკოსი"],
    ["ირაკლი გოგოლაძე", "GeoSoft", "Backend Developer"]
  ];

  for (let i = 0; i < names.length; i += 1) {
    const [fullName, company, position] = names[i];
    await prisma.attendee.create({
      data: {
        conferenceId: conference.id,
        fullName,
        company,
        position,
        phone: `+99559900${String(100 + i)}`,
        linkedinUrl: `https://linkedin.com/in/demo-user-${i + 1}`,
        consentPublicList: true,
        sharePhonePublic: i % 3 === 0,
        status: "APPROVED",
        photoUrl:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
      }
    });
  }

  console.log("Seed დასრულდა წარმატებით");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
