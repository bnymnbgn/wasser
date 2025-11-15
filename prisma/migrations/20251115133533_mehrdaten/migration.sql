-- CreateTable
CREATE TABLE "WaterSource" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "origin" TEXT,
    "barcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterAnalysis" (
    "id" TEXT NOT NULL,
    "waterSourceId" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3),
    "sourceType" TEXT NOT NULL,
    "reliabilityScore" DOUBLE PRECISION NOT NULL,
    "ph" DOUBLE PRECISION,
    "calcium" DOUBLE PRECISION,
    "magnesium" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "bicarbonate" DOUBLE PRECISION,
    "nitrate" DOUBLE PRECISION,
    "totalDissolvedSolids" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanResult" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "barcode" TEXT,
    "profile" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "metricScores" JSONB,
    "ocrTextRaw" TEXT,
    "ocrParsedValues" JSONB,
    "userOverrides" JSONB,
    "waterSourceId" TEXT,
    "waterAnalysisId" TEXT,

    CONSTRAINT "ScanResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaterSource_barcode_key" ON "WaterSource"("barcode");

-- CreateIndex
CREATE INDEX "WaterSource_barcode_idx" ON "WaterSource"("barcode");

-- CreateIndex
CREATE INDEX "WaterSource_brand_productName_idx" ON "WaterSource"("brand", "productName");

-- CreateIndex
CREATE INDEX "WaterSource_createdAt_idx" ON "WaterSource"("createdAt");

-- CreateIndex
CREATE INDEX "WaterAnalysis_waterSourceId_createdAt_idx" ON "WaterAnalysis"("waterSourceId", "createdAt");

-- CreateIndex
CREATE INDEX "WaterAnalysis_sourceType_idx" ON "WaterAnalysis"("sourceType");

-- CreateIndex
CREATE INDEX "WaterAnalysis_reliabilityScore_idx" ON "WaterAnalysis"("reliabilityScore");

-- CreateIndex
CREATE INDEX "ScanResult_timestamp_idx" ON "ScanResult"("timestamp");

-- CreateIndex
CREATE INDEX "ScanResult_profile_idx" ON "ScanResult"("profile");

-- CreateIndex
CREATE INDEX "ScanResult_waterSourceId_idx" ON "ScanResult"("waterSourceId");

-- CreateIndex
CREATE INDEX "ScanResult_barcode_idx" ON "ScanResult"("barcode");

-- CreateIndex
CREATE INDEX "ScanResult_score_idx" ON "ScanResult"("score");

-- AddForeignKey
ALTER TABLE "WaterAnalysis" ADD CONSTRAINT "WaterAnalysis_waterSourceId_fkey" FOREIGN KEY ("waterSourceId") REFERENCES "WaterSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_waterSourceId_fkey" FOREIGN KEY ("waterSourceId") REFERENCES "WaterSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_waterAnalysisId_fkey" FOREIGN KEY ("waterAnalysisId") REFERENCES "WaterAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
