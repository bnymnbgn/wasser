"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Baby,
  Activity,
  HeartPulse,
  Droplet,
  Coffee,
  Shield,
  User,
  Ruler,
  Scale,
  Heart,
  Info,
  Sparkles,
  SkipForward,
  ArrowLeft,
  Check,
} from "lucide-react";
import clsx from "clsx";
import type { ProfileType } from "@/src/domain/types";
import { useRouter } from "next/navigation";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import { calculateGoals } from "@/src/lib/userGoals";
import TextField from "@mui/material/TextField";

interface WizardStep {
  id: string;
  question: string;
  description?: string;
  icon: React.ElementType;
}

const PROFILE_META: Record<
  ProfileType,
  { label: string; subtitle: string; chips: string[]; accent: string; icon: React.ElementType }
> = {
  baby: {
    label: "Baby",
    subtitle: "Sehr niedrige Mineralisation, natrium- & nitratarm",
    chips: ["Natrium/Nitrat streng niedrig", "Nur nach Empfehlung", "Sanfter Geschmack"],
    accent: "text-pink-400",
    icon: Baby,
  },
  blood_pressure: {
    label: "Blutdruck & Herz",
    subtitle: "Natriumärmer, ausgewogen",
    chips: ["Weniger Natrium", "Ausgewogene Härte", "Ruhiger Geschmack"],
    accent: "text-rose-400",
    icon: HeartPulse,
  },
  kidney: {
    label: "Nieren",
    subtitle: "Natrium- & kaliumarm, geringe Mineralisation",
    chips: ["Sehr wenig Na/K", "Leichte Mineralien", "Eng mit Arzt abklären"],
    accent: "text-teal-400",
    icon: Shield,
  },
  coffee: {
    label: "Barista",
    subtitle: "Weiches Wasser für klare Aromen",
    chips: ["Weich & neutral", "Höhere Extraktion", "Feiner Geschmack"],
    accent: "text-amber-400",
    icon: Coffee,
  },
  sport: {
    label: "Sport",
    subtitle: "Mehr Magnesium/Natrium für Regeneration",
    chips: ["Mehr Mg/Na", "Schneller Auffüllen", "Frischer Geschmack"],
    accent: "text-ocean-accent",
    icon: Activity,
  },
  standard: {
    label: "Standard",
    subtitle: "Ausgewogen für den Alltag",
    chips: ["Balance", "Kein Spezialfokus", "Alltagstauglich"],
    accent: "text-ocean-info",
    icon: Droplet,
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
    id: "blood_pressure",
    question: "Musst du auf deinen Blutdruck achten?",
    description: "Bei Bluthochdruck wird oft eine natriumarme Ernährung empfohlen.",
    icon: HeartPulse,
  },
  {
    id: "kidney",
    question: "Brauchst du natrium- und kaliumarmes Wasser (Nieren)?",
    description: "Nur nach ärztlicher Empfehlung: sehr niedrige Mineralisation, Na/K niedrig.",
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
    description: "Aktive Menschen profitieren von mehr Magnesium und Natrium zur Regeneration.",
    icon: Activity,
  },
];

type Gender = "male" | "female" | "other";
type Activity = "sedentary" | "moderate" | "active" | "very_active";

export function ProfileWizard() {
  const router = useRouter();
  const { saveUserProfile } = useDatabaseContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 = Intro
  const [recommendedProfile, setRecommendedProfile] = useState<ProfileType | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  // Body data
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<Activity>("moderate");
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
  }, [activity, effectiveMetrics.ageNum, effectiveMetrics.heightNum, effectiveMetrics.weightNum, gender, recommendedProfile]);

  // Clear error hint once all values are valid again
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

    const newAnswers = { ...answers, [currentStep.id]: answer };
    setAnswers(newAnswers);

    // Priority: Baby > Blood Pressure > Kidney > Coffee > Sport > Standard
    if (currentStep.id === "baby" && answer) {
      finishWizard("baby");
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
      if (newAnswers["coffee"]) {
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
    setCurrentStepIndex(STEPS.length); // Show result
  };

  const applyProfile = async () => {
    if (!recommendedProfile) return;
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
      // Use sensible defaults when body data is not required
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

  if (recommendedProfile) {
    const meta = PROFILE_META[recommendedProfile];
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500 pb-24">
        <div className="relative">
          <div className="absolute inset-0 bg-ocean-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-ocean-surface-elevated border border-ocean-border p-8 rounded-full shadow-2xl">
            <meta.icon className={clsx("w-16 h-16", meta.accent)} />
          </div>
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-3xl font-bold text-ocean-primary">Dein ideales Profil</h2>
          <p className="text-xl font-medium text-ocean-secondary">{meta.label}</p>
          <p className="text-ocean-tertiary leading-relaxed">{meta.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {meta.chips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-ocean-border bg-ocean-surface text-sm text-ocean-primary"
            >
              <Check className="w-4 h-4 text-ocean-primary" />
              {chip}
            </span>
          ))}
        </div>

        {previewGoals && (
          <div className="rounded-2xl border border-ocean-border bg-ocean-surface px-4 py-3 text-sm text-ocean-secondary shadow-inner">
            <p className="font-semibold text-ocean-primary mb-1">Tagesziel (geschätzt)</p>
            <div className="flex flex-wrap gap-3">
              <Chip label={`Wasser: ≈ ${Math.round(previewGoals.dailyWaterGoal)} ml`} />
              <Chip label={`Calcium: ${Math.round(previewGoals.dailyCalciumGoal)} mg`} />
              <Chip label={`Magnesium: ${Math.round(previewGoals.dailyMagnesiumGoal)} mg`} />
            </div>
          </div>
        )}

        {/* Körperdaten */}
        {needsBodyData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
            <LabelInput label="Gewicht" unit="kg" value={weight} onChange={setWeight} icon={Scale} />
            <LabelInput label="Größe" unit="cm" value={height} onChange={setHeight} icon={Ruler} />
            <LabelInput label="Alter" unit="Jahre" value={age} onChange={setAge} icon={Heart} />
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <SelectChip label="Geschlecht" options={["male", "female", "other"]} value={gender} onChange={setGender} />
              <div className="space-y-2">
                <SelectChip
                  label="Aktivität"
                  labelExtra={
                    <button
                      type="button"
                      onClick={() => setShowActivityInfo((v) => !v)}
                      className="ml-2 inline-flex items-center justify-center rounded-full border border-ocean-border/70 text-ocean-primary hover:border-ocean-primary/80 transition px-2 py-[2px]"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  }
                  options={[
                    { value: "sedentary", label: "Sitzend" },
                    { value: "moderate", label: "Moderat" },
                    { value: "active", label: "Aktiv" },
                    { value: "very_active", label: "Sehr aktiv" },
                  ]}
                  value={activity}
                  onChange={setActivity}
                />
                {showActivityInfo && (
                  <div className="flex items-start gap-2 rounded-xl border border-ocean-border bg-ocean-surface px-3 py-2">
                    <Info className="w-4 h-4 mt-[2px] text-ocean-primary flex-shrink-0" />
                    <div className="space-y-2 text-[11px] text-ocean-secondary">
                      <p className="leading-snug">Aktivität kalibriert dein Tagesziel.</p>
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <span className="font-semibold text-ocean-primary">Sitzend</span>
                          <span className="text-ocean-secondary/80">Schreibtisch, kaum Bewegung</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-semibold text-ocean-primary">Moderat</span>
                          <span className="text-ocean-secondary/80">1–2x Sport/Woche</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-semibold text-ocean-primary">Aktiv</span>
                          <span className="text-ocean-secondary/80">fast täglich</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-semibold text-ocean-primary">Sehr aktiv</span>
                          <span className="text-ocean-secondary/80">intensiv / Handwerk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ocean-secondary max-w-lg">
            Für Baby- und Kaffee-Profil sind Körperdaten optional – wir verwenden sichere Standardwerte.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={applyProfile}
            disabled={
              needsBodyData &&
              (!weight ||
                !height ||
                !age ||
                Number(weight) <= 0 ||
                Number(height) <= 0 ||
                Number(age) <= 0)
            }
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-ocean-primary text-white rounded-full font-semibold shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Profil übernehmen</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={resetWizard}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-ocean-border bg-ocean-surface text-ocean-secondary font-semibold hover:bg-ocean-surface-elevated transition-all"
          >
            Profil ändern
          </button>
        </div>
        {showErrors && needsBodyData && (
          <p className="text-sm text-ocean-error mt-2">
            Bitte gültige Werte &gt; 0 für Gewicht, Größe und Alter eingeben.
          </p>
        )}
      </div>
    );
  }

  if (currentStepIndex === -1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-3">
        <div className="space-y-3 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ocean-primary via-white to-ocean-accent">
            Wähle dein Profil.
          </h1>
          <p className="text-lg text-ocean-secondary leading-relaxed">
            Zwei Schritte: Profil wählen, optional Körperdaten ergänzen. Fertig.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl">
          {(["baby", "blood_pressure", "kidney", "coffee", "sport", "standard"] as ProfileType[]).map((p) => {
            const meta = PROFILE_META[p];
            return (
              <ProfileCard
                key={p}
                title={meta.label}
                subtitle={meta.subtitle}
                icon={meta.icon}
                accent={meta.accent}
                chips={meta.chips.slice(0, 2)}
                onClick={() => finishWizard(p)}
              />
            );
          })}
        </div>
        <p className="text-xs text-ocean-tertiary flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ocean-primary" />
          Du kannst später jederzeit in den Einstellungen wechseln.
        </p>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="max-w-3xl mx-auto w-full min-h-[60vh] flex flex-col justify-center px-3 pb-16">
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-mono text-ocean-tertiary uppercase tracking-widest">
            Schritt {currentStepIndex + 1} / {STEPS.length}
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className={clsx(
                "inline-flex items-center gap-2 px-3 py-2 text-xs rounded-full border transition-all",
                currentStepIndex === 0
                  ? "border-ocean-border text-ocean-tertiary cursor-not-allowed"
                  : "border-ocean-border text-ocean-secondary hover:border-ocean-primary hover:text-ocean-primary"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-full border border-dashed border-ocean-border text-ocean-secondary hover:border-ocean-primary/50 hover:text-ocean-primary transition-all"
            >
              <SkipForward className="w-4 h-4" />
              Überspringen
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={clsx(
                "px-3 py-2 rounded-full text-xs font-semibold border transition-all",
                idx === currentStepIndex
                  ? "bg-ocean-primary text-white border-ocean-primary shadow-md"
                  : idx < currentStepIndex
                  ? "bg-ocean-surface text-ocean-primary border-ocean-border"
                  : "bg-ocean-surface-elevated text-ocean-secondary border-ocean-border"
              )}
            >
              {step.question.replace(/\?.*$/, "")}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="flex justify-center mb-2">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-ocean-surface via-ocean-surface-elevated to-ocean-surface border border-ocean-border shadow-2xl">
              <currentStep.icon className="w-12 h-12 text-ocean-primary" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-ocean-primary">{currentStep.question}</h2>
            <p className="text-ocean-secondary text-lg">{currentStep.description}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-surface-elevated border border-ocean-border text-xs text-ocean-tertiary">
              <Sparkles className="w-4 h-4 text-ocean-primary" />
              Wir empfehlen dir das beste Profil auf Basis deiner Antworten.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            <ChoiceCard
              title="Nein, Standard reicht"
              subtitle="Kein spezieller Bedarf. Wir bleiben ausgeglichen."
              icon={Droplet}
              onClick={() => handleAnswer(false)}
              tone="neutral"
            />
            <ChoiceCard
              title="Ja, bitte berücksichtigen"
              subtitle="Empfohlen, wenn das Thema für dich wichtig ist."
              icon={currentStep.icon}
              onClick={() => handleAnswer(true)}
              tone="accent"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ChoiceCard({
  title,
  subtitle,
  icon: Icon,
  onClick,
  tone = "neutral",
}: {
  title: string;
  subtitle: string;
  icon: any;
  onClick: () => void;
  tone?: "neutral" | "accent";
}) {
  const accentClasses =
    tone === "accent"
      ? "border-ocean-primary/40 bg-ocean-primary/10 hover:bg-ocean-primary/15 text-ocean-primary shadow-[0_0_18px_rgba(14,165,233,0.12)]"
      : "border-ocean-border bg-ocean-surface hover:bg-ocean-surface-elevated text-ocean-secondary";

  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full rounded-2xl border p-5 text-left transition-all hover:-translate-y-[2px] hover:shadow-xl active:scale-[0.99]",
        accentClasses
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-ocean-surface-elevated flex items-center justify-center border border-ocean-border">
          <Icon className="w-5 h-5 text-ocean-primary" />
        </div>
        <div>
          <p className="text-base font-semibold">{title}</p>
          <p className="text-sm text-ocean-secondary">{subtitle}</p>
        </div>
      </div>
      <div className="text-xs text-ocean-tertiary">Klicke, um fortzufahren</div>
    </button>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-surface-elevated text-ocean-primary border border-ocean-border text-xs font-semibold">
      {label}
    </span>
  );
}

function ProfileCard({
  title,
  subtitle,
  chips,
  icon: Icon,
  accent,
  onClick,
}: {
  title: string;
  subtitle: string;
  chips: string[];
  icon: any;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-ocean-border bg-ocean-surface p-4 text-left transition-all hover:border-ocean-primary/40 hover:-translate-y-[2px] hover:shadow-xl active:scale-[0.99]"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="h-11 w-11 rounded-xl bg-ocean-surface-elevated flex items-center justify-center border border-ocean-border">
          <Icon className={clsx("w-5 h-5", accent)} />
        </div>
        <div>
          <p className="text-base font-semibold text-ocean-primary">{title}</p>
          <p className="text-sm text-ocean-secondary">{subtitle}</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {chips.map((chip) => (
          <span key={chip} className="text-[11px] px-2 py-1 rounded-full bg-ocean-surface-elevated text-ocean-secondary border border-ocean-border">
            {chip}
          </span>
        ))}
      </div>
    </button>
  );
}

function LabelInput({
  label,
  unit,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  icon: any;
}) {
  const num = Number(value);
  const invalid = value !== "" && (!Number.isFinite(num) || num <= 0);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-ocean-secondary px-1">
        <Icon className="w-4 h-4 text-ocean-primary" />
        <span>{label}</span>
        <span className="text-[11px] text-ocean-tertiary">({unit})</span>
        {invalid && <span className="text-[10px] text-ocean-error ml-auto">&gt; 0</span>}
      </div>
      <TextField
        variant="filled"
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder={label}
        error={invalid}
        InputProps={{
          sx: {
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 2,
            "&:before, &:after": { borderBottom: "none !important" },
            "& input": { color: "#e2e8f0" },
          },
        }}
        sx={{
          "& .MuiFilledInput-root": {
            borderRadius: 2,
          },
          "& .MuiInputLabel-root": {
            color: "#cbd5e1",
          },
        }}
      />
    </div>
  );
}

function SelectChip({ label, options, value, onChange, labelExtra }: any) {
  const opts = options.map((o: any) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ocean-secondary">{label}</p>
        {labelExtra}
      </div>
      <div className="flex flex-wrap gap-2">
        {opts.map((opt: any) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              "px-3 py-1 rounded-full border text-xs font-semibold",
              value === opt.value
                ? "bg-ocean-primary text-white border-ocean-primary"
                : "bg-ocean-surface text-ocean-secondary border-ocean-border"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
