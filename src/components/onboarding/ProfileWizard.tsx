"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import {
  ArrowRight,
  Baby,
  Activity,
  HeartPulse,
  Droplet,
  Coffee,
  Shield,
  Ruler,
  Scale,
  Heart,
  Info,
  ArrowLeft,
  Check,
  ChevronRight,
  PersonStanding,
  UserRound,
  Syringe,
} from "lucide-react";
import type { ProfileType } from "@/src/domain/types";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import { calculateGoals } from "@/src/lib/userGoals";
import { hapticLight } from "@/lib/capacitor";

interface WizardStep {
  id: string;
  question: string;
  description?: string;
  icon: React.ElementType;
}

const PROFILE_META: Record<
  ProfileType,
  { label: string; subtitle: string; chips: string[]; icon: React.ElementType }
> = {
  baby: {
    label: "Baby",
    subtitle: "Sehr niedrige Mineralisation, natrium- & nitratarm",
    chips: ["Natrium/Nitrat streng niedrig", "Nur nach Empfehlung"],
    icon: Baby,
  },
  blood_pressure: {
    label: "Blutdruck & Herz",
    subtitle: "Natriumärmer, ausgewogen",
    chips: ["Weniger Natrium", "Ausgewogene Härte"],
    icon: HeartPulse,
  },
  kidney: {
    label: "Nieren",
    subtitle: "Natrium- & kaliumarm, geringe Mineralisation",
    chips: ["Sehr wenig Na/K", "Leichte Mineralien"],
    icon: Shield,
  },
  coffee: {
    label: "Barista",
    subtitle: "Weiches Wasser für klare Aromen",
    chips: ["Weich & neutral", "Höhere Extraktion"],
    icon: Coffee,
  },
  sport: {
    label: "Sport",
    subtitle: "Mehr Magnesium/Natrium für Regeneration",
    chips: ["Mehr Mg/Na", "Schneller Auffüllen"],
    icon: Activity,
  },
  standard: {
    label: "Standard",
    subtitle: "Ausgewogen für den Alltag",
    chips: ["Balance", "Alltagstauglich"],
    icon: Droplet,
  },
  pregnancy: {
    label: "Schwangerschaft",
    subtitle: "Schonend für Mutter & Kind",
    chips: ["Nitratarm", "Mehr Ca/Mg"],
    icon: PersonStanding,
  },
  seniors: {
    label: "Senioren",
    subtitle: "Knochengesundheit & altersgerechte Versorgung",
    chips: ["Viel Ca/Mg", "Moderates Na"],
    icon: UserRound,
  },
  diabetes: {
    label: "Diabetes",
    subtitle: "Magnesiumreich für Insulinsensitivität",
    chips: ["Viel Mg", "Moderates Na"],
    icon: Syringe,
  },
};

const STEPS: WizardStep[] = [
  {
    id: "baby",
    question: "Bereitest du regelmäßig Babynahrung zu?",
    description: "Säuglinge benötigen besonders natrium- und nitratarmes Wasser.",
    icon: Baby,
  },
  {
    id: "pregnancy",
    question: "Bist du schwanger oder planst eine Schwangerschaft?",
    description: "Für Mutter & Kind gelten ähnlich strenge Kriterien wie beim Baby, plus erhöhter Calcium-/Magnesiumbedarf.",
    icon: PersonStanding,
  },
  {
    id: "blood_pressure",
    question: "Musst du auf deinen Blutdruck achten?",
    description: "Bei Bluthochdruck wird oft eine natriumarme Ernährung empfohlen.",
    icon: HeartPulse,
  },
  {
    id: "kidney",
    question: "Brauchst du natrium- und kaliumarmes Wasser (Nieren)?",
    description: "Nur nach ärztlicher Empfehlung: sehr niedrige Mineralisation.",
    icon: Shield,
  },
  {
    id: "coffee",
    question: "Trinkst du leidenschaftlich gerne Kaffee oder Tee?",
    description: "Weiches Wasser ist entscheidend für die Entfaltung feiner Aromen.",
    icon: Coffee,
  },
  {
    id: "sport",
    question: "Treibst du viel Sport?",
    description: "Aktive Menschen profitieren von mehr Magnesium und Natrium.",
    icon: Activity,
  },
  {
    id: "seniors",
    question: "Bist du 60 Jahre oder älter?",
    description: "Im Alter sind Knochengesundheit und ausreichende Flüssigkeitszufuhr besonders wichtig.",
    icon: UserRound,
  },
  {
    id: "diabetes",
    question: "Hast du Diabetes (Typ 1 oder Typ 2)?",
    description: "Magnesium unterstützt die Insulinsensitivität und hilft bei häufigen Begleiterscheinungen.",
    icon: Syringe,
  },
];

type Gender = "male" | "female" | "other";
type ActivityLevel = "sedentary" | "moderate" | "active" | "very_active";

const GENDER_OPTIONS = [
  { value: "male", label: "Männlich" },
  { value: "female", label: "Weiblich" },
  { value: "other", label: "Divers" },
];

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sitzend" },
  { value: "moderate", label: "Moderat" },
  { value: "active", label: "Aktiv" },
  { value: "very_active", label: "Sehr aktiv" },
];

export function ProfileWizard() {
  const router = useRouter();
  const theme = useTheme();
  const { saveUserProfile } = useDatabaseContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [recommendedProfile, setRecommendedProfile] = useState<ProfileType | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  // Body data
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [showActivityInfo, setShowActivityInfo] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const currentStep = STEPS[currentStepIndex];
  const needsBodyData = recommendedProfile ? !["baby", "coffee"].includes(recommendedProfile) : false;

  const resetWizard = () => {
    setRecommendedProfile(null);
    setCurrentStepIndex(-1);
    setAnswers({});
    setShowErrors(false);
  };

  const effectiveMetrics = useMemo(() => {
    const weightNum = Number(weight) > 0 ? Number(weight) : 70;
    const heightNum = Number(height) > 0 ? Number(height) : 175;
    const ageNum = Number(age) > 0 ? Number(age) : 30;
    return { weightNum, heightNum, ageNum };
  }, [weight, height, age]);

  const previewGoals = useMemo(() => {
    if (!recommendedProfile) return null;
    return calculateGoals({
      weight: effectiveMetrics.weightNum,
      height: effectiveMetrics.heightNum,
      age: effectiveMetrics.ageNum,
      gender,
      activityLevel: activity,
      profileType: recommendedProfile,
    });
  }, [activity, effectiveMetrics, gender, recommendedProfile]);

  useEffect(() => {
    const weightNum = Number(weight);
    const heightNum = Number(height);
    const ageNum = Number(age);
    if (weightNum > 0 && heightNum > 0 && ageNum > 0) {
      setShowErrors(false);
    }
  }, [weight, height, age]);

  const handleAnswer = (answer: boolean) => {
    if (!currentStep) return;
    hapticLight();

    const newAnswers = { ...answers, [currentStep.id]: answer };
    setAnswers(newAnswers);

    if (currentStep.id === "baby" && answer) {
      finishWizard("baby");
      return;
    }
    if (currentStep.id === "pregnancy" && answer) {
      finishWizard("pregnancy");
      return;
    }
    if (currentStep.id === "blood_pressure" && answer) {
      finishWizard("blood_pressure");
      return;
    }
    if (currentStep.id === "kidney" && answer) {
      finishWizard("kidney");
      return;
    }

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      if (newAnswers["diabetes"]) {
        finishWizard("diabetes");
      } else if (newAnswers["seniors"]) {
        finishWizard("seniors");
      } else if (newAnswers["coffee"]) {
        finishWizard("coffee");
      } else if (newAnswers["sport"]) {
        finishWizard("sport");
      } else {
        finishWizard("standard");
      }
    }
  };

  const finishWizard = (profile: ProfileType) => {
    setRecommendedProfile(profile);
    setCurrentStepIndex(STEPS.length);
    // Auto-set gender to female for pregnancy profile
    if (profile === "pregnancy") {
      setGender("female");
    }
  };

  const applyProfile = async () => {
    if (!recommendedProfile) return;
    hapticLight();

    const needsBodyData = !["baby", "coffee"].includes(recommendedProfile);
    let weightNum = Number(weight);
    let heightNum = Number(height);
    let ageNum = Number(age);

    if (needsBodyData) {
      const invalid = !weightNum || !heightNum || !ageNum || weightNum <= 0 || heightNum <= 0 || ageNum <= 0;
      if (invalid) {
        setShowErrors(true);
        return;
      }
    } else {
      if (!weightNum || weightNum <= 0) weightNum = 70;
      if (!heightNum || heightNum <= 0) heightNum = 175;
      if (!ageNum || ageNum <= 0) ageNum = 30;
    }

    const goals = calculateGoals({
      weight: weightNum,
      height: heightNum,
      age: ageNum,
      gender,
      activityLevel: activity,
      profileType: recommendedProfile,
    });

    await saveUserProfile({
      weight: weightNum,
      height: heightNum,
      age: ageNum,
      gender,
      activityLevel: activity,
      profileType: recommendedProfile,
      dailyWaterGoal: goals.dailyWaterGoal,
      dailyCalciumGoal: goals.dailyCalciumGoal,
      dailyMagnesiumGoal: goals.dailyMagnesiumGoal,
      dailyPotassiumGoal: goals.dailyPotassiumGoal,
      dailySodiumGoal: goals.dailySodiumGoal,
    });

    localStorage.setItem("wasserscan-profile", recommendedProfile);
    router.push(`/dashboard?profile=${recommendedProfile}`);
  };

  // ========== RESULT VIEW ==========
  if (recommendedProfile) {
    const meta = PROFILE_META[recommendedProfile];
    const Icon = meta.icon;

    return (
      <Box sx={{ minHeight: '60vh', pb: 12 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Icon className="w-10 h-10 text-white" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Dein ideales Profil
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {meta.label}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {meta.subtitle}
          </Typography>
        </Box>

        {/* Chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', px: 2, mb: 3 }}>
          {meta.chips.map((chip) => (
            <Chip
              key={chip}
              icon={<Check className="w-4 h-4" />}
              label={chip}
              size="small"
              sx={{ bgcolor: 'action.selected' }}
            />
          ))}
        </Box>

        {/* Preview Goals */}
        {previewGoals && (
          <Box sx={{ mx: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
              Tagesziel (geschätzt)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                💧 {Math.round(previewGoals.dailyWaterGoal)} ml
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                🦴 {Math.round(previewGoals.dailyCalciumGoal)} mg Ca
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                💪 {Math.round(previewGoals.dailyMagnesiumGoal)} mg Mg
              </Typography>
            </Box>
          </Box>
        )}

        {/* Body Data Form */}
        {needsBodyData ? (
          <Box sx={{ px: 2, mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mb: 2 }}>
              Körperdaten
            </Typography>

            {/* Weight, Height, Age */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', py: 1.5 }}>
                <Scale className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
                <Typography sx={{ flex: 1, color: 'text.secondary', fontSize: 14 }}>Gewicht</Typography>
                <TextField
                  variant="standard"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  inputMode="decimal"
                  error={showErrors && (!weight || Number(weight) <= 0)}
                  sx={{ width: 80 }}
                  InputProps={{
                    disableUnderline: true,
                    sx: { textAlign: 'right', fontSize: 14, fontWeight: 600, color: 'text.primary' }
                  }}
                />
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>kg</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', py: 1.5 }}>
                <Ruler className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
                <Typography sx={{ flex: 1, color: 'text.secondary', fontSize: 14 }}>Größe</Typography>
                <TextField
                  variant="standard"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  inputMode="decimal"
                  error={showErrors && (!height || Number(height) <= 0)}
                  sx={{ width: 80 }}
                  InputProps={{
                    disableUnderline: true,
                    sx: { textAlign: 'right', fontSize: 14, fontWeight: 600, color: 'text.primary' }
                  }}
                />
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>cm</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider', py: 1.5 }}>
                <Heart className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
                <Typography sx={{ flex: 1, color: 'text.secondary', fontSize: 14 }}>Alter</Typography>
                <TextField
                  variant="standard"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="30"
                  inputMode="decimal"
                  error={showErrors && (!age || Number(age) <= 0)}
                  sx={{ width: 80 }}
                  InputProps={{
                    disableUnderline: true,
                    sx: { textAlign: 'right', fontSize: 14, fontWeight: 600, color: 'text.primary' }
                  }}
                />
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>Jahre</Typography>
              </Box>
            </Box>

            {/* Gender */}
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', display: 'block', mt: 3, mb: 1 }}>
              Geschlecht
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {GENDER_OPTIONS
                .filter((opt) => recommendedProfile !== "pregnancy" || opt.value !== "male")
                .map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    onClick={() => { setGender(opt.value as Gender); hapticLight(); }}
                    color={gender === opt.value ? "primary" : "default"}
                    variant={gender === opt.value ? "filled" : "outlined"}
                    size="small"
                  />
                ))}
            </Box>

            {/* Activity */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                Aktivität
              </Typography>
              <IconButton size="small" onClick={() => setShowActivityInfo(!showActivityInfo)}>
                <Info className="w-4 h-4" />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {ACTIVITY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  onClick={() => { setActivity(opt.value as ActivityLevel); hapticLight(); }}
                  color={activity === opt.value ? "primary" : "default"}
                  variant={activity === opt.value ? "filled" : "outlined"}
                  size="small"
                />
              ))}
            </Box>

            {showActivityInfo && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}>
                  <strong>Sitzend:</strong> Schreibtisch, kaum Bewegung<br />
                  <strong>Moderat:</strong> 1–2x Sport/Woche<br />
                  <strong>Aktiv:</strong> Fast täglich<br />
                  <strong>Sehr aktiv:</strong> Intensiv / Handwerk
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ px: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Für Baby- und Kaffee-Profil sind Körperdaten optional.
            </Typography>
          </Box>
        )}

        {/* Error Message */}
        {showErrors && needsBodyData && (
          <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', mb: 2 }}>
            Bitte gültige Werte für Gewicht, Größe und Alter eingeben.
          </Typography>
        )}

        {/* Action Buttons */}
        <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={applyProfile}
            disabled={needsBodyData && (!weight || !height || !age || Number(weight) <= 0 || Number(height) <= 0 || Number(age) <= 0)}
            endIcon={<ArrowRight className="w-5 h-5" />}
            sx={{ borderRadius: 3, py: 1.5 }}
          >
            Profil übernehmen
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={resetWizard}
            sx={{ borderRadius: 3 }}
          >
            Profil ändern
          </Button>
        </Box>
      </Box>
    );
  }

  // ========== INTRO VIEW (Profile Selection) ==========
  if (currentStepIndex === -1) {
    return (
      <Box sx={{ minHeight: '60vh', pb: 12 }}>
        <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Wähle dein Profil
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Zwei Schritte: Profil wählen, optional Körperdaten ergänzen.
          </Typography>
        </Box>

        {/* Profile List */}
        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          {(["baby", "pregnancy", "seniors", "diabetes", "blood_pressure", "kidney", "coffee", "sport", "standard"] as ProfileType[]).map((p) => {
            const meta = PROFILE_META[p];
            const Icon = meta.icon;
            return (
              <Box
                key={p}
                component="button"
                onClick={() => { finishWizard(p); hapticLight(); }}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  py: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                  textAlign: 'left',
                  cursor: 'pointer',
                  '&:active': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon className="w-6 h-6" style={{ color: theme.palette.primary.main }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: 15 }}>
                    {meta.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {meta.subtitle}
                  </Typography>
                </Box>
                <ChevronRight className="w-5 h-5" style={{ color: theme.palette.text.secondary }} />
              </Box>
            );
          })}
        </Box>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 3 }}>
          Du kannst später jederzeit in den Einstellungen wechseln.
        </Typography>
      </Box>
    );
  }

  // ========== WIZARD STEP VIEW ==========
  if (!currentStep) return null;
  const StepIcon = currentStep.icon;

  return (
    <Box sx={{ minHeight: '60vh', pb: 12 }}>
      {/* Step Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <IconButton
          onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
          sx={{ color: 'text.secondary' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Schritt {currentStepIndex + 1} / {STEPS.length}
        </Typography>
        <Button
          size="small"
          onClick={() => handleAnswer(false)}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
        >
          Überspringen
        </Button>
      </Box>

      {/* Step Content */}
      <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: 3,
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3
        }}>
          <StepIcon className="w-10 h-10" style={{ color: theme.palette.primary.main }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
          {currentStep.question}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          {currentStep.description}
        </Typography>

        {/* Answer Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => handleAnswer(false)}
            sx={{ borderRadius: 3, py: 1.5, justifyContent: 'flex-start', px: 3 }}
          >
            <Droplet className="w-5 h-5 mr-3" />
            Nein, Standard reicht
          </Button>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => handleAnswer(true)}
            sx={{ borderRadius: 3, py: 1.5, justifyContent: 'flex-start', px: 3 }}
          >
            <StepIcon className="w-5 h-5 mr-3" />
            Ja, bitte berücksichtigen
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
