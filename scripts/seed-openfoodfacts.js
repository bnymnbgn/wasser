/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const BASE_URL =
  process.env.OFF_BASE_URL ?? "https://world.openfoodfacts.org/api/v2/search";
const PAGE_SIZE = Number(process.env.OFF_PAGE_SIZE ?? 100);
const MAX_PAGES = Number(process.env.OFF_MAX_PAGES ?? 3);

function toNumber(value) {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeUnit(value, rawUnit) {
  if (value === null) return null;
  if (!rawUnit) return value;

  const unit = rawUnit.toLowerCase();
  if (unit === "mg" || unit === "mg/l") return value;
  if (unit === "µg" || unit === "ug") return value / 1000;
  if (unit === "g" || unit === "g/l") return value * 1000;
  return value;
}

function readNutriment(nutriments, key) {
  if (!nutriments) return null;
  const candidates = [
    nutriments[`${key}_value`],
    nutriments[`${key}_serving`],
    nutriments[key],
    nutriments[`${key}_100g`],
  ];
  const value = candidates.map(toNumber).find((v) => v !== null);
  if (value === undefined || value === null) return null;

  const unit =
    nutriments[`${key}_unit`] ??
    nutriments[`${key}_serving_unit`] ??
    nutriments[`${key}_unit`];

  return normalizeUnit(value, unit);
}

function mapWaterValues(nutriments) {
  if (!nutriments) return {};

  return {
    ph: toNumber(nutriments.ph),
    calcium: readNutriment(nutriments, "calcium"),
    magnesium: readNutriment(nutriments, "magnesium"),
    sodium: readNutriment(nutriments, "sodium"),
    potassium: readNutriment(nutriments, "potassium"),
    bicarbonate:
      readNutriment(nutriments, "bicarbonates") ??
      readNutriment(nutriments, "hydrogencarbonate"),
    nitrate: readNutriment(nutriments, "nitrate"),
    totalDissolvedSolids:
      readNutriment(nutriments, "residue_dry") ??
      readNutriment(nutriments, "dry_extract"),
  };
}

function hasAnyValue(values) {
  return Object.values(values).some((value) => value !== null && value !== undefined);
}

function buildAnalysisInput(product) {
  const values = mapWaterValues(product.nutriments);
  if (!hasAnyValue(values)) return null;

  return {
    sourceType: "api",
    reliabilityScore: product.nutriscore_grade ? 0.8 : 0.6,
    analysisDate: null,
    ...values,
  };
}

async function fetchProducts(page) {
  const url = new URL(BASE_URL);
  url.searchParams.set("categories_tags_en", "waters");
  url.searchParams.set("fields", [
    "code",
    "product_name",
    "brands",
    "countries",
    "nutriments",
    "nutriscore_grade",
  ].join(","));
  url.searchParams.set("page_size", String(PAGE_SIZE));
  url.searchParams.set("page", String(page));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenFoodFacts request failed (${response.status})`);
  }
  return response.json();
}

async function processProduct(product) {
  if (!product || !product.code) return { created: false, skipped: "missing_code" };
  const analysisInput = buildAnalysisInput(product);
  if (!analysisInput) return { created: false, skipped: "no_values" };

  const brand = product.brands ? product.brands.split(",")[0].trim() : "Unbekannt";
  const productName = product.product_name?.trim() || "Unbenanntes Wasser";
  const origin = product.countries?.trim() || null;

  await prisma.waterSource.upsert({
    where: { barcode: product.code },
    update: {
      brand,
      productName,
      origin,
      analyses: { create: analysisInput },
    },
    create: {
      brand,
      productName,
      origin,
      barcode: product.code,
      analyses: { create: analysisInput },
    },
  });

  return { created: true };
}

async function main() {
  if (typeof fetch !== "function") {
    throw new Error("Global fetch is not available. Please use Node.js 18 or newer.");
  }

  let created = 0;
  let processed = 0;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    console.log(`Fetching OpenFoodFacts page ${page}/${MAX_PAGES}...`);
    const data = await fetchProducts(page);
    const products = data.products ?? [];

    for (const product of products) {
      processed += 1;
      try {
        const result = await processProduct(product);
        if (result.created) created += 1;
      } catch (error) {
        console.warn(
          `Failed to import barcode ${product?.code ?? "unknown"}: ${
            error.message ?? error
          }`
        );
      }
    }

    if (!data.page_count || page >= data.page_count) {
      break;
    }
  }

  console.log(`Imported ${created} water sources (${processed} products processed).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
