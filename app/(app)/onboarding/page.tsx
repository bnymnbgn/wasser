"use client";

import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { useTheme } from "@mui/material/styles";
import { ArrowLeft, ChevronRight, ChevronDown, Droplet, Users, HelpCircle, Tag } from "lucide-react";
import { hapticLight } from "@/lib/capacitor";

const FAQS = [
  {
    q: "Was bedeutet TDS?",
    a: "Total Dissolved Solids: Die Summe aller gelösten Stoffe im Wasser. Ein grober Hinweis auf den Mineralgehalt, aber allein nicht aussagekräftig – die spezifische Zusammensetzung ist entscheidender.",
  },
  {
    q: "Welches Wasser für Babys?",
    a: 'Achte auf sehr niedrige Natrium- und Nitratwerte. Wässer mit der Aufschrift "Geeignet für die Zubereitung von Säuglingsnahrung" erfüllen strenge Kriterien.',
  },
  {
    q: "Warum ist Nitrat wichtig?",
    a: "Hohe Nitratwerte können auf landwirtschaftliche Einträge hindeuten. Für Säuglinge ist Nitrat besonders kritisch, da es im Körper zu Nitrit umgewandelt werden kann.",
  },
  {
    q: "Ist Leitungswasser gut?",
    a: "In Deutschland ist Leitungswasser streng kontrolliert und meist von guter Qualität. Regional kann es Unterschiede geben. Bei Zweifeln hilft eine lokale Wasseranalyse.",
  },
];

export default function OnboardingPage() {
  const theme = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 12 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <IconButton component={Link} href="/dashboard" sx={{ color: 'text.secondary' }}>
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Lernen
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {/* Hero */}
      <Box sx={{ px: 2, py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Wissen, was
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
          wirklich drin ist.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          Entdecke die Bedeutung von Mineralien, verstehe die verschiedenen Bewertungsprofile und finde Antworten auf häufige Fragen.
        </Typography>
      </Box>

      {/* Topics Navigation */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" sx={{
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          display: 'block',
          mb: 1.5
        }}>
          Themen entdecken
        </Typography>
      </Box>

      <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
        {/* Mineralien */}
        <Box
          component={Link}
          href="/onboarding/mineralien"
          onClick={() => hapticLight()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 2.5,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.default',
            textDecoration: 'none',
            '&:active': { bgcolor: 'action.selected' }
          }}
        >
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Droplet className="w-6 h-6 text-white" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: 16 }}>
              Mineralien
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Natrium, Calcium, Magnesium und mehr
            </Typography>
          </Box>
          <ChevronRight className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
        </Box>

        {/* Profile */}
        <Box
          component={Link}
          href="/onboarding/profile"
          onClick={() => hapticLight()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 2.5,
            bgcolor: 'background.default',
            textDecoration: 'none',
            '&:active': { bgcolor: 'action.selected' }
          }}
        >
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users className="w-6 h-6 text-white" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: 16 }}>
              Profile
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Baby, Sport, Blutdruck und mehr
            </Typography>
          </Box>
          <ChevronRight className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
        </Box>

        {/* Label Guide */}
        <Box
          component={Link}
          href="/learn/label-guide"
          onClick={() => hapticLight()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 2.5,
            bgcolor: 'background.default',
            textDecoration: 'none',
            '&:active': { bgcolor: 'action.selected' }
          }}
        >
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'info.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Tag className="w-6 h-6 text-white" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: 16 }}>
              Etikett-Guide
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Verstehe jedes Detail auf der Flasche
            </Typography>
          </Box>
          <ChevronRight className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
        </Box>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ px: 2, pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HelpCircle className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
          <Typography variant="caption" sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase'
          }}>
            Häufige Fragen
          </Typography>
        </Box>

        {FAQS.map((faq) => (
          <Accordion
            key={faq.q}
            expanded={expandedFaq === faq.q}
            onChange={(_, isExpanded) => {
              setExpandedFaq(isExpanded ? faq.q : false);
              hapticLight();
            }}
            sx={{
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:before': { display: 'none' },
              mb: 1,
              borderRadius: '8px !important',
              '&.Mui-expanded': { margin: '0 0 8px 0' }
            }}
            disableGutters
          >
            <AccordionSummary expandIcon={<ChevronDown className="w-4 h-4" />}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {faq.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {faq.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
