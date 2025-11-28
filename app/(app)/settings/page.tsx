'use client';

import { useTheme } from '@/src/components/ThemeProvider';
import { useDatabaseContext } from '@/src/contexts/DatabaseContext';
import { hapticLight, hapticMedium } from '@/lib/capacitor';
import {
    Moon,
    Sun,
    Monitor,
    Trash2,
    Info,
    ChevronRight,
    Shield,
    Github,
    ArrowLeft,
    Database
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ProfileSelector } from '@/src/components/ProfileSelector';
import type { ProfileType } from '@/src/domain/types';
import { Sparkles } from 'lucide-react';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { clearHistory, getStorageStats } = useDatabaseContext();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [profile, setProfile] = useState<ProfileType>('standard');
    const [storageStats, setStorageStats] = useState({ count: 0, sizeBytes: 0 });

    useEffect(() => {
        const loadStats = async () => {
            const stats = await getStorageStats();
            setStorageStats(stats);
        };
        loadStats();
    }, [getStorageStats]);

    useEffect(() => {
        const savedProfile = localStorage.getItem('wasserscan-profile') as ProfileType | null;
        if (savedProfile && ['standard', 'baby', 'sport', 'blood_pressure', 'coffee'].includes(savedProfile)) {
            setProfile(savedProfile);
        }
    }, []);

    const handleProfileChange = (newProfile: ProfileType) => {
        setProfile(newProfile);
        localStorage.setItem('wasserscan-profile', newProfile);
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        hapticLight();
        setTheme(newTheme);
    };

    const handleClearHistory = async () => {
        await hapticMedium();
        await clearHistory();
        setShowClearConfirm(false);
    };

    return (
        <main className="min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-ocean-background/80 backdrop-blur-xl border-b border-ocean-border">
                <div className="flex items-center px-4 h-[var(--top-bar-height)]">
                    <Link
                        href="/dashboard"
                        className="p-2 -ml-2 text-ocean-secondary hover:text-ocean-primary transition-colors"
                        onClick={() => hapticLight()}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="ml-2 text-lg font-semibold text-ocean-primary">Einstellungen</h1>
                </div>
            </header>

            <div className="p-4 space-y-6 max-w-2xl mx-auto">
                {/* Profile Section */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs uppercase tracking-wider text-ocean-tertiary">Profil</h2>
                        <Link
                            href="/profile-setup"
                            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ocean-accent hover:text-ocean-primary transition-colors"
                        >
                            <Sparkles className="w-3 h-3" />
                            <span>Wizard starten</span>
                        </Link>
                    </div>
                    <div className="ocean-card ocean-panel overflow-hidden p-4">
                        <ProfileSelector value={profile} onChange={handleProfileChange} />
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-wider text-ocean-tertiary px-1">Erscheinungsbild</h2>
                    <div className="ocean-card ocean-panel overflow-hidden">
                        <button
                            onClick={() => handleThemeChange('system')}
                            className="w-full flex items-center justify-between p-4 hover:bg-ocean-surface-hover transition-colors border-b border-ocean-border last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-ocean-surface-elevated text-ocean-primary">
                                    <Monitor className="w-5 h-5" />
                                </div>
                                <span className="text-ocean-primary">System</span>
                            </div>
                            {theme === 'system' && <div className="w-2 h-2 rounded-full bg-ocean-accent shadow-[0_0_10px_var(--ocean-accent)]" />}
                        </button>
                        <button
                            onClick={() => handleThemeChange('light')}
                            className="w-full flex items-center justify-between p-4 hover:bg-ocean-surface-hover transition-colors border-b border-ocean-border last:border-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-ocean-surface-elevated text-ocean-primary">
                                    <Sun className="w-5 h-5" />
                                </div>
                                <span className="text-ocean-primary">Hell</span>
                            </div>
                            {theme === 'light' && <div className="w-2 h-2 rounded-full bg-ocean-accent shadow-[0_0_10px_var(--ocean-accent)]" />}
                        </button>
                        <button
                            onClick={() => handleThemeChange('dark')}
                            className="w-full flex items-center justify-between p-4 hover:bg-ocean-surface-hover transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-ocean-surface-elevated text-ocean-primary">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <span className="text-ocean-primary">Dunkel</span>
                            </div>
                            {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-ocean-accent shadow-[0_0_10px_var(--ocean-accent)]" />}
                        </button>
                    </div>
                </section>

                {/* Data Section */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-wider text-ocean-tertiary px-1">Daten & Speicher</h2>
                    <div className="ocean-card ocean-panel overflow-hidden">
                        {/* Storage Stats */}
                        <div className="p-4 border-b border-ocean-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-ocean-surface-elevated text-ocean-primary">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-ocean-primary">Speicherbelegung</span>
                                    <span className="text-xs text-ocean-secondary">
                                        {storageStats.count} Scans ({Math.round(storageStats.sizeBytes / 1024)} KB)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!showClearConfirm ? (
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="w-full flex items-center justify-between p-4 hover:bg-ocean-error-bg/10 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-ocean-error-bg text-ocean-error group-hover:scale-110 transition-transform">
                                        <Trash2 className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-ocean-error font-medium">Verlauf löschen</span>
                                        <span className="text-xs text-ocean-secondary">Entfernt alle gespeicherten Scans</span>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-ocean-tertiary" />
                            </button>
                        ) : (
                            <div className="p-4 bg-ocean-error-bg/20">
                                <p className="text-sm text-ocean-primary mb-3 font-medium">Wirklich alle Daten löschen?</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleClearHistory}
                                        className="flex-1 py-2 px-4 bg-ocean-error text-white rounded-xl text-sm font-semibold shadow-lg shadow-ocean-error/20 active:scale-95 transition-transform"
                                    >
                                        Ja, löschen
                                    </button>
                                    <button
                                        onClick={() => setShowClearConfirm(false)}
                                        className="flex-1 py-2 px-4 bg-ocean-surface-elevated text-ocean-primary border border-ocean-border rounded-xl text-sm font-medium active:scale-95 transition-transform"
                                    >
                                        Abbrechen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* About Section */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-wider text-ocean-tertiary px-1">Über</h2>
                    <div className="ocean-card ocean-panel overflow-hidden">
                        <div className="p-4 border-b border-ocean-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-ocean-info-bg text-ocean-info">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-ocean-primary">Version</span>
                                    <span className="text-xs text-ocean-secondary">1.0.0 (Build 24)</span>
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/privacy"
                            className="w-full flex items-center justify-between p-4 hover:bg-ocean-surface-hover transition-colors border-b border-ocean-border"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-ocean-surface-elevated text-ocean-primary">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <span className="text-ocean-primary">Datenschutzerklärung</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-ocean-tertiary" />
                        </Link>
                        <a
                            href="https://github.com/st4b/wasser"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between p-4 hover:bg-ocean-surface-hover transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-ocean-surface-elevated text-ocean-primary">
                                    <Github className="w-5 h-5" />
                                </div>
                                <span className="text-ocean-primary">GitHub</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-ocean-tertiary" />
                        </a>
                    </div>
                </section>

                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-ocean-tertiary">Made with 💧 by Wasserscan</p>
                </div>
            </div>
        </main>
    );
}
