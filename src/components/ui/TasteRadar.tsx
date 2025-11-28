'use client';

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import type { TasteProfile } from '@/src/lib/waterMath';
import { Info, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
    profile: TasteProfile;
}

const TASTE_DESCRIPTIONS: Record<string, string> = {
    'Salzig': 'Beeinflusst durch Natrium und Chlorid.',
    'Bitter': 'Beeinflusst durch Magnesium und Sulfat.',
    'Trocken': 'Adstringenz durch Calcium und Härte.',
    'Spritzig': 'CO2-Gehalt (hier Standard "Still").',
    'Süß/Neutral': 'Hydrogencarbonat sorgt für Vollmundigkeit.',
    'Weichheit': 'Geringe Härte fühlt sich weicher an.',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const description = TASTE_DESCRIPTIONS[label] || '';
        return (
            <div className="ocean-card p-3 text-xs shadow-xl border border-ocean-border bg-ocean-surface/95 backdrop-blur-sm z-50">
                <p className="font-semibold text-ocean-primary mb-1">{label}: {value}/10</p>
                <p className="text-ocean-secondary">{description}</p>
            </div>
        );
    }
    return null;
};

export function TasteRadar({ profile }: Props) {
    const [showInfo, setShowInfo] = useState(false);

    const data = [
        { subject: 'Salzig', A: profile.salty, fullMark: 10 },
        { subject: 'Bitter', A: profile.bitter, fullMark: 10 },
        { subject: 'Trocken', A: profile.astringent, fullMark: 10 },
        { subject: 'Spritzig', A: profile.sparkling, fullMark: 10 },
        { subject: 'Süß/Neutral', A: profile.sweet, fullMark: 10 },
        { subject: 'Weichheit', A: profile.softness, fullMark: 10 },
    ];

    return (
        <div className="w-full h-[300px] relative">
            <button
                onClick={() => setShowInfo(true)}
                className="absolute top-0 right-0 p-2 text-ocean-tertiary hover:text-ocean-primary transition-colors z-10"
                aria-label="Info zum Geschmacksprofil"
            >
                <Info className="w-5 h-5" />
            </button>

            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-20 ocean-panel-strong p-4 flex flex-col overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-ocean-primary">Lesehilfe</h4>
                            <button
                                onClick={() => setShowInfo(false)}
                                className="p-1 -mr-1 text-ocean-secondary hover:text-ocean-primary"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3 text-sm text-ocean-secondary">
                            <p>Das Radar zeigt die Ausprägung von 5 Geschmacksdimensionen auf einer Skala von 0 bis 10.</p>
                            <ul className="space-y-2">
                                <li><strong className="text-ocean-primary">Salzig:</strong> Hoher Natriumgehalt.</li>
                                <li><strong className="text-ocean-primary">Bitter:</strong> Viel Magnesium oder Sulfat.</li>
                                <li><strong className="text-ocean-primary">Trocken:</strong> Hoher Calciumgehalt (hartes Wasser).</li>
                                <li><strong className="text-ocean-primary">Süß/Neutral:</strong> Hohes Hydrogencarbonat wirkt puffernd und "rund".</li>
                                <li><strong className="text-ocean-primary">Weichheit:</strong> Niedrige Gesamthärte.</li>
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        tickCount={6}
                        axisLine={false}
                    />
                    <Radar
                        name="Geschmack"
                        dataKey="A"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        fill="#0ea5e9"
                        fillOpacity={0.3}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
