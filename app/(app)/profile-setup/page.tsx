"use client";

import { ProfileWizard } from "@/src/components/onboarding/ProfileWizard";
import Link from "next/link";
import { X } from "lucide-react";

export default function ProfileSetupPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 pb-32 relative">
            <Link
                href="/dashboard"
                className="absolute top-6 right-6 p-2 rounded-full bg-ocean-surface border border-ocean-border text-ocean-secondary hover:text-ocean-primary transition-colors z-50"
            >
                <X className="w-6 h-6" />
            </Link>
            <ProfileWizard />
        </main>
    );
}
