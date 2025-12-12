"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PROFILES_LIST } from "@/src/domain/academyContent";
import { hapticLight } from "@/lib/capacitor";

export default function ProfileListPage() {
    const theme = useTheme();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider'
            }}>
                <IconButton component={Link} href="/onboarding" sx={{ color: 'text.secondary' }}>
                    <ArrowLeft className="w-5 h-5" />
                </IconButton>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Profile
                </Typography>
            </Box>

            {/* Intro */}
            <Box sx={{ px: 2, py: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Verstehe die verschiedenen Bewertungsprofile und wann sie am besten geeignet sind.
                </Typography>
            </Box>

            {/* Profile List */}
            <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                {PROFILES_LIST.map((profile, index) => (
                    <Box
                        key={profile.id}
                        component={Link}
                        href={`/onboarding/profile/${profile.id}`}
                        onClick={() => hapticLight()}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 2,
                            py: 2,
                            borderBottom: index < PROFILES_LIST.length - 1 ? 1 : 0,
                            borderColor: 'divider',
                            bgcolor: 'background.default',
                            textDecoration: 'none',
                            '&:active': { bgcolor: 'action.selected' }
                        }}
                    >
                        <Typography sx={{ fontSize: 32 }}>{profile.emoji}</Typography>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: 15 }}>
                                {profile.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {profile.shortDesc}
                            </Typography>
                        </Box>
                        <ChevronRight className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
