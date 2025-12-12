"use client";

import { useRouter } from "next/navigation";
import { InteractiveLabel } from "@/src/components/academy/InteractiveLabel";

export default function LabelGuidePage() {
    const router = useRouter();

    return (
        <InteractiveLabel onClose={() => router.back()} />
    );
}
