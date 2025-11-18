"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function ConditionalBottomNav() {
  const pathname = usePathname();

  // Don't show BottomNav on landing page
  const hiddenRoutes = ["/"];
  const shouldHideNav = hiddenRoutes.includes(pathname);

  if (shouldHideNav) {
    return null;
  }

  return <BottomNav />;
}
