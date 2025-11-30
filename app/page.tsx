'use client';

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  useEffect(() => {
    const startScreen = localStorage.getItem('wasserscan-start-screen');
    if (startScreen === 'scan') {
      redirect("/scan");
    } else {
      redirect("/dashboard");
    }
  }, []);

  return null;
}
