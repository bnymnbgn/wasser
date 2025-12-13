"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Share2, Heart, MapPin, Droplet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WaterScoreCard } from "@/src/components/WaterScoreCard";
import type { ScanResult } from "@/src/domain/types";
import Image from "next/image";

// Product Image Component with barcode-based lookup
function ProductImage({
    barcode,
    brand,
    productName,
    origin
}: {
    barcode?: string;
    brand?: string;
    productName?: string;
    origin?: string;
}) {
    const [imageError, setImageError] = useState(false);
    const imagePath = barcode ? `/images/products/${barcode}.webp` : null;

    return (
        <div className="flex flex-col items-center justify-center pt-4 pb-6">
            {/* Product Image with Glow Background */}
            <div className="relative w-full h-80 flex items-center justify-center mb-4">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080c15] to-primary/10 rounded-full blur-3xl opacity-50 transform scale-75 translate-y-4" />

                {/* Main Product Image */}
                {imagePath && !imageError ? (
                    <div className="relative z-10 h-72 w-72 rounded-2xl overflow-hidden shadow-lg border border-white/10">
                        <Image
                            src={imagePath}
                            alt={`${brand || "Wasser"} Flasche`}
                            fill
                            className="object-contain"
                            style={{ backgroundColor: '#f8f8f8' }}
                            onError={() => setImageError(true)}
                            sizes="300px"
                        />
                    </div>
                ) : (
                    // Fallback: Icon placeholder
                    <div className="relative z-10 h-48 w-36 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-center">
                        <Droplet className="w-16 h-16 text-primary/50" />
                    </div>
                )}
            </div>

            {/* Product Info */}
            <h1 className="text-3xl font-bold text-center mb-1">
                {brand || "Unbekanntes Wasser"}
            </h1>
            {(productName || origin) && (
                <p className="text-sm text-gray-400">
                    {[productName, origin].filter(Boolean).join(" • ")}
                </p>
            )}
        </div>
    );
}
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
                {/* Product Image Section */}
                <ProductImage
                    barcode={scan.barcode}
                    brand={scan.productInfo?.brand}
                    productName={scan.productInfo?.productName}
                    origin={scan.productInfo?.origin}
                />

                {/* WaterScoreCard - Full Analysis */}
                <WaterScoreCard scanResult={scan} />
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
