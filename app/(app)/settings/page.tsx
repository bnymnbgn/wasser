'use client';

import { useTheme } from '@/src/components/ThemeProvider';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useDatabaseContext } from '@/src/contexts/DatabaseContext';
import { calculateGoals } from '@/src/lib/userGoals';
import { hapticLight, hapticMedium } from '@/lib/capacitor';
import { scheduleHydrationReminders, cancelHydrationReminders } from '@/src/lib/notifications';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
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
    Mail,
    Check,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ProfileSelector } from '@/src/components/ProfileSelector';
import type { ProfileType } from '@/src/domain/types';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const muiTheme = useMuiTheme();
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

    // Reusable list item style
    const listItemSx = {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&:active': { bgcolor: 'action.selected' }
    };

    // Section header style
    const sectionHeaderSx = {
        px: 2,
        py: 1,
        bgcolor: 'background.default'
    };

    return (
        <Box component="main" sx={{ minHeight: '100vh', pb: 12, bgcolor: 'background.default' }}>
            {/* Header */}
            <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, height: 56 }}>
                    <IconButton component={Link} href="/dashboard" onClick={() => hapticLight()} sx={{ color: 'text.secondary', ml: -1 }}>
                        <ArrowLeft className="w-6 h-6" />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600, color: 'text.primary' }}>Einstellungen</Typography>
                </Box>
            </Box>

            {/* PROFILE */}
            <Box sx={sectionHeaderSx}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 500 }}>Profil</Typography>
            </Box>
            <Box sx={{ px: 2, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <ProfileSelector value={profile} onChange={handleProfileChange} />
            </Box>
            <Box
                component={Link}
                href="/profile-setup"
                onClick={() => hapticLight()}
                sx={{ ...listItemSx, textDecoration: 'none' }}
            >
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles className="w-4 h-4 text-white" />
                </Box>
                <Typography sx={{ flex: 1, color: 'text.primary', fontSize: 15 }}>Profil-Wizard starten</Typography>
                <ChevronRight className="w-5 h-5" style={{ color: muiTheme.palette.text.secondary }} />
            </Box>

            {/* BODY DATA */}
            <Box sx={{ ...sectionHeaderSx, mt: 2 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 500 }}>Körperdaten</Typography>
            </Box>
            {showBodyErrors && (
                <Box sx={{ px: 2, py: 1, bgcolor: 'error.main' }}>
                    <Typography variant="caption" sx={{ color: 'white' }}>Bitte positive Werte eintragen.</Typography>
                </Box>
            )}
            <Box sx={{ px: 2, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                    <TextField label="Gewicht (kg)" variant="outlined" size="small" fullWidth value={weight} onChange={(e) => setWeight(e.target.value)} inputProps={{ inputMode: 'decimal' }} />
                    <TextField label="Größe (cm)" variant="outlined" size="small" fullWidth value={height} onChange={(e) => setHeight(e.target.value)} inputProps={{ inputMode: 'decimal' }} />
                    <TextField label="Alter" variant="outlined" size="small" fullWidth value={age} onChange={(e) => setAge(e.target.value)} inputProps={{ inputMode: 'decimal' }} />
                    <TextField label="Geschlecht" variant="outlined" size="small" fullWidth select value={gender} onChange={(e) => setGender(e.target.value as any)} SelectProps={{ native: true }}>
                        <option value="male">Männlich</option>
                        <option value="female">Weiblich</option>
                        <option value="other">Andere</option>
                    </TextField>
                </Box>
                <TextField label="Aktivität" variant="outlined" size="small" fullWidth select value={activity} onChange={(e) => setActivity(e.target.value as any)} SelectProps={{ native: true }} sx={{ mb: 1.5 }}>
                    <option value="sedentary">Sitzend</option>
                    <option value="moderate">Moderat</option>
                    <option value="active">Aktiv</option>
                    <option value="very_active">Sehr aktiv</option>
                </TextField>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSaveBodyData}
                    disabled={!weight || !height || !age || Number(weight) <= 0 || Number(height) <= 0 || Number(age) <= 0}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1.25 }}
                >
                    Ziele berechnen & speichern
                </Button>
            </Box>

            {/* REMINDERS */}
            <Box sx={{ ...sectionHeaderSx, mt: 2 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 500 }}>Erinnerungen</Typography>
            </Box>
            <Box sx={{ px: 2, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, fontSize: 13 }}>Wie oft möchtest du ans Trinken erinnert werden?</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {[0, 30, 60, 90, 120, 180].map((min) => (
                        <Button
                            key={min}
                            variant={reminderInterval === min ? "contained" : "outlined"}
                            size="small"
                            onClick={() => handleReminderChange(min)}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 500, fontSize: 13 }}
                        >
                            {min === 0 ? "Aus" : `${min} min`}
                        </Button>
                    ))}
                </Box>
            </Box>

            {/* APPEARANCE */}
            <Box sx={{ ...sectionHeaderSx, mt: 2 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 500 }}>Erscheinungsbild</Typography>
            </Box>
            {(['system', 'light', 'dark'] as const).map((t) => (
                <Box
                    key={t}
                    component="button"
                    onClick={() => handleThemeChange(t)}
                    sx={{ ...listItemSx, width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.primary' }}>
                        {t === 'system' && <Monitor className="w-4 h-4" />}
                        {t === 'light' && <Sun className="w-4 h-4" />}
                        {t === 'dark' && <Moon className="w-4 h-4" />}
                    </Box>
                    <Typography sx={{ flex: 1, color: 'text.primary', fontSize: 15 }}>{t === 'system' ? 'System' : t === 'light' ? 'Hell' : 'Dunkel'}</Typography>
                    {theme === t && <Check className="w-5 h-5" style={{ color: muiTheme.palette.primary.main }} />}
                </Box>
            ))}

            {/* APP BEHAVIOR */}
            <Box sx={{ ...sectionHeaderSx, mt: 2 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 500 }}>App-Verhalten</Typography>
            </Box>
            <Box sx={listItemSx}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.primary' }}>
                    <Scan className="w-4 h-4" />
                </Box>
                <Typography sx={{ flex: 1, color: 'text.primary', fontSize: 15 }}>Start-Screen</Typography>
                <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 2, p: 0.5 }}>
                    <Button size="small" variant={startScreen === 'dashboard' ? 'contained' : 'text'} onClick={() => handleStartScreenChange('dashboard')} sx={{ borderRadius: 1.5, textTransform: 'none', minWidth: 70, fontSize: 12, px: 1.5 }}>Dashboard</Button>
                    <Button size="small" variant={startScreen === 'scan' ? 'contained' : 'text'} onClick={() => handleStartScreenChange('scan')} sx={{ borderRadius: 1.5, textTransform: 'none', minWidth: 60, fontSize: 12, px: 1.5 }}>Scanner</Button>
                </Box>
            </Box>

            {/* DATA & STORAGE */}
            <Box sx={{ ...sectionHeaderSx, mt: 2 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 500 }}>Daten & Speicher</Typography>
            </Box>
            <Box sx={listItemSx}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.primary' }}>
                    <Database className="w-4 h-4" />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: 'text.primary', fontSize: 15 }}>Speicher</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{storageStats.count} Scans ({Math.round(storageStats.sizeBytes / 1024)} KB)</Typography>
                </Box>
            </Box>
            {!showClearConfirm ? (
                <Box
                    component="button"
                    onClick={() => setShowClearConfirm(true)}
                    sx={{ ...listItemSx, width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 className="w-4 h-4 text-white" />
                    </Box>
                    <Typography sx={{ flex: 1, color: 'error.main', fontSize: 15 }}>Verlauf löschen</Typography>
                    <ChevronRight className="w-5 h-5" style={{ color: muiTheme.palette.text.secondary }} />
                </Box>
            ) : (
                <Box sx={{ px: 2, py: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'error.main' }}>
                    <Typography sx={{ color: 'white', mb: 1.5, fontWeight: 500, fontSize: 15 }}>Wirklich alle Daten löschen?</Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button variant="contained" onClick={handleClearHistory} sx={{ flex: 1, bgcolor: 'white', color: 'error.main', textTransform: 'none', '&:hover': { bgcolor: 'grey.100' } }}>Ja, löschen</Button>
                        <Button variant="outlined" onClick={() => setShowClearConfirm(false)} sx={{ flex: 1, borderColor: 'white', color: 'white', textTransform: 'none' }}>Abbrechen</Button>
                    </Box>
                </Box>
            )}

            {/* ABOUT */}
            <Box sx={{ ...sectionHeaderSx, mt: 2 }}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontWeight: 500 }}>Über</Typography>
            </Box>
            <Box sx={listItemSx}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Info className="w-4 h-4 text-white" />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: 'text.primary', fontSize: 15 }}>Version</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>1.0.0 (Build 24)</Typography>
                </Box>
            </Box>
            {[
                { href: 'mailto:feedback@wasserscan.app', icon: Mail, label: 'Feedback senden', external: true },
                { href: '/privacy', icon: Shield, label: 'Datenschutzerklärung', external: false },
                { href: 'https://github.com/st4b/wasser', icon: Github, label: 'GitHub', external: true },
            ].map((item) => (
                <Box
                    key={item.href}
                    component={item.external ? 'a' : Link}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    sx={{ ...listItemSx, textDecoration: 'none' }}
                >
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.primary' }}>
                        <item.icon className="w-4 h-4" />
                    </Box>
                    <Typography sx={{ flex: 1, color: 'text.primary', fontSize: 15 }}>{item.label}</Typography>
                    <ChevronRight className="w-5 h-5" style={{ color: muiTheme.palette.text.secondary }} />
                </Box>
            ))}

            {/* Footer */}
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Made with 💧 by Wasserscan</Typography>
            </Box>
        </Box>
    );
}
