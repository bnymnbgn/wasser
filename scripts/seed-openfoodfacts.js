/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const WATER_OVERRIDES = require("../src/config/waterOverrides.json");

const prisma = new PrismaClient();

const BASE_URL =
  process.env.OFF_BASE_URL ?? "https://world.openfoodfacts.org/api/v2/search";
const PAGE_SIZE = Number(process.env.OFF_PAGE_SIZE ?? 100);
const MAX_PAGES = Number(process.env.OFF_MAX_PAGES ?? 20); // Erhöht von 3 auf 20
const COUNTRY_FILTER = process.env.OFF_COUNTRY ?? ""; // Optional: z.B. "germany"
const DEBUG_BARCODE = process.env.DEBUG_BARCODE ?? "";

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

  // Priorität 1: _value (meist bereits mg/L)
  const absoluteValue = toNumber(nutriments[`${key}_value`]);
  if (absoluteValue !== null) {
    const unit = nutriments[`${key}_unit`];
    return normalizeUnit(absoluteValue, unit);
  }

  // Priorität 2: _serving (häufig 1L) → direkt in mg/L
  const servingValue = toNumber(nutriments[`${key}_serving`]);
  if (servingValue !== null) {
    const servingUnit = nutriments[`${key}_serving_unit`] ?? nutriments[`${key}_unit`];
    return normalizeUnit(servingValue, servingUnit);
  }

  // Priorität 3: _100g oder direktes Feld → wird als 100 ml interpretiert → ×10
  const per100Value = toNumber(nutriments[`${key}_100g`] ?? nutriments[key]);
  if (per100Value !== null) {
    const unit = nutriments[`${key}_100g_unit`] ?? nutriments[`${key}_unit`];
    const normalized = normalizeUnit(per100Value, unit);
    return normalized !== null ? normalized * 10 : null;
  }

  return null;
}

function readNutrimentMulti(nutriments, ...keys) {
  for (const key of keys) {
    const value = readNutriment(nutriments, key);
    if (value !== null) return value;
  }
  return null;
}

function applyOverrides(barcode, values) {
  if (!barcode) return values;
  const override = WATER_OVERRIDES?.[barcode];
  if (!override) return values;
  return { ...values, ...override };
}

function mapWaterValues(nutriments) {
  if (!nutriments) return {};

  return {
    ph: toNumber(nutriments.ph),
    calcium: readNutriment(nutriments, "calcium"),
    magnesium: readNutriment(nutriments, "magnesium"),
    sodium: readNutriment(nutriments, "sodium"),
    potassium: readNutriment(nutriments, "potassium"),
    chloride: readNutrimentMulti(nutriments, "chloride", "chlorure"),
    sulfate: readNutrimentMulti(
      nutriments,
      "sulfates",
      "sulfate",
      "sulphates",
      "sulphate",
      "fr-sulfat"
    ),
    bicarbonate: readNutrimentMulti(
      nutriments,
      "bicarbonates",
      "bicarbonate",
      "hydrogencarbonate",
      "hydrogen-carbonate",
      "fr-hydrogencarbonat"
    ),
    nitrate: readNutrimentMulti(nutriments, "nitrate", "nitrates"),
    fluoride: readNutrimentMulti(
      nutriments,
      "fluoride",
      "fluorure",
      "fluor",
      "fluorid"
    ),
    totalDissolvedSolids: readNutrimentMulti(
      nutriments,
      "residue_dry",
      "dry_extract",
      "total_dissolved_solids"
    ),
  };
}

function hasAnyValue(values) {
  return Object.values(values).some((value) => value !== null && value !== undefined);
}

function buildAnalysisInput(product) {
  const values = mapWaterValues(product.nutriments);
  const finalValues = applyOverrides(product.code, values);
  if (!hasAnyValue(finalValues)) return null;

  return {
    sourceType: "api",
    reliabilityScore: product.nutriscore_grade ? 0.8 : 0.6,
    analysisDate: null,
    ...finalValues,
  };
}

async function fetchProducts(page) {
  const url = new URL(BASE_URL);
  url.searchParams.set("categories_tags_en", "waters");

  // Optional: Länderspezifischer Filter
  if (COUNTRY_FILTER) {
    url.searchParams.set("countries_tags_en", COUNTRY_FILTER);
  }

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

  if (DEBUG_BARCODE && product.code === DEBUG_BARCODE) {
    console.log("\n[DEBUG] Product nutriments for", DEBUG_BARCODE);
    console.dir(product.nutriments, { depth: null });
    console.log("[DEBUG] Parsed values:", analysisInput);
    console.log("[DEBUG] Override lookup:", WATER_OVERRIDES?.[product.code] ?? null);
  }

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

  console.log("=== OpenFoodFacts Import Configuration ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Page Size: ${PAGE_SIZE}`);
  console.log(`Max Pages: ${MAX_PAGES}`);
  console.log(`Country Filter: ${COUNTRY_FILTER || "None (worldwide)"}`);
  console.log(`Max Products: ~${PAGE_SIZE * MAX_PAGES}`);
  console.log("==========================================\n");

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let processed = 0;
  const skipReasons = {};

  const startTime = Date.now();

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    console.log(`\n[Page ${page}/${MAX_PAGES}] Fetching products...`);
    const data = await fetchProducts(page);
    const products = data.products ?? [];

    console.log(`[Page ${page}/${MAX_PAGES}] Received ${products.length} products`);

    for (const product of products) {
      processed += 1;
      try {
        const result = await processProduct(product);
        if (result.created) {
          created += 1;
        } else if (result.skipped) {
          skipped += 1;
          skipReasons[result.skipped] = (skipReasons[result.skipped] || 0) + 1;
        }
      } catch (error) {
        skipped += 1;
        console.warn(
          `Failed to import barcode ${product?.code ?? "unknown"}: ${
            error.message ?? error
          }`
        );
      }

      // Progress indicator every 50 products
      if (processed % 50 === 0) {
        console.log(
          `Progress: ${processed} processed, ${created} imported, ${skipped} skipped`
        );
      }
    }

    if (!data.page_count || page >= data.page_count) {
      console.log(`\n[Info] Reached last available page (${page}/${data.page_count || "?"})`);
      break;
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log("\n=== Import Complete ===");
  console.log(`Duration: ${duration}s`);
  console.log(`Processed: ${processed} products`);
  console.log(`Imported: ${created} water sources`);
  console.log(`Skipped: ${skipped} products`);

  if (Object.keys(skipReasons).length > 0) {
    console.log("\nSkip Reasons:");
    for (const [reason, count] of Object.entries(skipReasons)) {
      console.log(`  - ${reason}: ${count}`);
    }
  }

  console.log("=======================\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
