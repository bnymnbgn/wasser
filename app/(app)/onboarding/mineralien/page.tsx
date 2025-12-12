"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MINERALS_LIST } from "@/src/domain/academyContent";
import { hapticLight } from "@/lib/capacitor";

export default function MineralienPage() {
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
                    Mineralien
                </Typography>
            </Box>

            {/* Intro */}
            <Box sx={{ px: 2, py: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    Lerne die wichtigsten Mineralstoffe im Wasser kennen und verstehe, warum sie für verschiedene Profile relevant sind.
                </Typography>
            </Box>

            {/* Mineral List */}
            <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                {MINERALS_LIST.map((mineral, index) => (
                    <Box
                        key={mineral.id}
                        component={Link}
                        href={`/onboarding/mineralien/${mineral.id}`}
                        onClick={() => hapticLight()}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 2,
                            py: 2,
                            borderBottom: index < MINERALS_LIST.length - 1 ? 1 : 0,
                            borderColor: 'divider',
                            bgcolor: 'background.default',
                            textDecoration: 'none',
                            '&:active': { bgcolor: 'action.selected' }
                        }}
                    >
                        <Typography sx={{ fontSize: 32 }}>{mineral.emoji}</Typography>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: 15 }}>
                                {mineral.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {mineral.shortDesc}
                            </Typography>
                        </Box>
                        <ChevronRight className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
