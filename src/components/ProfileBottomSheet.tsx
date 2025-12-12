'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Settings, BookOpen, ChevronRight, User } from 'lucide-react';
import { hapticLight } from '@/lib/capacitor';

export function ProfileBottomSheet() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    const theme = useTheme();

    React.useEffect(() => {
        const handleOpen = () => setOpen(true);
        window.addEventListener('open-profile', handleOpen);
        return () => window.removeEventListener('open-profile', handleOpen);
    }, []);

    const handleClose = () => setOpen(false);

    const handleNavigate = (path: string) => {
        hapticLight();
        setOpen(false);
        router.push(path);
    };

    const listItemSx = {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: 'pointer',
        '&:active': { bgcolor: 'action.selected' }
    };

    const menuItems = [
        { icon: Settings, label: 'Einstellungen', subtitle: 'Profil, Körperdaten, Erinnerungen', path: '/settings', color: theme.palette.primary.main },
        { icon: BookOpen, label: 'Lernen / Onboarding', subtitle: 'Profile, Mineralien, Quiz', path: '/onboarding', color: '#6366f1' },
    ];

    return (
        <SwipeableDrawer
            anchor="bottom"
            open={open}
            onClose={handleClose}
            onOpen={() => setOpen(true)}
            disableSwipeToOpen
            PaperProps={{
                sx: {
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    bgcolor: 'background.default',
                    maxHeight: '60vh',
                }
            }}
        >
            {/* Drag Handle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
                <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
            </Box>

            {/* Header */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Profil</Typography>
                </Box>
            </Box>

            {/* Menu Items */}
            {menuItems.map((item) => (
                <Box
                    key={item.path}
                    component="button"
                    onClick={() => handleNavigate(item.path)}
                    sx={{ ...listItemSx, width: '100%', border: 'none', textAlign: 'left' }}
                >
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <item.icon className="w-5 h-5 text-white" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: 'text.primary', fontSize: 15, fontWeight: 500 }}>{item.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.subtitle}</Typography>
                    </Box>
                    <ChevronRight className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
                </Box>
            ))}

            {/* Safe area padding */}
            <Box sx={{ height: 'env(safe-area-inset-bottom)', minHeight: 16 }} />
        </SwipeableDrawer>
    );
}
