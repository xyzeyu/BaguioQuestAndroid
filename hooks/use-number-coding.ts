// hooks/use-number-coding.ts
import { useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import rules from "../data/coding_rules.json";

type CodingStatus = { isWindow: boolean; isAffected: boolean; reason?: string; dayKey: string };

function getDayKeyLocal(now: Date) {
  // Sun=0..Sat=6 → "Sun".."Sat"
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return DAYS[now.getDay()];
}

function withinWindowLocal(now: Date, start: string, end: string) {
  // Avoid Intl/formatToParts — use local clock
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startDt = new Date(now);
  startDt.setHours(sh, sm, 0, 0);

  const endDt = new Date(now);
  endDt.setHours(eh, em, 0, 0);

  return now >= startDt && now <= endDt;
}

export function useNumberCoding(plateLastDigit?: number): CodingStatus {
  // We still read timezone from rules for display, but logic uses local clock
  const dayKey = getDayKeyLocal(new Date());

  const isScheduledDay = Array.isArray((rules as any).window?.days)
    ? (rules as any).window.days.includes(dayKey)
    : false;

  const isWindow = isScheduledDay && withinWindowLocal(
    new Date(),
    (rules as any).window?.start ?? "07:00",
    (rules as any).window?.end ?? "19:00"
  );

  const isAffected = useMemo(() => {
    if (!isWindow || plateLastDigit == null) return false;
    const todays = (rules as any).mapping?.[dayKey] || [];
    return todays.includes(plateLastDigit);
  }, [isWindow, plateLastDigit, dayKey]);

  return {
    isWindow,
    isAffected,
    reason: isAffected ? `${dayKey} plate endings restricted` : undefined,
    dayKey,
  };
}

export async function getSavedPlateLastDigit(): Promise<number | undefined> {
  const raw = await AsyncStorage.getItem("plateLastDigit");
  if (!raw) return;
  const n = Number(raw);
  return Number.isNaN(n) ? undefined : n;
}
