import { PrismaClient, LogoCategory } from '@prisma/client';

const prisma = new PrismaClient();

// ── Sector / Partner Logos (12) ─────────────────────────────────────
const sectorLogos = [
  {
    name: 'Ministry of Health',
    imageUrl: '/assets/images/logos/factors/شعار وزارة الصحة المصرية.png',
    altTextAr: 'وزارة الصحة المصرية',
    displayOrder: 1,
  },
  {
    name: 'Ministry of Agriculture',
    imageUrl: '/assets/images/logos/factors/ministry-of-agriculture.png',
    altTextAr: 'وزارة الزراعة واستصلاح الأراضي',
    displayOrder: 2,
  },
  {
    name: 'NPPA',
    imageUrl: '/assets/images/logos/factors/NPPA-1-300x300.png',
    altTextAr: 'الهيئة القومية للتأمينات',
    displayOrder: 3,
  },
  {
    name: 'Banque Misr',
    imageUrl: '/assets/images/logos/factors/بنك مصر.png',
    altTextAr: 'بنك مصر',
    displayOrder: 4,
  },
  {
    name: 'Banque du Caire',
    imageUrl: '/assets/images/logos/factors/Banque_du_caire_Logo.png',
    altTextAr: 'بنك القاهرة',
    displayOrder: 5,
  },
  {
    name: 'Bank of Alexandria',
    imageUrl: '/assets/images/logos/factors/بنك الاسكندرية.png',
    altTextAr: 'بنك الإسكندرية',
    sections: ['scale-150'],
    displayOrder: 6,
  },
  {
    name: 'Agricultural Bank of Egypt',
    imageUrl: '/assets/images/logos/factors/البنك الزراعي المصري.png',
    altTextAr: 'البنك الزراعي المصري',
    sections: ['scale-150'],
    displayOrder: 7,
  },
  {
    name: 'Cairo University',
    imageUrl: '/assets/images/logos/factors/جامعة القاهرة.png',
    altTextAr: 'جامعة القاهرة',
    displayOrder: 8,
  },
  {
    name: 'Ain Shams University',
    imageUrl: '/assets/images/logos/factors/شعار جامعة عين شمس.png',
    altTextAr: 'جامعة عين شمس',
    displayOrder: 9,
  },
  {
    name: 'Helwan University',
    imageUrl: '/assets/images/logos/factors/جامعة حلوان.png',
    altTextAr: 'جامعة حلوان',
    displayOrder: 10,
  },
  {
    name: 'Alexandria University',
    imageUrl: '/assets/images/logos/factors/Alexandria-University.svg',
    altTextAr: 'جامعة الإسكندرية',
    sections: ['scale-150'],
    displayOrder: 11,
  },
  {
    name: 'Misr International University',
    imageUrl: '/assets/images/logos/factors/شعار_جامعة_مصر_الدولية.png',
    altTextAr: 'جامعة مصر الدولية',
    displayOrder: 12,
  },
];

// ── Client Logos (6) ────────────────────────────────────────────────
const clientLogos = [
  {
    name: 'Misr Pharmacy',
    imageUrl: '/assets/images/logos/clients/misr-logo.webp',
    altTextAr: 'صيدليات مصر',
    displayOrder: 1,
  },
  {
    name: 'Elsewedy Electric',
    imageUrl: '/assets/images/logos/clients/Elsewedy-EMG-logo-01-e1528629466548.png',
    altTextAr: 'السويدي إلكتريك',
    displayOrder: 2,
  },
  {
    name: 'Dorra Group',
    imageUrl: '/assets/images/logos/clients/Dorra-group-logo.png',
    altTextAr: 'مجموعة درة',
    displayOrder: 3,
  },
  {
    name: 'Cleopatra Group',
    imageUrl: '/assets/images/logos/clients/logo-cleopatra.png',
    altTextAr: 'مجموعة كليوباترا',
    displayOrder: 4,
  },
  {
    name: '2B Computer',
    imageUrl: '/assets/images/logos/clients/208-2086972_1-2b-computer-logo-2b-computer-logo-hd.png',
    altTextAr: '2B كمبيوتر',
    displayOrder: 5,
  },
  {
    name: 'RA Sports',
    imageUrl: '/assets/images/logos/clients/637187487380375480.jpg',
    altTextAr: 'RA الرياضة',
    displayOrder: 6,
  },
];

async function main() {
  console.log('Seeding logos...\n');

  // Seed sector/partner logos
  for (const logo of sectorLogos) {
    const result = await prisma.logo.upsert({
      where: {
        id: `seed-partner-${logo.displayOrder}`,
      },
      update: {
        name: logo.name,
        imageUrl: logo.imageUrl,
        altTextAr: logo.altTextAr,
        sections: logo.sections ?? [],
        displayOrder: logo.displayOrder,
      },
      create: {
        id: `seed-partner-${logo.displayOrder}`,
        name: logo.name,
        imageUrl: logo.imageUrl,
        category: LogoCategory.PARTNER,
        altTextAr: logo.altTextAr,
        sections: logo.sections ?? [],
        displayOrder: logo.displayOrder,
        isActive: true,
      },
    });
    console.log(`  PARTNER: ${result.name} (order ${result.displayOrder})`);
  }

  // Seed client logos
  for (const logo of clientLogos) {
    const result = await prisma.logo.upsert({
      where: {
        id: `seed-client-${logo.displayOrder}`,
      },
      update: {
        name: logo.name,
        imageUrl: logo.imageUrl,
        altTextAr: logo.altTextAr,
        displayOrder: logo.displayOrder,
      },
      create: {
        id: `seed-client-${logo.displayOrder}`,
        name: logo.name,
        imageUrl: logo.imageUrl,
        category: LogoCategory.CLIENT,
        altTextAr: logo.altTextAr,
        sections: [],
        displayOrder: logo.displayOrder,
        isActive: true,
      },
    });
    console.log(`  CLIENT:  ${result.name} (order ${result.displayOrder})`);
  }

  console.log(`\nSeeded ${sectorLogos.length} partner logos and ${clientLogos.length} client logos.`);
}

main()
  .catch((e) => {
    console.error('Logo seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
