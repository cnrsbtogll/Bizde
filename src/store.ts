import { create } from 'zustand';
import { APPRECIATION_POINTS, genPairingCode, validPairingCode, validTaskPoints } from '@/lib/progress';
import { signInAnon } from '@/firebase';

export interface Activity {
  id: string;
  createdBy: string;
  title: string;
  points: number;
  type: 'task' | 'appreciation';
  createdAt: number;
}

interface BizdeState {
  uid: string | null;
  displayName: string;
  coupleId: string | null;
  pairingCode: string | null;
  isPaired: boolean;
  goalTitle: string;
  targetPoints: number;
  reward: string;
  activities: Activity[];
  signIn: (displayName: string) => void;
  createCode: () => string;
  joinCode: (code: string) => boolean;
  addTask: (title: string, points: number) => boolean;
  appreciate: () => void;
  reset: () => void;
}

// ponytail: single-device store; Firestore sync (firebase.ts) plugs into these
// same actions when backend env is present — no second code path in UI.
function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const useBizde = create<BizdeState>()((set, get) => ({
  uid: null,
  displayName: '',
  coupleId: null,
  pairingCode: null,
  isPaired: false,
  goalTitle: 'Bu ay birlikte vakit geçirelim',
  targetPoints: 400,
  reward: 'Restoran',
  activities: [],

  signIn: (displayName) => {
    set({ displayName: displayName.trim(), uid: `local-${newId()}` });
    void signInAnon().then((remoteUid) => {
      if (remoteUid) set({ uid: remoteUid });
    });
  },

  createCode: () => {
    const code = genPairingCode();
    set({ pairingCode: code, coupleId: `couple-${code}`, isPaired: true });
    return code;
  },

  joinCode: (code) => {
    const { pairingCode } = get();
    if (!validPairingCode(code)) return false;
    // Local demo: joining with the generated code pairs. With Firestore wired,
    // this becomes a couples-doc lookup by pairingCode instead.
    if (pairingCode !== null && code !== pairingCode) return false;
    set({ coupleId: `couple-${code}`, isPaired: true });
    return true;
  },

  addTask: (title, points) => {
    const { displayName, activities } = get();
    if (!validTaskPoints(points) || title.trim().length === 0) return false;
    const activity: Activity = {
      id: newId(),
      createdBy: displayName || '?',
      title: title.trim(),
      points,
      type: 'task',
      createdAt: Date.now(),
    };
    set({ activities: [activity, ...activities] });
    return true;
  },

  appreciate: () => {
    const { displayName, activities } = get();
    const activity: Activity = {
      id: newId(),
      createdBy: displayName || '?',
      title: 'Takdir',
      points: APPRECIATION_POINTS,
      type: 'appreciation',
      createdAt: Date.now(),
    };
    set({ activities: [activity, ...activities] });
  },

  reset: () =>
    set({
      uid: null,
      displayName: '',
      coupleId: null,
      pairingCode: null,
      isPaired: false,
      activities: [],
    }),
}));

/** Shared total — one place so Home and tests agree. */
export function totalPoints(activities: Activity[]): number {
  return activities.reduce((sum, a) => sum + a.points, 0);
}

/** Last 5 contributions, newest first (store keeps newest-first order). */
export function recentActivities(activities: Activity[]): Activity[] {
  return activities.slice(0, 5);
}
