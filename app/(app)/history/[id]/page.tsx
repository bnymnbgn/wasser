"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Share2, Heart, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { WaterScoreCard } from "@/src/components/WaterScoreCard";
import { ProductScoreHero } from "@/src/components/ui/ProductScoreHero";
import type { ScanResult } from "@/src/domain/types";
export default function HistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const scanId = params['id'] as string;

    const [scan, setScan] = useState<ScanResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadScan() {
            try {
                setLoading(true);
                const response = await fetch(`/api/scans/${scanId}`);
                if (!response.ok) {
                    throw new Error("Scan nicht gefunden");
                }
                const data = await response.json();
                setScan(data);
            } catch (err: any) {
                setError(err.message || "Fehler beim Laden");
            } finally {
                setLoading(false);
            }
        }

        if (scanId) {
            loadScan();
        }
    }, [scanId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080c15] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !scan) {
        return (
            <div className="min-h-screen bg-[#080c15] flex flex-col items-center justify-center text-white p-4">
                <p className="text-red-400 mb-4">{error || "Scan nicht gefunden"}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-[#111827] rounded-xl"
                >
                    Zurück
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#080c15] text-white font-sans overflow-x-hidden">
            {/* Top App Bar */}
            <div className="sticky top-0 z-50 flex items-center bg-[#080c15]/90 backdrop-blur-md p-4 pb-2 justify-between border-b border-white/5">
                <button
                    onClick={() => router.back()}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight">Analyse</h2>
                <button className="flex size-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 flex flex-col px-4 pb-24">
                {/* Hero Section: Combined Product + Score */}
                <div className="py-6">
                    <ProductScoreHero
                        score={scan.score ?? 0}
                        productImage={scan.barcode ? `/images/products/${scan.barcode}.webp` : null}
                        brand={scan.productInfo?.brand}
                        size={280}
                        delay={0.2}
                    />

                    {/* Product Name & Info */}
                    <motion.div
                        className="text-center mt-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h1 className="text-2xl font-bold">
                            {scan.productInfo?.brand || "Unbekanntes Wasser"}
                        </h1>
                        {(scan.productInfo?.productName || scan.productInfo?.origin) && (
                            <p className="text-sm text-gray-400 mt-1">
                                {[scan.productInfo?.productName, scan.productInfo?.origin].filter(Boolean).join(" • ")}
                            </p>
                        )}
                    </motion.div>
                </div>

                {/* WaterScoreCard - Analysis Details (without duplicate score) */}
                <WaterScoreCard scanResult={scan} hideScoreSection />
            </div>

            {/* Floating Action Bar */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#080c15] via-[#080c15] to-transparent pt-8">
                <div className="flex gap-3 max-w-md mx-auto">
                    <button className="flex-1 bg-primary hover:bg-primary/90 text-white h-14 rounded-full font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95">
                        <Heart className="w-5 h-5" />
                        Zu Favoriten
                    </button>
                    <button className="bg-[#111827] text-white h-14 w-14 rounded-full flex items-center justify-center hover:bg-[#1f2937] transition-colors border border-white/10">
                        <MapPin className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
