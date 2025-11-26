const fs = require('fs');
const path = require('path');

const sourcesPath = path.join(process.cwd(), 'src/data/water-sources.json');
const analysesPath = path.join(process.cwd(), 'src/data/water-analyses.json');

try {
    const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
    const analyses = JSON.parse(fs.readFileSync(analysesPath, 'utf8'));

    console.log(`Loaded ${sources.length} sources and ${analyses.length} analyses.`);

    const barcodeMap = new Map();
    const duplicateBarcodes = [];

    sources.forEach(s => {
        if (s.barcode) {
            if (barcodeMap.has(s.barcode)) {
                duplicateBarcodes.push({
                    barcode: s.barcode,
                    existingId: barcodeMap.get(s.barcode),
                    newId: s.id,
                    brand: s.brand
                });
            } else {
                barcodeMap.set(s.barcode, s.id);
            }
        }
    });

    if (duplicateBarcodes.length > 0) {
        console.log(`\nFound ${duplicateBarcodes.length} duplicate barcodes.`);
        duplicateBarcodes.forEach(d => {
            // Check if any analysis references the skipped ID (newId)
            const orphanedAnalyses = analyses.filter(a => a.waterSourceId === d.newId);
            if (orphanedAnalyses.length > 0) {
                console.log(`Barcode ${d.barcode}: ID ${d.existingId} vs ${d.newId} (${d.brand})`);
                console.log(`  -> CAUSES ERROR: ${orphanedAnalyses.length} analyses reference the skipped ID ${d.newId}`);
            }
        });
    } else {
        console.log('\nNo duplicate barcodes found.');
    }

} catch (err) {
    console.error('Error:', err);
}
