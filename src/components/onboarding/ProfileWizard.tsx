"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, ArrowRight, Baby, Activity, HeartPulse, Droplet, Coffee } from "lucide-react";
import type { ProfileType } from "@/src/domain/types";
import { useRouter } from "next/navigation";

interface WizardStep {
    id: string;
    question: string;
    description?: string;
    icon: React.ElementType;
}

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

export function ProfileWizard() {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 = Intro
    const [answers, setAnswers] = useState<Record<string, boolean>>({});
    const [recommendedProfile, setRecommendedProfile] = useState<ProfileType | null>(null);

    const currentStep = STEPS[currentStepIndex];

    const handleStart = () => {
        setCurrentStepIndex(0);
    };

    const handleAnswer = (answer: boolean) => {
        if (!currentStep) return;

        const newAnswers = { ...answers, [currentStep.id]: answer };
        setAnswers(newAnswers);

        // Logic: Determine if we should stop or continue
        // Priority: Baby > Blood Pressure > Coffee > Sport > Standard

        if (currentStep.id === "baby" && answer) {
            finishWizard("baby");
            return;
        }

        if (currentStep.id === "blood_pressure" && answer) {
            finishWizard("blood_pressure");
            return;
        }

        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            // End of questions
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

    const applyProfile = () => {
        localStorage.setItem("wasserscan-profile", recommendedProfile || "standard");
        router.push(`/dashboard?profile=${recommendedProfile}`);
    };

    if (recommendedProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-ocean-primary/20 blur-3xl rounded-full" />
                    <div className="relative bg-ocean-surface-elevated border border-ocean-border p-8 rounded-full shadow-2xl">
                        {recommendedProfile === "baby" && <Baby className="w-16 h-16 text-ocean-primary" />}
                        {recommendedProfile === "blood_pressure" && <HeartPulse className="w-16 h-16 text-ocean-warning" />}
                        {recommendedProfile === "coffee" && <Coffee className="w-16 h-16 text-amber-400" />}
                        {recommendedProfile === "sport" && <Activity className="w-16 h-16 text-ocean-accent" />}
                        {recommendedProfile === "standard" && <Droplet className="w-16 h-16 text-ocean-info" />}
                    </div>
                </div>

                <div className="space-y-2 max-w-md">
                    <h2 className="text-3xl font-bold text-ocean-primary">Dein ideales Profil</h2>
                    <p className="text-xl font-medium capitalize text-ocean-secondary">
                        {recommendedProfile === "blood_pressure" ? "Blutdruck & Herz" : recommendedProfile === "coffee" ? "Barista & Genuss" : recommendedProfile}
                    </p>
                    <p className="text-ocean-tertiary leading-relaxed">
                        {recommendedProfile === "baby" && "Wir achten streng auf niedrige Natrium- und Nitratwerte für die sicherste Zubereitung von Babynahrung."}
                        {recommendedProfile === "blood_pressure" && "Der Fokus liegt auf natriumarmem Wasser, um dein Herz-Kreislauf-System zu entlasten."}
                        {recommendedProfile === "coffee" && "Wir suchen nach weichem Wasser mit neutralem pH-Wert, damit dein Kaffee sein volles Aroma entfalten kann."}
                        {recommendedProfile === "sport" && "Wir suchen nach mineralstoffreichem Wasser, um deine Speicher nach dem Training wieder aufzufüllen."}
                        {recommendedProfile === "standard" && "Ein ausgewogenes Profil für den täglichen Genuss ohne spezielle Einschränkungen."}
                    </p>
                </div>

                <button
                    onClick={applyProfile}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-ocean-primary text-white rounded-full font-semibold shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all transform hover:scale-105 active:scale-95"
                >
                    <span>Profil übernehmen</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        );
    }

    if (currentStepIndex === -1) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8">
                <div className="space-y-4 max-w-lg">
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ocean-primary via-white to-ocean-accent">
                        Finde dein Wasser.
                    </h1>
                    <p className="text-lg text-ocean-secondary leading-relaxed">
                        Nicht jedes Wasser ist gleich. Beantworte 3 kurze Fragen, und wir finden das Profil, das perfekt zu deinem Körper passt.
                    </p>
                </div>

                <button
                    onClick={handleStart}
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-ocean-surface-elevated border border-ocean-border hover:border-ocean-primary/50 rounded-full text-ocean-primary font-medium transition-all hover:shadow-lg hover:-translate-y-1"
                >
                    <span>Jetzt starten</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        );
    }

    if (!currentStep) return null;

    return (
        <div className="max-w-xl mx-auto w-full min-h-[50vh] flex flex-col justify-center">
            <div className="mb-8 flex justify-between items-center px-2">
                <span className="text-xs font-mono text-ocean-tertiary uppercase tracking-widest">
                    Schritt {currentStepIndex + 1} / {STEPS.length}
                </span>
                <div className="flex gap-1">
                    {STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 w-8 rounded-full transition-colors duration-500 ${idx <= currentStepIndex ? "bg-ocean-primary" : "bg-ocean-surface-elevated"
                                }`}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-6 rounded-full bg-ocean-surface-elevated border border-ocean-border shadow-xl">
                            <currentStep.icon className="w-12 h-12 text-ocean-primary" />
                        </div>
                    </div>

                    <div className="text-center space-y-3">
                        <h2 className="text-2xl md:text-3xl font-bold text-ocean-primary">
                            {currentStep.question}
                        </h2>
                        <p className="text-ocean-secondary text-lg">
                            {currentStep.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <button
                            onClick={() => handleAnswer(false)}
                            className="px-6 py-4 rounded-2xl border border-ocean-border bg-ocean-surface hover:bg-ocean-surface-elevated text-ocean-secondary font-medium transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Nein
                        </button>
                        <button
                            onClick={() => handleAnswer(true)}
                            className="px-6 py-4 rounded-2xl border border-ocean-primary/30 bg-ocean-primary/10 hover:bg-ocean-primary/20 text-ocean-primary font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
                        >
                            Ja
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
