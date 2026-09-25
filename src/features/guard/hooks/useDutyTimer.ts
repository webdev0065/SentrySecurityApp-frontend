import { useEffect, useMemo, useState } from 'react';

export type DutyTimer = {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Zero-padded `HH:MM:SS` duty duration. */
  label: string;
};

const pad = (value: number) => String(Math.floor(value)).padStart(2, '0');

/**
 * Ticks once per second and returns the duty duration measured from the
 * server-side clock-in timestamp, so the timer survives app restarts.
 */
export const useDutyTimer = (clockInAt?: string | null): DutyTimer => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!clockInAt) return undefined;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [clockInAt]);

  return useMemo(() => {
    const startedMs = clockInAt ? Date.parse(clockInAt) : Number.NaN;
    const totalSeconds = Number.isFinite(startedMs)
      ? Math.max(0, Math.floor((now - startedMs) / 1000))
      : 0;

    return {
      totalSeconds,
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      label: `${pad(totalSeconds / 3600)}:${pad((totalSeconds % 3600) / 60)}:${pad(
        totalSeconds % 60,
      )}`,
    };
  }, [clockInAt, now]);
};
