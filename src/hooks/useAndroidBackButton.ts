"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

export function useAndroidBackButton() {
  const router = useRouter();

  useEffect(() => {
    if (Capacitor.getPlatform() === "android") {
      const listener = App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          router.back();
        } else {
          App.exitApp();
        }
      });

      return () => {
        listener.then((handler) => handler.remove());
      };
    }
  }, [router]);
}
