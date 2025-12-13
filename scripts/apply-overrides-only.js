const { PrismaClient } = require("@prisma/client");
// Achte auf die korrekte Endung (.js oder .json), je nachdem was du nutzt
const WATER_OVERRIDES = require("../src/config/waterOverrides.json");

const prisma = new PrismaClient();

async function main() {
  console.log("⚡️ Applying overrides (Upsert mode)...");

  for (const [barcode, overrideData] of Object.entries(WATER_OVERRIDES)) {
    // Daten trennen: Stammdaten vs. Mineralien
    const { productName, brand, origin, ...mineralValues } = overrideData;

    // Sicherheits-Defaults für NEUE Wässer (falls im Override was fehlt)
    const safeBrand = brand || "Unbekannte Marke";
    const safeName = productName || "Unbekanntes Wasser";

    console.log(`Processing ${barcode}: ${safeName}...`);

    await prisma.waterSource.upsert({
      where: { barcode },

      // 1. FALL: Wasser existiert schon -> Nur updaten
      update: {
        ...(productName && { productName }),
        ...(brand && { brand }),
        ...(origin && { origin }),
        analyses: {
          // Wir updaten alle existierenden Analysen zu diesem Wasser
          updateMany: {
            where: {}, // "Alle Analysen dieses Wassers"
            data: {
              ...mineralValues,
              sourceType: "manual_override",
              reliabilityScore: 1.0,
            },
          },
        },
      },

      // 2. FALL: Wasser ist neu -> Komplett anlegen
      create: {
        barcode,
        brand: safeBrand,
        productName: safeName,
        origin: origin || null,
        // Wir legen direkt die erste Analyse mit an
        analyses: {
          create: {
            ...mineralValues,
            sourceType: "manual_override",
            reliabilityScore: 1.0,
          },
        },
      },
    });

    console.log(`✅ Success: ${barcode}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
