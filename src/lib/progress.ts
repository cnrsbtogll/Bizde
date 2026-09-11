// Pure goal/progress math for Bizde. No RN, no Firebase — unit-tested.
export interface Milestone {
  pct: number;
  labelKey: string; // i18n key suffix under milestones.*
}

export const TARGET_POINTS = 400;
export const APPRECIATION_POINTS = 15;
export const MIN_TASK_POINTS = 10;
export const MAX_TASK_POINTS = 50;

export const MILESTONES: Milestone[] = [
  { pct: 25, labelKey: 'm25' },
  { pct: 60, labelKey: 'm60' },
  { pct: 100, labelKey: 'm100' },
];

/** 0..1 fraction of target reached. Guards divide-by-zero and negatives. */
export function progressFraction(current: number, target: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.min(1, Math.max(0, current / target));
}

/** Milestone pct values reached at the current total. */
export function reachedMilestones(
  current: number,
  target: number,
  milestones: Milestone[] = MILESTONES,
): number[] {
  const pct = progressFraction(current, target) * 100;
  return milestones.filter((m) => pct >= m.pct).map((m) => m.pct);
}

/** Task points must be an integer in [10, 50] (PRD §3B). */
export function validTaskPoints(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= MIN_TASK_POINTS && n <= MAX_TASK_POINTS;
}

/** 6-digit pairing code. ponytail: Math.random is fine for invite codes;
 *  upgrade to expo-crypto only if guessing becomes abuse, not before. */
export function genPairingCode(rng: () => number = Math.random): string {
  return String(Math.floor(100000 + rng() * 900000));
}

export function validPairingCode(code: unknown): code is string {
  return typeof code === 'string' && /^\d{6}$/.test(code);
}

/** Consecutive active days with approved activities (ending today or yesterday). */
export function calculateStreak(
  activities: { createdAt: number; status: string }[],
  referenceTime: number = Date.now(),
): number {
  const approved = activities.filter((a) => a.status === 'approved');
  if (approved.length === 0) return 0;

  const dateStr = (ms: number) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const activeDays = new Set(approved.map((a) => dateStr(a.createdAt)));
  const MS_PER_DAY = 86400000;

  const todayStr = dateStr(referenceTime);
  const yesterdayStr = dateStr(referenceTime - MS_PER_DAY);

  let currentCursor = activeDays.has(todayStr)
    ? referenceTime
    : activeDays.has(yesterdayStr)
    ? referenceTime - MS_PER_DAY
    : null;

  if (currentCursor === null) return 0;

  let streak = 0;
  while (activeDays.has(dateStr(currentCursor))) {
    streak++;
    currentCursor -= MS_PER_DAY;
  }
  return streak;
}
