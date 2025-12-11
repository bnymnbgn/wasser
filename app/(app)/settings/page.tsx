'use client';

import { useTheme } from '@/src/components/ThemeProvider';
import { useDatabaseContext } from '@/src/contexts/DatabaseContext';
import { calculateGoals } from '@/src/lib/userGoals';
import { hapticLight, hapticMedium } from '@/lib/capacitor';
import { scheduleHydrationReminders, cancelHydrationReminders } from '@/src/lib/notifications';
import clsx from 'clsx';
import TextField from '@mui/material/TextField';
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
    Database,
    Scan,
    Mail
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ProfileSelector } from '@/src/components/ProfileSelector';
import type { ProfileType } from '@/src/domain/types';
import { Sparkles } from 'lucide-react';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { clearHistory, getStorageStats, userProfile, saveUserProfile } = useDatabaseContext();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [profile, setProfile] = useState<ProfileType>('standard');
    const [storageStats, setStorageStats] = useState({ count: 0, sizeBytes: 0 });
    const [startScreen, setStartScreen] = useState<'dashboard' | 'scan'>('dashboard');
    const [weight, setWeight] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active' | 'very_active'>('moderate');
    const [showBodyErrors, setShowBodyErrors] = useState(false);
    const [reminderInterval, setReminderInterval] = useState<number>(0);

    useEffect(() => {
        const loadStats = async () => {
            const stats = await getStorageStats();
            setStorageStats(stats);
        };
        loadStats();
    }, [getStorageStats]);

    // Reset inline error hint when all numbers are valid
    useEffect(() => {
        const w = Number(weight);
        const h = Number(height);
        const a = Number(age);
        if (w > 0 && h > 0 && a > 0) {
            setShowBodyErrors(false);
        }
    }, [weight, height, age]);

    useEffect(() => {
        const savedProfile = localStorage.getItem('wasserscan-profile') as ProfileType | null;
        if (savedProfile && ['standard', 'baby', 'sport', 'blood_pressure', 'coffee', 'kidney'].includes(savedProfile)) {
            setProfile(savedProfile);
        }

        if (userProfile) {
            setWeight(String(userProfile.weight));
            setHeight(String(userProfile.height));
            setAge(String(userProfile.age));
            setGender(userProfile.gender as any);
            setActivity(userProfile.activityLevel as any);
        }

        const savedStartScreen = localStorage.getItem('wasserscan-start-screen') as 'dashboard' | 'scan' | null;
        if (savedStartScreen && ['dashboard', 'scan'].includes(savedStartScreen)) {
            setStartScreen(savedStartScreen);
        }

        const savedInterval = localStorage.getItem('wasserscan-reminder-interval');
        if (savedInterval) {
            const parsed = parseInt(savedInterval);
            if (!Number.isNaN(parsed)) setReminderInterval(parsed);
        }
    }, [userProfile, getStorageStats]);

    const handleStartScreenChange = (screen: 'dashboard' | 'scan') => {
        setStartScreen(screen);
        localStorage.setItem('wasserscan-start-screen', screen);
        hapticLight();
    };

    const handleProfileChange = (newProfile: ProfileType) => {
        setProfile(newProfile);
        localStorage.setItem('wasserscan-profile', newProfile);
    };

    const handleSaveBodyData = async () => {
        const w = Number(weight);
        const h = Number(height);
        const a = Number(age);
        if (!w || !h || !a || w <= 0 || h <= 0 || a <= 0) {
            setShowBodyErrors(true);
            return;
        }
        const goals = calculateGoals({
            weight: w,
            height: h,
            age: a,
            gender,
            activityLevel: activity,
            profileType: profile,
        });
        await saveUserProfile({
            weight: w,
            height: h,
            age: a,
            gender,
            activityLevel: activity,
            profileType: profile,
            dailyWaterGoal: goals.dailyWaterGoal,
            dailyCalciumGoal: goals.dailyCalciumGoal,
            dailyMagnesiumGoal: goals.dailyMagnesiumGoal,
            dailyPotassiumGoal: goals.dailyPotassiumGoal,
            dailySodiumGoal: goals.dailySodiumGoal,
        });
        hapticMedium();
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

    const handleReminderChange = async (nextInterval: number) => {
        setReminderInterval(nextInterval);
        localStorage.setItem('wasserscan-reminder-interval', String(nextInterval));
        if (nextInterval > 0) {
            await scheduleHydrationReminders(nextInterval);
        } else {
            await cancelHydrationReminders();
        }
        hapticLight();
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

                {/* Body Data Section */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-wider text-ocean-tertiary px-1">Körperdaten</h2>
                    <div className="ocean-card ocean-panel overflow-hidden p-4 space-y-3">
                        {showBodyErrors && (
                            <p className="text-xs text-ocean-error mb-1">
                                Bitte positive Werte eintragen, bevor du speicherst.
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <TextField
                                label="Gewicht (kg)"
                                variant="filled"
                                fullWidth
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                inputProps={{ inputMode: 'decimal' }}
                                InputProps={{
                                    sx: {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: 2,
                                        '&:before, &:after': { borderBottom: 'none !important' },
                                        '& input': { color: '#e2e8f0' },
                                    },
                                }}
                                InputLabelProps={{ shrink: true, sx: { color: '#94a3b8' } }}
                                error={weight !== '' && (Number(weight) <= 0 || !Number.isFinite(Number(weight)))}
                                helperText={
                                    weight !== '' && (Number(weight) <= 0 || !Number.isFinite(Number(weight))) ? '> 0' : ' '
                                }
                            />
                            <TextField
                                label="Größe (cm)"
                                variant="filled"
                                fullWidth
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                inputProps={{ inputMode: 'decimal' }}
                                InputProps={{
                                    sx: {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: 2,
                                        '&:before, &:after': { borderBottom: 'none !important' },
                                        '& input': { color: '#e2e8f0' },
                                    },
                                }}
                                InputLabelProps={{ shrink: true, sx: { color: '#94a3b8' } }}
                                error={height !== '' && (Number(height) <= 0 || !Number.isFinite(Number(height)))}
                                helperText={
                                    height !== '' && (Number(height) <= 0 || !Number.isFinite(Number(height))) ? '> 0' : ' '
                                }
                            />
                            <TextField
                                label="Alter"
                                variant="filled"
                                fullWidth
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                inputProps={{ inputMode: 'decimal' }}
                                InputProps={{
                                    sx: {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        borderRadius: 2,
                                        '&:before, &:after': { borderBottom: 'none !important' },
                                        '& input': { color: '#e2e8f0' },
                                    },
                                }}
                                InputLabelProps={{ shrink: true, sx: { color: '#94a3b8' } }}
                                error={age !== '' && (Number(age) <= 0 || !Number.isFinite(Number(age)))}
                                helperText={
                                    age !== '' && (Number(age) <= 0 || !Number.isFinite(Number(age))) ? '> 0' : ' '
                                }
                            />
                            <div className="flex items-center gap-2 rounded-xl border border-ocean-border bg-ocean-surface px-3 py-2 text-sm text-ocean-secondary">
                                <span>Geschlecht</span>
                                <select
                                    className="flex-1 bg-transparent outline-none text-ocean-primary"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as any)}
                                >
                                    <option value="male">Männlich</option>
                                    <option value="female">Weiblich</option>
                                    <option value="other">Anderes</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-ocean-border bg-ocean-surface px-3 py-2 text-sm text-ocean-secondary">
                            <span>Aktivität</span>
                            <select
                                className="flex-1 bg-transparent outline-none text-ocean-primary"
                                value={activity}
                                onChange={(e) => setActivity(e.target.value as any)}
                            >
                                <option value="sedentary">Sitzend</option>
                                <option value="moderate">Moderat</option>
                                <option value="active">Aktiv</option>
                                <option value="very_active">Sehr aktiv</option>
                            </select>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-ocean-border bg-ocean-surface px-3 py-2 text-[11px] text-ocean-secondary">
                            <Info className="w-5 h-5 mt-[2px] text-ocean-primary flex-shrink-0" />
                            <p>
                                Sitzend: Schreibtisch/kaum Bewegung · Moderat: 1–2x Sport/Woche · Aktiv: fast täglich Bewegung · Sehr aktiv: intensives Training/Handwerk.
                            </p>
                        </div>
                        <button
                            onClick={handleSaveBodyData}
                            disabled={
                                !weight ||
                                !height ||
                            !age ||
                            Number(weight) <= 0 ||
                            Number(height) <= 0 ||
                            Number(age) <= 0
                        }
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-ocean-primary to-ocean-accent text-white font-semibold"
                    >
                        Ziele berechnen & speichern
                    </button>
                </div>
                </section>

                {/* Hydration Reminders */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs uppercase tracking-wider text-ocean-tertiary">Erinnerungen</h2>
                        <span className="text-[10px] text-ocean-secondary">Lokale Push</span>
                    </div>
                    <div className="ocean-card ocean-panel overflow-hidden p-4 space-y-3">
                        <p className="text-sm text-ocean-secondary">
                            Stelle ein, wie oft du ans Trinken erinnert werden möchtest. Wir planen Benachrichtigungen für die nächsten 8 Stunden.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[0, 30, 60, 90, 120, 180].map((min) => (
                                <button
                                    key={min}
                                    onClick={() => handleReminderChange(min)}
                                    className={clsx(
                                        "px-3 py-2 rounded-xl border text-sm font-semibold transition",
                                        reminderInterval === min
                                            ? "bg-gradient-to-r from-ocean-primary to-ocean-accent text-white border-ocean-primary"
                                            : "bg-ocean-surface text-ocean-secondary border-ocean-border hover:border-ocean-primary/40"
                                    )}
                                >
                                    {min === 0 ? "Aus" : `${min} min`}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-ocean-tertiary">
                            Hinweise: Bitte Benachrichtigungen erlauben. Änderungen überschreiben bestehende Reminder.
                        </p>
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

                {/* Legal Section */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-wider text-ocean-tertiary px-1">Rechtliches</h2>
                    <div className="ocean-card ocean-panel overflow-hidden divide-y divide-ocean-border">
                        <Link
                            href="/legal/privacy"
                            className="flex items-center justify-between p-4 hover:bg-ocean-surface-hover transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-ocean-primary" />
                                <span className="text-ocean-primary">Datenschutzerklärung</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-ocean-tertiary" />
                        </Link>
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

                {/* App Behavior Section */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-wider text-ocean-tertiary px-1">App-Verhalten</h2>
                    <div className="ocean-card ocean-panel overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-ocean-surface-elevated text-ocean-primary">
                                    <Scan className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-ocean-primary">Start-Screen</span>
                                    <span className="text-xs text-ocean-secondary">App startet im {startScreen === 'dashboard' ? 'Dashboard' : 'Scanner'}</span>
                                </div>
                            </div>
                            <div className="flex bg-ocean-surface-elevated rounded-lg p-1 border border-ocean-border">
                                <button
                                    onClick={() => handleStartScreenChange('dashboard')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${startScreen === 'dashboard'
                                        ? 'bg-ocean-accent text-white shadow-sm'
                                        : 'text-ocean-secondary hover:text-ocean-primary'
                                        }`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => handleStartScreenChange('scan')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${startScreen === 'scan'
                                        ? 'bg-ocean-accent text-white shadow-sm'
                                        : 'text-ocean-secondary hover:text-ocean-primary'
                                        }`}
                                >
                                    Scanner
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="space-y-3">
                    <h2 className="text-xs uppercase tracking-wider text-ocean-tertiary px-1">Über</h2>
                    <div className="ocean-card ocean-panel overflow-hidden">
                        <div className="p-4 border-b border-ocean-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-gradient-to-r from-ocean-primary to-ocean-accent text-white shadow-[0_0_18px_-6px_rgba(14,165,233,0.8)] border border-white/10">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-ocean-primary">Version</span>
                                    <span className="text-xs text-ocean-secondary">1.0.0 (Build 24)</span>
                                </div>
                            </div>
                        </div>
                        <a
                            href="mailto:feedback@wasserscan.app?subject=Feedback%20Wasserscan%20App"
                            className="w-full flex items-center justify-between p-4 hover:bg-ocean-surface-hover transition-colors border-b border-ocean-border"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-ocean-surface-elevated text-ocean-primary">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span className="text-ocean-primary">Feedback senden</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-ocean-tertiary" />
                        </a>
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
