/**
 * Debug-Script: Zeigt alle verfügbaren Feldnamen für ein Produkt
 */

const BARCODE = "4104760401865"; // Black Forest
const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2";

async function debugProduct() {
  const url = `${OFF_API_BASE}/product/${BARCODE}.json`;

  console.log(`Fetching: ${url}\n`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Wasserscan/1.0 Debug",
    },
  });

  const data = await response.json();

  if (!data.product) {
    console.error("Product not found!");
    return;
  }

  console.log("=== PRODUCT INFO ===");
  console.log(`Code: ${data.product.code}`);
  console.log(`Name: ${data.product.product_name}`);
  console.log(`Brand: ${data.product.brands}\n`);

  console.log("=== ALL NUTRIMENT FIELDS ===");
  const nutriments = data.product.nutriments;

  // Alle Felder alphabetisch sortiert
  const allKeys = Object.keys(nutriments).sort();

  console.log(`Total fields: ${allKeys.length}\n`);

  // Relevante Mineralien hervorheben
  const minerals = [
    "calcium", "magnesium", "sodium", "potassium",
    "chloride", "chlorure", "cl",
    "sulfate", "sulfates", "sulphate", "sulphates", "so4",
    "bicarbonate", "bicarbonates", "hydrogencarbonate",
    "nitrate", "nitrates"
  ];

  console.log("=== MINERAL-RELATED FIELDS ===");
  allKeys.forEach(key => {
    const lower = key.toLowerCase();
    if (minerals.some(m => lower.includes(m)) || lower.includes("hydrogencarbonat")) {
      console.log(`${key}: ${nutriments[key]}`);
    }
  });

  console.log("\n=== ALL FIELDS (for debugging) ===");
  allKeys.forEach(key => {
    if (nutriments[key] !== null && nutriments[key] !== undefined && nutriments[key] !== "") {
      console.log(`${key}: ${nutriments[key]}`);
    }
  });
}

debugProduct().catch(console.error);
