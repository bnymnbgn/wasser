"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { sqliteService, type ConsumptionEntry } from "@/lib/sqlite";
import { Capacitor } from "@capacitor/core";

interface ConsumptionContextType {
  consumptions: ConsumptionEntry[];
  add: (entry: Omit<ConsumptionEntry, "createdAt">) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ConsumptionContext = createContext<ConsumptionContextType>({
  consumptions: [],
  add: async () => {},
  remove: async () => {},
  refresh: async () => {},
});

export function useConsumptionContext() {
  return useContext(ConsumptionContext);
}

export function ConsumptionProvider({ children }: { children: React.ReactNode }) {
  const [consumptions, setConsumptions] = useState<ConsumptionEntry[]>([]);

  const refresh = async () => {
    if (!Capacitor.isNativePlatform()) {
      setConsumptions([]);
      return;
    }
    const entries = await sqliteService.getConsumptionsForDate(new Date());
    setConsumptions(entries);
  };

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  const add = async (entry: Omit<ConsumptionEntry, "createdAt">) => {
    await sqliteService.addConsumption(entry);
    await refresh();
  };

  const remove = async (id: string) => {
    await sqliteService.deleteConsumption(id);
    await refresh();
  };

  const value = useMemo(() => ({ consumptions, add, remove, refresh }), [consumptions]);

  return <ConsumptionContext.Provider value={value}>{children}</ConsumptionContext.Provider>;
}
