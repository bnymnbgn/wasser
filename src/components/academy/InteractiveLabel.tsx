"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import { useTheme, alpha, keyframes } from "@mui/material/styles";
import { X, Info, Droplet, MapPin, FileText, FlaskConical, Building2, Calendar, ArrowLeft } from "lucide-react";

// Stronger pulse animation with visible shadow
const ripple = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 0 0 0 rgba(2, 136, 209, 0.7);
  }
  70% {
    transform: translate(-50%, -50%) scale(1.15);
    box-shadow: 0 0 0 15px rgba(2, 136, 209, 0);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 0 0 0 rgba(2, 136, 209, 0);
  }
`;

// Label hotspot data
interface LabelHotspot {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    description: string;
    details: string[];
    examples?: string[];
    position: { top: string; left: string };
}

const LABEL_HOTSPOTS: LabelHotspot[] = [
    {
        id: "source_name",
        number: 1,
        title: "Quellenname",
        subtitle: "Die Identität des Wassers",
        icon: Droplet,
        description: "Der Name der Quelle, aus der das Mineralwasser stammt. Jede anerkannte Quelle hat einen einzigartigen Namen.",
        details: [
            "Gesetzlich vorgeschriebene Pflichtangabe",
            "Jede Quelle muss amtlich anerkannt sein",
            "Der Name ist markenrechtlich geschützt",
            "Darf nur für Wasser dieser einen Quelle verwendet werden",
        ],
        examples: ["Gerolsteiner", "Apollinaris", "Volvic"],
        // Moved significantly up to clear the large brand text
        position: { top: "-1.5rem", left: "50%" },
    },
    {
        id: "source_location",
        number: 2,
        title: "Quellort",
        subtitle: "Wo das Wasser entspringt",
        icon: MapPin,
        description: "Der geografische Ort, an dem die Quelle liegt und das Wasser abgefüllt wird.",
        details: [
            "Mineralwasser muss am Quellort abgefüllt werden",
            "Transport in Tankwagen ist nicht erlaubt",
            "Garantiert die Ursprünglichkeit des Wassers",
            "Der Ort beeinflusst die Mineralzusammensetzung",
        ],
        examples: ["Gerolstein/Eifel", "Bad Vilbel", "Evian-les-Bains"],
        position: { top: "20%", left: "50%" },
    },
    {
        id: "designation",
        number: 3,
        title: "Verkehrsbezeichnung",
        subtitle: "Die offizielle Kategorie",
        icon: FileText,
        description: "Die gesetzlich vorgeschriebene Bezeichnung, die angibt, um welche Art von Wasser es sich handelt.",
        details: [
            "\"Natürliches Mineralwasser\" - höchste Kategorie",
            "\"Quellwasser\" - weniger strenge Anforderungen",
            "\"Tafelwasser\" - kann gemischt sein",
            "\"Heilwasser\" - mit nachgewiesener Wirkung",
        ],
        examples: [
            "Natürliches Mineralwasser",
            "Mit Kohlensäure versetzt",
            "Ohne Kohlensäure (still)",
        ],
        position: { top: "30%", left: "50%" },
    },
    {
        id: "minerals",
        number: 4,
        title: "Mineralstoffanalyse",
        subtitle: "Das Herzstück des Etiketts",
        icon: FlaskConical,
        description: "Die detaillierte Auflistung aller charakteristischen Mineralstoffe in mg/L, basierend auf einer amtlichen Analyse.",
        details: [
            "Kationen: Natrium, Kalium, Calcium, Magnesium",
            "Anionen: Fluorid, Chlorid, Sulfat, Hydrogencarbonat",
            "Werte stammen aus amtlicher Laboranalyse",
            "Analysedatum muss angegeben sein",
            "Diese Werte scannt die Aqua-Score App!",
        ],
        examples: [
            "Calcium: 348 mg/L",
            "Magnesium: 108 mg/L",
            "Natrium: 118 mg/L",
        ],
        position: { top: "52%", left: "50%" },
    },
    {
        id: "manufacturer",
        number: 5,
        title: "Hersteller",
        subtitle: "Wer abfüllt und verantwortet",
        icon: Building2,
        description: "Name und Anschrift des Mineralbrunnenbetriebs, der für das Produkt verantwortlich ist.",
        details: [
            "Vollständige Anschrift ist Pflicht",
            "Ermöglicht Rückverfolgbarkeit",
            "Kontaktmöglichkeit für Verbraucher",
            "Verantwortlich für Qualitätssicherung",
        ],
        position: { top: "78%", left: "50%" },
    },
    {
        id: "expiry",
        number: 6,
        title: "Mindesthaltbarkeitsdatum",
        subtitle: "Wie lange ist es haltbar?",
        icon: Calendar,
        description: "Das Datum, bis zu dem das Wasser seine optimale Qualität behält - aber auch danach meist noch genießbar.",
        details: [
            "Bei Lebensmitteln gesetzlich vorgeschrieben",
            "Mineralwasser mit Kohlensäure hält länger",
            "Kohlensäure wirkt konservierend",
            "Auch nach Ablauf oft noch genießbar",
            "Kühl und dunkel lagern verlängert Haltbarkeit",
        ],
        position: { top: "92%", left: "50%" },
    },
];

interface InteractiveLabelProps {
    onClose?: () => void;
}

export function InteractiveLabel({ onClose }: InteractiveLabelProps) {
    const theme = useTheme();
    const [selectedHotspot, setSelectedHotspot] = useState<LabelHotspot | null>(null);
    const [visitedHotspots, setVisitedHotspots] = useState<Set<string>>(new Set());

    const handleHotspotClick = (hotspot: LabelHotspot) => {
        setSelectedHotspot(hotspot);
        setVisitedHotspots((prev) => new Set([...prev, hotspot.id]));
    };

    const progress = (visitedHotspots.size / LABEL_HOTSPOTS.length) * 100;

    // Premium Hotspot Button
    const HotspotButton = ({ hotspot }: { hotspot: LabelHotspot }) => (
        <Box
            component="button"
            onClick={() => handleHotspotClick(hotspot)}
            sx={{
                position: "absolute",
                top: hotspot.position.top,
                left: hotspot.position.left,
                transform: "translate(-50%, -50%)",
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                borderRadius: 0, // Squared as requested
                border: `2px solid ${theme.palette.common.white}`,
                bgcolor: visitedHotspots.has(hotspot.id) ? "success.main" : "primary.main",
                color: "common.white",
                fontWeight: 700,
                fontSize: { xs: 12, sm: 14 },
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: theme.shadows[4],
                zIndex: 10,
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                // Pulsing animation for unvisited spots with translation preserved
                animation: !visitedHotspots.has(hotspot.id) ? `${ripple} 2s infinite ease-in-out` : "none",
                "&:hover": {
                    transform: "translate(-50%, -50%) scale(1.15)",
                    boxShadow: theme.shadows[8],
                    bgcolor: visitedHotspots.has(hotspot.id) ? "success.dark" : "primary.dark",
                },
                "&:active": {
                    transform: "translate(-50%, -50%) scale(0.95)",
                },
                borderRadius: "50%",
            }}
        >
            {hotspot.number}
        </Box>
    );

    return (
        <Box sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            minHeight: "100dvh",
        }}>
            {/* Header - Unified with other pages */}
            <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
            }}>
                {onClose && (
                    <IconButton onClick={onClose} sx={{ color: "text.secondary", ml: -1 }}>
                        <ArrowLeft size={24} />
                    </IconButton>
                )}
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                    Etikett verstehen
                </Typography>
            </Box>

            {/* Reverted Progress Bar */}
            <Box sx={{ px: 2, py: 1.5, bgcolor: "background.paper", borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        Fortschritt
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={600}>
                        {visitedHotspots.size} / {LABEL_HOTSPOTS.length}
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 6,
                        borderRadius: 0, // No rounding
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }}
                />
            </Box>

            {/* Main Content Area */}
            <Box sx={{
                flex: 1,
                px: { xs: 2, sm: 4 },
                py: { xs: 3, sm: 4 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflow: "visible", // Important for shadows and hotspots
            }}>

                {/* Realistic Label Container */}
                <Paper
                    elevation={6}
                    sx={{
                        position: "relative",
                        width: "100%",
                        maxWidth: { xs: 320, sm: 380 },
                        borderRadius: 0, // No rounded corners as requested
                        overflow: "visible", // Use visible to allow pulsing hotspots to expand
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                        mb: 4, // Spacing from bottom
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Box sx={{ p: { xs: 3, sm: 4 }, position: "relative" }}>

                        {/* Watermark / Background Decoration */}
                        <Droplet
                            style={{
                                position: "absolute",
                                top: "15%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                opacity: 0.03,
                                width: 200,
                                height: 200,
                                color: theme.palette.text.primary,
                                pointerEvents: "none",
                            }}
                        />

                        {/* Brand Section */}
                        <Box sx={{ textAlign: "center", mb: 3, position: "relative" }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontFamily: "serif", // Classic serif for premium feel
                                    fontWeight: 800,
                                    color: "text.primary",
                                    letterSpacing: 1.5,
                                    textTransform: "uppercase",
                                    mb: 0.5,
                                    fontSize: { xs: "1.75rem", sm: "2rem" },
                                }}
                            >
                                Alpenquelle
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "primary.main",
                                    fontWeight: 600,
                                    letterSpacing: 3,
                                    textTransform: "uppercase",
                                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                }}
                            >
                                Bad Reichenhall
                            </Typography>

                            {/* Hotspots 1 & 2 */}
                            <HotspotButton hotspot={LABEL_HOTSPOTS[0]} />
                            <Box sx={{ position: "absolute", top: "50%", right: -16, transform: "translateY(-50%)" }}>
                                <HotspotButton hotspot={LABEL_HOTSPOTS[1]} />
                            </Box>
                        </Box>

                        {/* Product Type - Clean Typography */}
                        <Box sx={{ textAlign: "center", mb: 3, position: "relative" }}>
                            <Box sx={{
                                display: "inline-block",
                                borderTop: `1px solid ${theme.palette.divider}`,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                py: 1,
                                paddingX: 2,
                            }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: "text.primary",
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        letterSpacing: 1,
                                        fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                    }}
                                >
                                    Natürliches Mineralwasser
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        color: "text.secondary",
                                        mt: 0.5,
                                        fontStyle: "italic",
                                    }}
                                >
                                    mit Kohlensäure versetzt
                                </Typography>
                            </Box>
                            <Box sx={{ position: "absolute", top: "50%", right: -16, transform: "translateY(-50%)" }}>
                                <HotspotButton hotspot={LABEL_HOTSPOTS[2]} />
                            </Box>
                        </Box>

                        {/* Analysis Table - Modern Card Style */}
                        <Box
                            sx={{
                                position: "relative",
                                bgcolor: alpha(theme.palette.primary.main, 0.03),
                                borderRadius: 0, // No rounding
                                p: 2,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                mb: 3,
                            }}
                        >
                            <Typography variant="overline" color="text.secondary" fontWeight={700} display="block" mb={1.5} align="center">
                                Auszug aus der Analyse (mg/l)
                            </Typography>

                            <Box sx={{ display: "flex", gap: 3 }}>
                                {/* Kations Column */}
                                <Box sx={{ flex: 1 }}>
                                    {[
                                        { n: "Calcium", v: "348" },
                                        { n: "Magnesium", v: "108" },
                                        { n: "Natrium", v: "12" },
                                    ].map((item, i) => (
                                        <Box key={i} sx={{ display: "flex", justifyContent: "space-between", mb: 0.75, borderBottom: `1px dashed ${theme.palette.divider}`, pb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">{item.n}</Typography>
                                            <Typography variant="caption" fontWeight={600} color="text.primary">{item.v}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                {/* Anions Column */}
                                <Box sx={{ flex: 1 }}>
                                    {[
                                        { n: "Hydrogencarb.", v: "1816" },
                                        { n: "Sulfat", v: "38" },
                                        { n: "Chlorid", v: "8" },
                                    ].map((item, i) => (
                                        <Box key={i} sx={{ display: "flex", justifyContent: "space-between", mb: 0.75, borderBottom: `1px dashed ${theme.palette.divider}`, pb: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">{item.n}</Typography>
                                            <Typography variant="caption" fontWeight={600} color="text.primary">{item.v}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* Hotspot 4 */}
                            <Box sx={{ position: "absolute", top: "50%", left: -16, transform: "translateY(-50%)" }}>
                                <HotspotButton hotspot={LABEL_HOTSPOTS[3]} />
                            </Box>
                        </Box>

                        {/* Badges - Subtle */}
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
                            {["Für Babynahrung geeignet", "Natriumarm"].map(label => (
                                <Chip
                                    key={label}
                                    label={label}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                        borderColor: alpha(theme.palette.success.main, 0.3),
                                        color: "text.secondary",
                                        bgcolor: alpha(theme.palette.success.main, 0.05),
                                        borderRadius: 0, // Square chips
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Manufacturer Footer */}
                        <Box sx={{
                            textAlign: "center",
                            position: "relative",
                            pt: 2,
                            borderTop: `1px solid ${theme.palette.divider}`
                        }}>
                            <Typography variant="caption" display="block" color="text.primary" fontWeight={600}>
                                Alpenquelle Mineralbrunnen GmbH
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                                83435 Bad Reichenhall · Deutschland
                            </Typography>

                            {/* Hotspot 5 */}
                            <Box sx={{ position: "absolute", top: "60%", left: -16, transform: "translateY(-50%)" }}>
                                <HotspotButton hotspot={LABEL_HOTSPOTS[4]} />
                            </Box>
                        </Box>
                    </Box>

                    {/* Best Before - Integrated nicely */}
                    <Box sx={{
                        bgcolor: alpha(theme.palette.text.primary, 0.03),
                        py: 1.5,
                        px: 3,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        position: "relative",
                    }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                            Mindestens haltbar bis: <Box component="span" color="text.primary">12.2026</Box>
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ letterSpacing: 1 }}>
                            1,0 L ℮
                        </Typography>

                        {/* Hotspot 6 */}
                        <Box sx={{ position: "absolute", top: "50%", right: -16, transform: "translateY(-50%)" }}>
                            <HotspotButton hotspot={LABEL_HOTSPOTS[5]} />
                        </Box>
                    </Box>
                </Paper>

                {/* Bottom Helper Text */}
                <Typography variant="caption" color="text.secondary" align="center" sx={{ maxWidth: 300, display: "block", mb: 8 }}>
                    Ein Etikett enthält viele Informationen – nutzen Sie die Nummern, um zu verstehen, was wirklich wichtig ist.
                </Typography>

            </Box>

            {/* Info Drawer - Clean & Modern */}
            <Drawer
                anchor="bottom"
                open={!!selectedHotspot}
                onClose={() => setSelectedHotspot(null)}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 0, // Squared top
                        borderTopRightRadius: 0, // Squared top
                        maxHeight: "80vh",
                        bgcolor: "background.paper",
                        backgroundImage: "none",
                    },
                }}
            >
                {selectedHotspot && (
                    <Box sx={{ p: 3, pb: 4 }}>
                        {/* Handle */}
                        <Box
                            sx={{
                                width: 48,
                                height: 5,
                                bgcolor: alpha(theme.palette.text.secondary, 0.2),
                                borderRadius: 0, // Squared handle
                                mx: "auto",
                                mb: 3,
                            }}
                        />

                        {/* Header with Icon */}
                        <Box sx={{ display: "flex", gap: 2.5, mb: 3 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 0, // Squared icon box
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: "primary.main",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <selectedHotspot.icon size={28} />
                            </Box>
                            <Box>
                                <Chip
                                    label={`Punkt ${selectedHotspot.number}`}
                                    size="small"
                                    sx={{
                                        mb: 0.5,
                                        height: 20,
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: "primary.main",
                                        borderRadius: 0, // Squared chip
                                    }}
                                />
                                <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                                    {selectedHotspot.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedHotspot.subtitle}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Description */}
                        <Typography variant="body1" color="text.primary" sx={{ mb: 3, lineHeight: 1.6 }}>
                            {selectedHotspot.description}
                        </Typography>

                        {/* Details Box */}
                        <Paper
                            elevation={0}
                            sx={{
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 0, // Squared box
                                p: 2
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                <Info size={16} /> Wissenswertes
                            </Typography>
                            {selectedHotspot.details.map((detail, idx) => (
                                <Box key={idx} sx={{ display: "flex", gap: 1.5, mb: 1, alignItems: "flex-start" }}>
                                    <Box sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%", // Bullets keep round
                                        bgcolor: "primary.main",
                                        mt: 0.8,
                                        flexShrink: 0
                                    }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {detail}
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>

                        {/* Close Button Mobile */}
                        <Box sx={{ mt: 3 }}>
                            <Box
                                component="button"
                                onClick={() => setSelectedHotspot(null)}
                                sx={{
                                    width: "100%",
                                    py: 1.5,
                                    borderRadius: 0, // Squared button
                                    border: "none",
                                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                                    color: "text.primary",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                    cursor: "pointer",
                                    "&:active": {
                                        bgcolor: alpha(theme.palette.text.primary, 0.1),
                                    }
                                }}
                            >
                                Verstanden
                            </Box>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
}

export default InteractiveLabel;
