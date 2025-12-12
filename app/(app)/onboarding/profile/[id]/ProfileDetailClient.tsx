"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { useTheme } from "@mui/material/styles";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PROFILE_ARTICLES, type AcademyTopic } from "@/src/domain/academyContent";
import { hapticLight } from "@/lib/capacitor";

function markdownToHtml(md: string) {
    const escape = (text: string) => text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const inline = (text: string) =>
        text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    const lines = md.split(/\n/);
    let html = "";
    let inList = false;
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = () => {
        if (tableRows.length > 0) {
            html += '<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">';
            tableRows.forEach((row, rowIndex) => {
                const isHeader = rowIndex === 0;
                const tag = isHeader ? 'th' : 'td';
                const style = isHeader
                    ? 'padding:8px 12px;text-align:left;border-bottom:2px solid currentColor;font-weight:600;opacity:0.7;'
                    : 'padding:8px 12px;text-align:left;border-bottom:1px solid rgba(128,128,128,0.2);';
                html += '<tr>';
                row.forEach(cell => {
                    html += `<${tag} style="${style}">${inline(escape(cell.trim()))}</${tag}>`;
                });
                html += '</tr>';
            });
            html += '</table>';
            tableRows = [];
        }
        inTable = false;
    };

    lines.forEach((line) => {
        // Check for table row (starts and ends with |)
        const tableMatch = line.match(/^\|(.+)\|$/);
        if (tableMatch) {
            // Check if it's a separator row (|---|---|)
            if (/^\|[\s\-:|]+\|$/.test(line)) {
                // Skip separator row, it just confirms we're in a table
                return;
            }
            const cells = (tableMatch[1] ?? '').split('|').map(c => c.trim());
            tableRows.push(cells);
            inTable = true;
            return;
        }

        // If we were in a table but this line isn't a table row, flush the table
        if (inTable) {
            flushTable();
        }

        // Handle list items
        const listMatch = line.match(/^\s*-\s+(.*)/);
        if (listMatch) {
            if (!inList) {
                html += "<ul>";
                inList = true;
            }
            html += `<li>${inline(escape(listMatch[1] ?? ''))}</li>`;
            return;
        }
        if (inList) {
            html += "</ul>";
            inList = false;
        }
        if (line.trim() === "") {
            html += "<br/>";
        } else {
            html += `<p>${inline(escape(line))}</p>`;
        }
    });

    // Flush any remaining table
    if (inTable) {
        flushTable();
    }
    if (inList) html += "</ul>";
    return html;
}

export default function ProfileDetailClient({ profileId }: { profileId: string }) {
    const theme = useTheme();
    const profile = profileId ? PROFILE_ARTICLES[profileId] : undefined;
    const [openTopic, setOpenTopic] = useState<AcademyTopic | null>(null);

    if (!profile) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
                <Typography>Profil nicht gefunden</Typography>
                <Link href="/onboarding/profile">Zurück zur Übersicht</Link>
            </Box>
        );
    }

    const handleOpenTopic = (topic: AcademyTopic) => {
        hapticLight();
        setOpenTopic(topic);
    };

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
                <IconButton component={Link} href="/onboarding/profile" sx={{ color: 'text.secondary' }}>
                    <ArrowLeft className="w-5 h-5" />
                </IconButton>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {profile.label}
                </Typography>
            </Box>

            {/* Hero */}
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    {profile.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {profile.shortDesc}
                </Typography>
            </Box>

            {/* Topic List */}
            <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="caption" sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 1.5,
                    px: 0.5
                }}>
                    Themen entdecken
                </Typography>
            </Box>

            <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                {profile.topics.map((topic, index) => (
                    <Box
                        key={topic.id}
                        onClick={() => handleOpenTopic(topic)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 2,
                            py: 2,
                            borderBottom: index < profile.topics.length - 1 ? 1 : 0,
                            borderColor: 'divider',
                            bgcolor: 'background.default',
                            cursor: 'pointer',
                            '&:active': { bgcolor: 'action.selected' }
                        }}
                    >
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: 15 }}>
                                {topic.title}
                            </Typography>
                            {topic.subtitle && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {topic.subtitle}
                                </Typography>
                            )}
                        </Box>
                        <ChevronRight className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
                    </Box>
                ))}
            </Box>

            {/* Article Bottom Sheet */}
            <SwipeableDrawer
                anchor="bottom"
                open={openTopic !== null}
                onClose={() => setOpenTopic(null)}
                onOpen={() => { }}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        bgcolor: 'background.default',
                        borderTop: `1px solid ${theme.palette.divider}`,
                        maxHeight: '70vh',
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
                    <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
                </Box>
                {openTopic && (
                    <Box sx={{ px: 3, pb: 3, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
                                {openTopic.title}
                            </Typography>
                            <IconButton onClick={() => setOpenTopic(null)} sx={{ color: 'text.secondary' }}>
                                <ChevronRight className="rotate-180 w-5 h-5" />
                            </IconButton>
                        </Box>
                        <Typography
                            component="div"
                            variant="body2"
                            sx={{
                                color: 'text.primary',
                                '& p': { margin: 0, marginBottom: 1.25, lineHeight: 1.6 },
                                '& ul': { paddingLeft: 2.5, margin: 0, marginBottom: 1.25 },
                                '& li': { marginBottom: 0.5 },
                            }}
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(openTopic.content) }}
                        />
                    </Box>
                )}
            </SwipeableDrawer>
        </Box>
    );
}
