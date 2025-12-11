"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ScanLine,
  RotateCcw,
  Check,
  Lock,
  BookOpen,
  FlaskConical,
  Users,
  Target,
  HelpCircle,
  Scale,
  ArrowUp,
} from "lucide-react";

// --- IMPORTS DEINER KOMPONENTEN ---
import { ProfileOnboardingTabs } from "@/src/components/ProfileOnboardingTabs";
import { hapticLight } from "@/lib/capacitor";
import { PersonasCarousel } from "@/src/components/onboarding/PersonasCarousel";

// --- TYPES & DATA ---
type Chapter = {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "done" | "in_progress" | "locked";
  progress?: string;
  badge?: string;
};
type LearnCard = {
  id: string;
  title: string;
  emoji: string;
  body: string;
  detail: string[] | string;
};
type Faq = { q: string; a: string };
type QuizQ = {
  id: string;
  question: string;
  options: { id: string; label: string; profile: string }[];
};
type ProfileMetric = { key: string; label: string; unit: string };
type ProfileType = "standard" | "baby" | "sport" | "blood_pressure" | "coffee" | "kidney";

const CHAPTERS: Chapter[] = [
  { id: "basics", label: "Grundlagen", icon: BookOpen, status: "done", progress: "✓" },
  {
    id: "minerals",
    label: "Mineralstoffe",
    icon: FlaskConical,
    status: "in_progress",
    progress: "3/7",
  },
  {
    id: "profiles",
    label: "Profile",
    icon: Users,
    status: "in_progress",
    progress: "Tabs",
  },
  { id: "quiz", label: "Quiz", icon: Target, status: "in_progress", badge: "Neu" },
  { id: "faq", label: "FAQ", icon: HelpCircle, status: "in_progress" },
  { id: "compare", label: "Vergleich", icon: Scale, status: "in_progress" },
];

const LEARN_CARDS: LearnCard[] = [
  {
    id: "calcium",
    title: "Calcium",
    emoji: "🦴",
    body: "Gut für Knochen & Zähne",
    detail: [
      "Ideal: 50–150 mg/L. Unter 30 mg/L schmeckt oft flach, über 180 mg/L kann kalkig wirken.",
      "Baby/Blutdruck: eher niedrig halten (um 50–70 mg/L). Sport: gerne höher für Regeneration.",
      "Kaffee: moderat (60–100 mg/L), sonst Überextraktion/Bitternoten.",
    ],
  },
  {
    id: "magnesium",
    title: "Magnesium",
    emoji: "💪",
    body: "Muskelregeneration & Stoffwechsel",
    detail: [
      "Ideal: 10–50 mg/L. Unter 5 mg/L wenig Effekt, über 70 mg/L kann bitter schmecken.",
      "Sport: eher 30–50 mg/L für Muskeln/Nerven. Baby/Blutdruck/Kidney: moderat (10–25 mg/L).",
      "Kaffee: moderat (10–30 mg/L), sonst Bitterkeit.",
    ],
  },
  {
    id: "natrium",
    title: "Natrium",
    emoji: "🫀",
    body: "Wichtig für Blutdruck & Hydration",
    detail: [
      "Baby/Blutdruck/Kidney: sehr niedrig (<10 mg/L). Standard: 10–20 mg/L. Sport: bis ~40 mg/L möglich.",
      "Geschmack: >60 mg/L schmeckt salzig/geschwer.",
      "Hohe Na-Werte + hohes TDS: lieber meiden bei empfindlichen Profilen.",
    ],
  },
  {
    id: "nitrat",
    title: "Nitrat",
    emoji: "🌱",
    body: "Hinweis auf Verunreinigung",
    detail: [
      "Babys/Schwangere: <10 mg/L. 10–25 mg/L: kritisch, >25 mg/L eher meiden.",
      "Hohe Werte deuten auf landwirtschaftliche Einträge oder alte Leitungen hin.",
    ],
  },
  {
    id: "ph",
    title: "pH-Wert",
    emoji: "⚖️",
    body: "Einfluss auf Geschmack & Kaffee",
    detail: [
      "Neutral bis leicht basisch (7.0–7.5) schmeckt weich.",
      "Für Kaffee/Tea: oft 6.8–7.4 ideal, in Kombination mit moderater Härte.",
    ],
  },
];

const FAQS: Faq[] = [
  {
    q: "Was bedeutet TDS?",
    a: "Total Dissolved Solids: Summe gelöster Stoffe. Grober Hinweis auf Mineralgehalt, aber nicht allein aussagekräftig.",
  },
  {
    q: "Welches Wasser für Babys?",
    a: 'Sehr niedrige Werte bei Natrium/Nitrat, geringe Mineralisation. Achte auf "für Säuglingsnahrung geeignet".',
  },
  {
    q: "Warum ist Nitrat wichtig?",
    a: "Hohe Nitratwerte können auf landwirtschaftliche Einträge hindeuten und sind für Säuglinge kritisch.",
  },
  {
    q: "Ist Leitungswasser gut?",
    a: "Oft ja, aber regional unterschiedlich. Ein Scan der lokalen Analyse oder Etikett gibt Klarheit.",
  },
];

const QUIZ: QuizQ[] = [
  {
    id: "focus",
    question: "Was ist dir beim Wasser wichtiger?",
    options: [
      { id: "baby", label: "👶 Sicherheit für Baby", profile: "baby" },
      { id: "sport", label: "🏃 Regeneration nach Sport", profile: "sport" },
      { id: "bp", label: "❤️ Schonend für Blutdruck", profile: "blood_pressure" },
      { id: "coffee", label: "☕ Klarer Geschmack für Kaffee", profile: "coffee" },
    ],
  },
  {
    id: "taste",
    question: "Geschmack & Härte?",
    options: [
      { id: "soft", label: "💧 Weich / neutral", profile: "coffee" },
      { id: "balanced", label: "⚖️ Ausbalanciert", profile: "standard" },
      { id: "minerally", label: "⛰️ Mineralisch", profile: "sport" },
    ],
  },
  {
    id: "health",
    question: "Gesundheitliche Priorität?",
    options: [
      { id: "kidney", label: "🩺 Niere schonen", profile: "kidney" },
      { id: "heart", label: "❤️ Herz / Blutdruck", profile: "blood_pressure" },
      { id: "none", label: "✨ Keine spezielle", profile: "standard" },
    ],
  },
];

const PROFILE_METRICS: ProfileMetric[] = [
  { key: "sodium", label: "Natrium", unit: "mg/L" },
  { key: "calcium", label: "Calcium", unit: "mg/L" },
  { key: "magnesium", label: "Magnesium", unit: "mg/L" },
];

const PROFILE_VALUES: Record<ProfileType, Record<string, number>> = {
  baby: { sodium: 5, calcium: 40, magnesium: 10 },
  sport: { sodium: 40, calcium: 120, magnesium: 50 },
  standard: { sodium: 15, calcium: 80, magnesium: 20 },
  blood_pressure: { sodium: 10, calcium: 70, magnesium: 20 },
  coffee: { sodium: 8, calcium: 50, magnesium: 15 },
  kidney: { sodium: 6, calcium: 40, magnesium: 10 },
};

const PROFILE_META: Record<
  ProfileType,
  { label: string; color: string; gradient: string }
> = {
  baby: { label: "Baby", color: "bg-pink-500", gradient: "from-pink-400 to-pink-300" },
  blood_pressure: {
    label: "Blutdruck",
    color: "bg-rose-500",
    gradient: "from-rose-400 to-rose-300",
  },
  kidney: { label: "Niere", color: "bg-teal-500", gradient: "from-teal-400 to-teal-300" },
  coffee: {
    label: "Barista",
    color: "bg-amber-500",
    gradient: "from-amber-400 to-amber-300",
  },
  sport: {
    label: "Sport",
    color: "bg-emerald-500",
    gradient: "from-emerald-400 to-emerald-300",
  },
  standard: {
    label: "Standard",
    color: "bg-ocean-primary",
    gradient: "from-ocean-primary to-ocean-accent",
  },
};

const PRIMARY_GRADIENT = "bg-gradient-to-r from-ocean-primary to-ocean-accent";

// --- SUB-COMPONENTS ---

const SimpleConfetti = () => {
  const particles = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={clsx(
            "absolute w-2 h-2 rounded-full",
            i % 3 === 0
              ? "bg-ocean-primary"
              : i % 3 === 1
              ? "bg-ocean-accent"
              : "bg-white"
          )}
          initial={{
            x: "50%",
            y: "50%",
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0,
            scale: Math.random() * 1.5 + 0.5,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

function FlipCard({
  card,
  isActive,
  onNext,
  onPrev,
  onFlipStateChange,
}: {
  card: LearnCard;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  onFlipStateChange: (flipped: boolean) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!isActive) setIsFlipped(false);
  }, [isActive]);

  const handleFlip = () => {
    const next = !isFlipped;
    setIsFlipped(next);
    onFlipStateChange(next);
    hapticLight();
  };

  return (
    <div className="relative w-full h-[340px] perspective-1000 group">
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50) onNext();
          if (info.offset.x > 50) onPrev();
        }}
      >
        {/* FRONT */}
        <div
          onClick={handleFlip}
          className="absolute inset-0 backface-hidden rounded-3xl bg-ocean-surface border border-ocean-border shadow-xl p-8 flex flex-col items-center justify-center text-center gap-4 cursor-pointer hover:border-ocean-primary/30 transition-colors"
        >
          <div className="text-7xl animate-bounce-slow drop-shadow-sm">{card.emoji}</div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ocean-tertiary mb-2">
              Thema
            </p>
            <h3 className="text-2xl font-bold text-ocean-primary">{card.title}</h3>
            <p className="text-ocean-secondary mt-2 text-base leading-relaxed">
              {card.body}
            </p>
          </div>
          <p className="mt-auto text-xs font-bold uppercase tracking-wider text-ocean-primary/80 bg-ocean-primary/5 px-3 py-1 rounded-full">
            Tippe für Details • Swipe für Weiter
          </p>
        </div>

        {/* BACK */}
        <div
          onClick={handleFlip}
          className="absolute inset-0 backface-hidden rounded-3xl bg-ocean-surface-elevated border border-ocean-border shadow-xl p-8 rotate-y-180 flex flex-col cursor-pointer"
        >
          <h3 className="text-lg font-bold text-ocean-primary mb-4 flex items-center gap-2">
            <span className="text-xl">{card.emoji}</span> Experten-Wissen
          </h3>
          <div className="space-y-3 text-sm text-ocean-secondary flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {Array.isArray(card.detail) ? (
              card.detail.map((d, i) => (
                <div key={i} className="leading-snug flex items-start gap-2">
                  <span className="text-ocean-primary mt-1.5 min-w-[6px] h-[6px] rounded-full bg-ocean-primary" />
                  <span>{d}</span>
                </div>
              ))
            ) : (
              <p>{card.detail}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="mt-4 w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-ocean-primary to-ocean-accent shadow-[0_10px_25px_rgba(14,165,233,0.3)] active:scale-95 transition-all"
          >
            Nächste Karte ➜
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MetricBar({
  left,
  right,
  metric,
  max,
}: {
  left: ProfileType;
  right: ProfileType;
  metric: ProfileMetric;
  max: number;
}) {
  const leftVal = PROFILE_VALUES[left][metric.key] ?? 0;
  const rightVal = PROFILE_VALUES[right][metric.key] ?? 0;

  return (
    <div className="bg-ocean-surface border border-ocean-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-end mb-3">
        <span className="text-sm font-bold text-ocean-primary">{metric.label}</span>
        <span className="text-[10px] bg-ocean-surface-elevated px-2 py-0.5 rounded text-ocean-tertiary">
          {metric.unit}
        </span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1 text-ocean-secondary">
            <span className="font-semibold">{PROFILE_META[left].label}</span>
            <span className="text-ocean-primary font-mono">{leftVal}</span>
          </div>
          <div className="h-2 w-full bg-ocean-surface-elevated rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (leftVal / max) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={clsx(
                "h-full rounded-full bg-gradient-to-r",
                PROFILE_META[left].gradient
              )}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1 text-ocean-secondary">
            <span className="font-semibold">{PROFILE_META[right].label}</span>
            <span className="text-ocean-primary font-mono">{rightVal}</span>
          </div>
          <div className="h-2 w-full bg-ocean-surface-elevated rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (rightVal / max) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={clsx(
                "h-full rounded-full bg-gradient-to-r",
                PROFILE_META[right].gradient
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function OnboardingPage() {
  const [cardIndex, setCardIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<ProfileType | null>(null);
  const [seenCards, setSeenCards] = useState<Set<string>>(() => {
    const firstId = LEARN_CARDS[0]?.id;
    return new Set(firstId ? [firstId] : []);
  });
  const [cardFlipped, setCardFlipped] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const faqRef = useRef<HTMLElement | null>(null);
  const compareRef = useRef<HTMLElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const quizRef = useRef<HTMLElement | null>(null);

  const [compareLeft, setCompareLeft] = useState<ProfileType>("baby");
  const [compareRight, setCompareRight] = useState<ProfileType>("sport");

  const activeCard = useMemo(() => LEARN_CARDS[cardIndex], [cardIndex]);
  const activeQuiz = QUIZ[quizIndex];
  const progressQuiz = activeQuiz ? Math.round(((quizIndex + 1) / QUIZ.length) * 100) : 0;
  const cardsProgress = useMemo(
    () => Math.min(1, seenCards.size / LEARN_CARDS.length),
    [seenCards.size]
  );
  const quizProgressValue = quizResult ? 1 : quizIndex / QUIZ.length;
  const overallProgress = Math.round(((cardsProgress + quizProgressValue) / 2) * 100);

  const badges = [
    { id: "cards", label: "Grundlagen", unlocked: cardsProgress >= 1 },
    { id: "quiz", label: "Profil-Check", unlocked: Boolean(quizResult) },
  ];

  const goNextCard = () => {
    hapticLight();
    setCardIndex((i) => (i + 1) % LEARN_CARDS.length);
  };
  const goPrevCard = () => {
    hapticLight();
    setCardIndex((i) => (i - 1 + LEARN_CARDS.length) % LEARN_CARDS.length);
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedCards = localStorage.getItem("academy-seen-cards");
    if (storedCards) {
      try {
        const parsed = JSON.parse(storedCards) as string[];
        setSeenCards(new Set(parsed));
      } catch {}
    }
    const storedQuiz = localStorage.getItem("academy-quiz");
    if (storedQuiz) {
      try {
        const parsed = JSON.parse(storedQuiz) as {
          result?: ProfileType;
          answers?: Record<string, string>;
        };
        if (parsed.answers) setQuizAnswers(parsed.answers);
        if (parsed.result) {
          setQuizResult(parsed.result);
          setQuizIndex(QUIZ.length);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const id = LEARN_CARDS[cardIndex]?.id;
    if (!id) return;
    setCardFlipped(false);
    setSeenCards((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      if (typeof window !== "undefined")
        localStorage.setItem("academy-seen-cards", JSON.stringify(Array.from(next)));
      return next;
    });
  }, [cardIndex]);

  const handleQuizSelect = (opt: { id: string; profile: ProfileType }) => {
    hapticLight();
    if (!activeQuiz) return;
    setQuizAnswers((prev) => ({ ...prev, [activeQuiz.id]: opt.profile }));
    const nextIdx = quizIndex + 1;
    if (nextIdx < QUIZ.length) {
      setQuizIndex(nextIdx);
    } else {
      const selectedProfiles = Object.values({
        ...quizAnswers,
        [activeQuiz.id]: opt.profile,
      });
      const priority: ProfileType[] = [
        "baby",
        "blood_pressure",
        "kidney",
        "coffee",
        "sport",
        "standard",
      ];
      const pick = priority.find((p) => selectedProfiles.includes(p)) ?? "standard";
      setQuizResult(pick);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "academy-quiz",
          JSON.stringify({
            result: pick,
            answers: { ...quizAnswers, [activeQuiz.id]: opt.profile },
          })
        );
      }
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizIndex(0);
    setQuizResult(null);
    if (typeof window !== "undefined") localStorage.removeItem("academy-quiz");
  };

  return (
    <main className="min-h-screen bg-ocean-background text-ocean-primary selection:bg-ocean-primary/20">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 4px; }
      `}</style>

      {/* STICKY NAV & PROGRESS BAR */}
      <div className="sticky top-0 z-40 bg-ocean-surface/80 backdrop-blur-xl border-b border-ocean-border transition-all">
        <nav className="px-6 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              onClick={hapticLight}
              className="p-2 -ml-2 rounded-full hover:bg-ocean-surface-elevated transition"
            >
              <ArrowLeft className="w-5 h-5 text-ocean-secondary" />
            </Link>
            <div className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border border-ocean-border bg-ocean-surface-elevated text-ocean-primary">
              Academy
            </div>
            <Link
              href="/scan"
              onClick={hapticLight}
              className="p-2 -mr-2 text-ocean-primary hover:bg-ocean-surface-elevated rounded-full transition"
            >
              <ScanLine className="w-5 h-5" />
            </Link>
          </div>
        </nav>
        {/* Reading Progress Indicator */}
        <motion.div
          style={{ scaleX }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-ocean-primary origin-left"
        />
      </div>

      {/* CONTENT WRAPPER WITH OVERFLOW HANDLING */}
      <div className="overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-6 space-y-12 py-8">
          <header className="space-y-6">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Wissen, was <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-primary to-ocean-accent">
                wirklich drin ist.
              </span>
            </h1>
            <div className="ocean-panel">
              <PersonasCarousel />
            </div>
          </header>

          {/* 1. CHAPTERS */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Deine Lernreise</h2>
              <span className="text-xs text-ocean-tertiary font-medium">
                {Math.round(overallProgress)}% Gesamt
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CHAPTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    hapticLight();
                    if (c.id === "basics") scrollToTop();
                    if (c.id === "profiles") scrollToSection(tabsRef);
                    if (c.id === "quiz") scrollToSection(quizRef);
                    if (c.id === "faq") scrollToSection(faqRef);
                    if (c.id === "compare") scrollToSection(compareRef);
                  }}
                  className={clsx(
                    "p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col gap-3 min-h-[100px]",
                    c.status === "done"
                      ? `${PRIMARY_GRADIENT} text-white border-ocean-primary shadow-[0_10px_30px_rgba(14,165,233,0.35)]`
                      : "bg-ocean-surface border-ocean-border text-ocean-secondary hover:border-ocean-primary/40"
                  )}
                >
                  <div className="flex justify-between items-start w-full">
                    <c.icon
                      size={20}
                      className={
                        c.status === "done" ? "text-white" : "text-ocean-tertiary"
                      }
                    />
                    {c.status === "done" ? (
                      <Check size={14} />
                    ) : (
                      c.status === "locked" && <Lock size={14} />
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-bold leading-tight">
                      {c.label}
                    </span>
                    {c.badge && (
                      <span className="inline-block mt-1 text-[9px] bg-white text-ocean-primary px-1.5 py-0.5 rounded-full font-bold">
                        {c.badge}
                      </span>
                    )}
                    {c.status === "in_progress" && (
                      <span className="text-[10px] opacity-70 block mt-1">
                        {c.progress}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 2. LEARNING CARDS */}
          <section className="relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Wissen to go</h2>
              <div className="flex gap-1.5">
                {LEARN_CARDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCardIndex(i)}
                    className={clsx(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === cardIndex ? "w-6 bg-ocean-primary" : "w-1.5 bg-ocean-border"
                    )}
                  />
                ))}
              </div>
            </div>
            {activeCard && (
              <FlipCard
                card={activeCard}
                isActive
                onNext={goNextCard}
                onPrev={goPrevCard}
                onFlipStateChange={setCardFlipped}
              />
            )}
          </section>

          {/* 3. TABS */}
          <section ref={tabsRef} className="scroll-mt-24">
            <ProfileOnboardingTabs />
          </section>

          {/* 4. PROGRESS */}
          <section className="ocean-panel p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Erfolge</h2>
              <span className="text-xs font-bold bg-ocean-primary/10 text-ocean-primary px-2 py-1 rounded-lg">
                Level {overallProgress === 100 ? "Max" : "1"}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-ocean-surface-elevated mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ocean-primary to-ocean-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {badges.map((b) => (
                <span
                  key={b.id}
                  className={clsx(
                    "px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-colors",
                    b.unlocked
                      ? "bg-ocean-primary/10 text-ocean-primary border-ocean-primary/40"
                      : "bg-ocean-surface text-ocean-secondary border-ocean-border"
                  )}
                >
                  {b.unlocked ? <Check size={12} strokeWidth={3} /> : <Lock size={12} />}{" "}
                  {b.label}
                </span>
              ))}
            </div>
          </section>

          {/* 5. QUIZ */}
          <section
            ref={quizRef}
            className="scroll-mt-24 bg-gradient-to-br from-ocean-primary to-ocean-accent rounded-3xl p-6 text-white shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 opacity-90">
                <Target className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Profil Finder
                </span>
              </div>
              {quizResult ? (
                <button
                  onClick={resetQuiz}
                  className="text-xs font-medium text-white/80 hover:text-white underline underline-offset-4"
                >
                  Neustart
                </button>
              ) : quizIndex > 0 ? (
                <button
                  onClick={resetQuiz}
                  className="text-xs font-medium text-white/80 hover:text-white underline underline-offset-4"
                >
                  Reset
                </button>
              ) : null}
            </div>

            {!quizResult && activeQuiz ? (
              <>
                <div className="flex justify-between text-xs font-medium text-white/80 mb-2">
                  <span>
                    Frage {quizIndex + 1} von {QUIZ.length}
                  </span>
                  <span>{progressQuiz}%</span>
                </div>
                <h3 className="text-2xl font-bold mb-6 leading-tight">
                  {activeQuiz.question}
                </h3>
                <div className="space-y-3">
                  {activeQuiz.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleQuizSelect({ id: opt.id, profile: opt.profile as ProfileType })}
                      className="w-full text-left p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-sm transition-all active:scale-[0.98] font-medium flex justify-between items-center group"
                    >
                      {opt.label}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                        ➜
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : quizResult ? (
              <div className="text-center py-8 opacity-60">
                <Check className="w-10 h-10 mx-auto mb-2" />
                <p>Quiz abgeschlossen</p>
                <button
                  onClick={() => setQuizResult(null)}
                  className="text-sm underline mt-2"
                >
                  Ergebnis erneut öffnen
                </button>
              </div>
            ) : null}
          </section>

          {/* 6. COMPARISON */}
          <section ref={compareRef} className="scroll-mt-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Profile vergleichen</h2>
              <RotateCcw
                className="w-4 h-4 text-ocean-tertiary cursor-pointer hover:text-ocean-primary"
                onClick={() => {
                  setCompareLeft("baby");
                  setCompareRight("sport");
                }}
              />
            </div>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-ocean-tertiary uppercase ml-1 mb-1.5 block tracking-wider">
                  Links
                </label>
                <div className="relative">
                  <select
                    value={compareLeft}
                    onChange={(e) => setCompareLeft(e.target.value as ProfileType)}
                    className="w-full p-3 rounded-xl bg-ocean-surface border border-ocean-border font-bold text-sm focus:ring-2 focus:ring-ocean-primary outline-none appearance-none cursor-pointer text-ocean-primary"
                  >
                    {Object.entries(PROFILE_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-ocean-tertiary pointer-events-none" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-ocean-tertiary uppercase ml-1 mb-1.5 block tracking-wider">
                  Rechts
                </label>
                <div className="relative">
                  <select
                    value={compareRight}
                    onChange={(e) => setCompareRight(e.target.value as ProfileType)}
                    className="w-full p-3 rounded-xl bg-ocean-surface border border-ocean-border font-bold text-sm focus:ring-2 focus:ring-ocean-primary outline-none appearance-none cursor-pointer text-ocean-primary"
                  >
                    {Object.entries(PROFILE_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-ocean-tertiary pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PROFILE_METRICS.map((metric) => (
                <MetricBar
                  key={metric.key}
                  left={compareLeft}
                  right={compareRight}
                  metric={metric}
                  max={200}
                />
              ))}
            </div>
            <p className="text-xs text-ocean-tertiary mt-4 leading-relaxed">
              Tipp: Wähle zwei Profile, um zu sehen, wie sich die empfohlenen Grenzwerte
              für Natrium, Calcium und Magnesium unterscheiden.
            </p>
          </section>

          {/* 7. FAQ */}
          <section ref={faqRef} className="scroll-mt-24">
            <h2 className="text-lg font-bold mb-4">Häufige Fragen</h2>
            <div className="space-y-2">
              {FAQS.map((faq) => {
                const isOpen = openFaq === faq.q;
                return (
                  <div
                    key={faq.q}
                    className="bg-ocean-surface rounded-2xl border border-ocean-border overflow-hidden shadow-sm hover:border-ocean-primary/30 transition-colors"
                  >
                    <button
                      onClick={() => {
                        hapticLight();
                        setOpenFaq(isOpen ? null : faq.q);
                      }}
                      className="w-full p-4 flex justify-between items-center text-left font-semibold text-ocean-primary text-sm"
                    >
                      {faq.q}
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-ocean-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-ocean-tertiary" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-sm text-ocean-secondary leading-relaxed border-t border-ocean-border/60 mt-1">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* BOTTOM SHEET RESULT */}
      <AnimatePresence>
        {quizResult && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuizResult(null)}
            />

            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 bg-ocean-surface-elevated rounded-t-3xl border-t border-ocean-border shadow-2xl p-6 pb-10 mx-auto max-w-2xl overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setQuizResult(null);
              }}
            >
              {/* Confetti Explosion on Render */}
              <SimpleConfetti />

              <div className="w-12 h-1.5 bg-ocean-border rounded-full mx-auto mb-8 cursor-grab active:cursor-grabbing relative z-10" />

              <div className="text-center relative z-10">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-ocean-tertiary text-sm font-bold uppercase tracking-widest mb-1">
                  Dein Match
                </p>
                <h3 className="text-3xl font-extrabold text-ocean-primary mb-6">
                  {PROFILE_META[quizResult as ProfileType]?.label ?? quizResult}
                </h3>

                {/* VISUAL DNA of the Profile */}
                <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
                  {PROFILE_METRICS.map((m) => {
                    const val = PROFILE_VALUES[quizResult as ProfileType][m.key] ?? 0;
                    return (
                      <div
                        key={m.key}
                        className="bg-ocean-surface p-3 rounded-xl border border-ocean-border/50 text-center"
                      >
                        <div className="text-[10px] text-ocean-tertiary uppercase font-bold mb-1">
                          {m.label}
                        </div>
                        <div className="text-lg font-bold text-ocean-primary">{val}</div>
                        <div className="text-[9px] text-ocean-secondary">{m.unit}</div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-ocean-secondary mb-8 text-sm max-w-sm mx-auto leading-relaxed">
                  Basierend auf deinen Antworten passt dieses Profil perfekt. Wir haben
                  die Grenzwerte für {PROFILE_META[quizResult as ProfileType]?.label}{" "}
                  automatisch eingestellt.
                </p>

                <div className="flex flex-col gap-3">
                  <Link
                    href={`/dashboard?profile=${quizResult}`}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-ocean-primary to-ocean-accent text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                    onClick={() => {
                      hapticLight();
                      if (typeof window !== "undefined")
                        localStorage.setItem("wasserscan-profile", quizResult);
                    }}
                  >
                    Profil übernehmen <Check size={18} />
                  </Link>
                  <Link
                    href="/profile-setup"
                    className="text-sm font-medium text-ocean-tertiary hover:text-ocean-primary mt-2"
                  >
                    Einstellungen anpassen
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SCROLL TO TOP FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-ocean-surface-elevated border border-ocean-border shadow-lg text-ocean-primary hover:bg-ocean-surface transition-colors z-30"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}
