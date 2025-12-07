"use client";

import { ProfileWizard } from "@/src/components/onboarding/ProfileWizard";
import Link from "next/link";
import { X } from "lucide-react";

export default function ProfileSetupPage() {
    return (
        <main className="fixed inset-0 bg-transparent overflow-hidden">
            <Link
                href="/dashboard"
                className="fixed top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-ocean-surface border border-ocean-border text-ocean-secondary hover:text-ocean-primary transition-colors z-50"
            >
                <X className="w-6 h-6" />
            </Link>
            <div className="h-full w-full flex items-center justify-center p-4">
                <div className="w-full max-w-5xl max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <ProfileWizard />
                </div>
            </div>
        </main>
    );
}
