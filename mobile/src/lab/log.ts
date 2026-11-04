import * as Battery from 'expo-battery';

import { insertEvent } from './db';

export async function batteryPct(): Promise<number | null> {
  try {
    const level = await Battery.getBatteryLevelAsync();
    return level < 0 ? null : Math.round(level * 100);
  } catch {
    return null;
  }
}

export async function logEvent(e: {
  kind: string;
  label: string;
  scheduledAt?: number | null;
  actualAt?: number;
  ref?: string;
}): Promise<boolean> {
  return insertEvent({ ...e, batteryPct: await batteryPct() });
}
