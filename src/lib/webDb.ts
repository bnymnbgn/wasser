/**
 * Dev-only Web DB bootstrap using jeep-sqlite and the exported JSON seeds.
 * Only runs when NEXT_PUBLIC_ENABLE_WEB_DB=true and platform is "web".
 */

import { Capacitor } from "@capacitor/core";
import type { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const enableWebDb = process.env["NEXT_PUBLIC_ENABLE_WEB_DB"] === "true";
const DB_NAME = "wasserscan";

let webDb: SQLiteDBConnection | null = null;

export async function initWebDb(): Promise<SQLiteDBConnection | null> {
  if (!enableWebDb) return null;
  if (Capacitor.getPlatform() !== "web") return null;
  if (webDb) return webDb;

  // Load jeep-sqlite custom element
  const { defineCustomElements } = await import("jeep-sqlite/loader");
  defineCustomElements(window);

  // Wait for the component to be ready
  await customElements.whenDefined("jeep-sqlite");

  // Init Web store
  await CapacitorSQLite.initWebStore();

  const sqlite = new SQLiteConnection(CapacitorSQLite);

  // Import seeds if DB is empty
  const isDb = await CapacitorSQLite.isDatabase({ database: DB_NAME });
  if (!isDb.result) {
    const [sourcesRes, analysesRes] = await Promise.all([
      fetch("/data/water-sources.json"),
      fetch("/data/water-analyses.json"),
    ]);
    const sources = await sourcesRes.json();
    const analyses = await analysesRes.json();

    const payload = {
      database: DB_NAME,
      encrypted: false,
      mode: "full",
      version: 1,
      tables: [
        {
          name: "WaterSource",
          values: sources.map((s: any) => [
            s.id,
            s.brand,
            s.productName,
            s.origin,
            s.barcode,
            s.createdAt,
          ]),
        },
        {
          name: "WaterAnalysis",
          values: analyses.map((a: any) => [
            a.id,
            a.waterSourceId,
            a.analysisDate,
            a.sourceType,
            a.reliabilityScore,
            a.ph,
            a.calcium,
            a.magnesium,
            a.sodium,
            a.potassium,
            a.chloride,
            a.sulfate,
            a.bicarbonate,
            a.nitrate,
            a.fluoride ?? null,
            a.totalDissolvedSolids,
            a.createdAt,
          ]),
        },
      ],
    };

    const valid = await CapacitorSQLite.isJsonValid({ jsonstring: JSON.stringify(payload) });
    if (!valid.result) {
      throw new Error("[WebDB] Seed JSON is invalid");
    }
    await CapacitorSQLite.importFromJson({ jsonstring: JSON.stringify(payload) });
  }

  webDb = await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);
  await webDb.open();

  return webDb;
}
