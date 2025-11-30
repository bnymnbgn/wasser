/**
 * Export PostgreSQL database to JSON for SQLite import
 *
 * This script exports WaterSource and WaterAnalysis data from PostgreSQL
 * to JSON files that will be bundled with the mobile app and imported
 * into the local SQLite database on first launch.
 *
 * Usage: node scripts/export-to-json.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function exportData() {
  console.log('🚀 Starting data export from PostgreSQL...\n');

  try {
    // Export WaterSources
    console.log('📦 Exporting WaterSource data...');
    const waterSources = await prisma.waterSource.findMany({
      select: {
        id: true,
        brand: true,
        productName: true,
        origin: true,
        barcode: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`   ✓ Found ${waterSources.length} water sources`);

    // Export WaterAnalyses
    console.log('📊 Exporting WaterAnalysis data...');
    const waterAnalyses = await prisma.waterAnalysis.findMany({
      select: {
        id: true,
        waterSourceId: true,
        analysisDate: true,
        sourceType: true,
        reliabilityScore: true,
        ph: true,
        calcium: true,
        magnesium: true,
        sodium: true,
        potassium: true,
        chloride: true,
        sulfate: true,
        bicarbonate: true,
        nitrate: true,
        fluoride: true,
        totalDissolvedSolids: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`   ✓ Found ${waterAnalyses.length} water analyses\n`);

    // Convert Date objects to ISO strings for SQLite compatibility
    const sourcesFormatted = waterSources.map(source => ({
      ...source,
      createdAt: source.createdAt.toISOString(),
    }));

    const analysesFormatted = waterAnalyses.map(analysis => ({
      ...analysis,
      analysisDate: analysis.analysisDate?.toISOString() || null,
      createdAt: analysis.createdAt.toISOString(),
    }));

    // Create output directory
    const outputDir = path.join(__dirname, '..', 'public', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to JSON files
    const sourcesPath = path.join(outputDir, 'water-sources.json');
    const analysesPath = path.join(outputDir, 'water-analyses.json');

    fs.writeFileSync(sourcesPath, JSON.stringify(sourcesFormatted, null, 2));
    fs.writeFileSync(analysesPath, JSON.stringify(analysesFormatted, null, 2));

    console.log('✅ Export completed successfully!');
    console.log(`   📁 Water sources: ${sourcesPath}`);
    console.log(`   📁 Water analyses: ${analysesPath}`);

    // Calculate file sizes
    const sourcesSize = (fs.statSync(sourcesPath).size / 1024).toFixed(2);
    const analysesSize = (fs.statSync(analysesPath).size / 1024).toFixed(2);
    const totalSize = (parseFloat(sourcesSize) + parseFloat(analysesSize)).toFixed(2);

    console.log(`\n📊 Statistics:`);
    console.log(`   - Water sources: ${waterSources.length} entries (${sourcesSize} KB)`);
    console.log(`   - Water analyses: ${waterAnalyses.length} entries (${analysesSize} KB)`);
    console.log(`   - Total size: ${totalSize} KB`);
    console.log(`\n💡 These files will be bundled with the APK and loaded on first app launch.`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
