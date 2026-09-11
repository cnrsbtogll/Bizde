import { create } from 'zustand';
import { APPRECIATION_POINTS, MAX_TASK_POINTS, MIN_TASK_POINTS } from '@/lib/progress';
import { clampPoints, findTemplate, type TaskTemplate, type RewardTemplate } from '@/mock/catalog';
import { signInAnon } from '@/firebase';
import { subscribeToCouple, updateCoupleDocument, initCoupleDocument, fetchCoupleDocument, type SharedCoupleData } from '@/services/firestore';

export type ActivityStatus = 'requested' | 'pending' | 'approved' | 'rejected';

export interface Activity {
  id: string;
  claimedBy: string;
  requestedBy?: string;
  title: string;
  templateId?: string;
  requestedPoints: number;
  /** Final puan — onaylanınca yazılır, beklerken requestedPoints geçerlidir. */
  points: number;
  status: ActivityStatus;
  type: 'task' | 'appreciation';
  createdAt: number;
  approvedBy?: string;
  decidedAt?: number;
}

export interface Goal {
  title: string;
  targetPoints: number;
  m25Title?: string;
  m60Title?: string;
  rewardTitle?: string;
  rewardId?: string;
}

export interface FinishedGoal extends Goal {
  total: number;
  finishedAt: number;
}

export interface GoalProposal {
  id: string;
  targetType: 'common' | string;
  proposedBy: string;
  targetMember?: string;
  title: string;
  targetPoints: number;
  m25Title?: string;
  m60Title?: string;
  createdAt: number;
}

interface BizdeState {
  uid: string | null;
  members: string[];
  actor: string;
  coupleId: string | null;
  pairingCode: string | null;
  partnerJoined: boolean;
  isPaired: boolean;
  activeGoal: Goal;
  pastGoals: FinishedGoal[];
  activities: Activity[];
  customTemplates: TaskTemplate[];
  customRewards: RewardTemplate[];
  signIn: (displayName: string) => Promise<void>;
  setPartner: (name: string) => void;
  setActor: (name: string) => void;
  createCode: () => string;
  joinCode: (code: string, selectedActor?: string) => Promise<boolean>;
  dismissPairingCode: () => void;
  /** Görev iddiası: puan aralığa sıkışır, status pending. */
  claimTask: (title: string, points: number, templateId?: string) => string | null;
  /** Partnerden görev isteme: status requested, puanı yapacak partnere atanır. */
  requestTask: (title: string, points: number, templateId?: string) => string | null;
  /** Partnerin rica edilen görevi 'Yaptım' demesi: status pending olur. */
  completeRequestedTask: (id: string) => boolean;
  addCustomTemplate: (title: string, points: number, category: TaskTemplate['category']) => string | null;
  addCustomReward: (title: string, thresholdPct?: number) => string | null;
  taskPointOverrides: Record<string, number>;
  personalGoals: Record<string, Goal>;
  updateActiveGoal: (title: string, targetPoints: number, m25Title?: string, m60Title?: string) => boolean;
  updatePersonalGoal: (
    member: string,
    title: string,
    targetPoints: number,
    m25Title?: string,
    m60Title?: string
  ) => boolean;
  adjustTargetPoints: (delta: number) => number;
  updateTaskPoints: (templateId: string, points: number) => boolean;
  approveActivity: (id: string, finalPoints?: number) => boolean;
  rejectActivity: (id: string) => boolean;
  appreciate: () => void;
  startNewGoal: (title: string, targetPoints: number, m25Title?: string, m60Title?: string) => boolean;
  pendingGoalProposal: GoalProposal | null;
  proposeGoal: (
    targetType: 'common' | string,
    title: string,
    targetPoints: number,
    m25Title?: string,
    m60Title?: string,
    targetMember?: string
  ) => boolean;
  acceptGoalProposal: () => boolean;
  rejectGoalProposal: () => boolean;
  reset: () => void;
}

const DEFAULT_GOAL: Goal = {
  title: 'Bu ay birlikte vakit geçirelim',
  targetPoints: 400,
  m25Title: 'Kahve Kaçamağı',
  m60Title: 'Film Gecesi',
};

// ponytail: tek cihazda 2 oyuncu simülasyonu; Firestore sync aynı
// Activity alanlarına oturur (claimedBy/approvedBy = uid), UI değişmez.
function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function otherMember(members: string[], name: string): string {
  return members.find((m) => m !== name) ?? name;
}

export const useBizde = create<BizdeState>()((set, get) => ({
  uid: null,
  members: [],
  actor: '',
  coupleId: null,
  pairingCode: null,
  partnerJoined: false,
  isPaired: false,
  activeGoal: { ...DEFAULT_GOAL },
  pastGoals: [],
  activities: [],
  customTemplates: [],
  customRewards: [],
  taskPointOverrides: {},
  personalGoals: {},
  pendingGoalProposal: null,

  signIn: async (displayName) => {
    const name = displayName.trim();
    if (!name) return;
    const { members } = get();
    const next = members.includes(name) ? members : [name, ...members].slice(0, 2);
    set({ members: next, actor: name, uid: `local-${newId('u')}` });
    const remoteUid = await signInAnon();
    if (remoteUid) {
      set({ uid: remoteUid });
    }
  },

  setPartner: (name) => {
    const clean = name.trim();
    if (!clean) return;
    const { members, actor } = get();
    if (members.includes(clean)) return;
    set({ members: [...members, clean].slice(0, 2), actor: actor || clean });
  },

  setActor: (name) => {
    if (get().members.includes(name)) set({ actor: name });
  },

  createCode: () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const coupleId = `couple-${code}`;
    const { members, activeGoal, pastGoals, activities, customTemplates, customRewards, taskPointOverrides, personalGoals, pendingGoalProposal } = get();
    const sharedData: SharedCoupleData = {
      members,
      activeGoal,
      pastGoals,
      activities,
      customTemplates,
      customRewards,
      taskPointOverrides,
      personalGoals,
      pendingGoalProposal,
      partnerJoined: false,
    };
    initCoupleDocument(coupleId, sharedData).catch(console.error);
    set({ pairingCode: code, coupleId, isPaired: true, partnerJoined: false });
    return code;
  },

  joinCode: async (code, selectedActor) => {
    if (!/^\d{6}$/.test(code)) return false;
    const coupleId = `couple-${code}`;
    const remoteData = await fetchCoupleDocument(coupleId);
    
    if (remoteData) {
      const members = (remoteData.members && remoteData.members.length > 0)
        ? remoteData.members
        : get().members;
      const guestActor = selectedActor || (members.length > 1 ? (members[1] ?? 'Partner') : (members[0] ?? 'Partner'));
      
      set({
        ...remoteData,
        members,
        coupleId,
        pairingCode: code,
        isPaired: true,
        partnerJoined: true,
        actor: guestActor,
      });
      await updateCoupleDocument(coupleId, { partnerJoined: true });
      await get().signIn(guestActor);
      return true;
    }

    // Local / fallback
    const { pairingCode, members } = get();
    if (pairingCode !== null && code === pairingCode) {
      const guestActor = selectedActor || (members.length > 1 ? (members[1] ?? 'Partner') : (members[0] ?? 'Partner'));
      set({ coupleId, isPaired: true, partnerJoined: true, actor: guestActor });
      return true;
    }
    return false;
  },

  dismissPairingCode: () => {
    set({ partnerJoined: true });
  },

  claimTask: (title, points, templateId) => {
    const { actor, members, customTemplates } = get();
    const clean = title.trim();
    if (!clean || !actor) return null;
    const who = members.includes(actor) ? actor : (members[0] ?? actor);
    let final = points;
    if (templateId) {
      const t = findTemplate(templateId, customTemplates);
      if (!t) return null;
      const override = get().taskPointOverrides[templateId];
      final = override !== undefined ? override : clampPoints(points, t);
    } else if (!Number.isInteger(points) || points < MIN_TASK_POINTS || points > MAX_TASK_POINTS) {
      return null;
    }
    const activity: Activity = {
      id: newId('a'),
      claimedBy: who,
      title: clean,
      templateId,
      requestedPoints: final,
      points: 0,
      status: 'pending',
      type: 'task',
      createdAt: Date.now(),
    };
    set({ activities: [activity, ...get().activities] });
    return activity.id;
  },

  requestTask: (title, points, templateId) => {
    const { actor, members, customTemplates } = get();
    const clean = title.trim();
    if (!clean || !actor) return null;
    const target = otherMember(members, actor);
    let final = points;
    if (templateId) {
      const t = findTemplate(templateId, customTemplates);
      if (!t) return null;
      const override = get().taskPointOverrides[templateId];
      final = override !== undefined ? override : clampPoints(points, t);
    } else if (!Number.isInteger(points) || points < MIN_TASK_POINTS || points > MAX_TASK_POINTS) {
      return null;
    }
    const activity: Activity = {
      id: newId('a'),
      claimedBy: target,
      requestedBy: actor,
      title: clean,
      templateId,
      requestedPoints: final,
      points: 0,
      status: 'requested',
      type: 'task',
      createdAt: Date.now(),
    };
    set({ activities: [activity, ...get().activities] });
    return activity.id;
  },

  completeRequestedTask: (id) => {
    const { activities } = get();
    const a = activities.find((x) => x.id === id);
    if (!a || a.status !== 'requested') return false;
    set({
      activities: activities.map((x) =>
        x.id === id ? { ...x, status: 'pending' as const } : x,
      ),
    });
    return true;
  },

  addCustomTemplate: (title, points, category) => {
    const clean = title.trim();
    if (!clean || !Number.isInteger(points)) return null;
    if (points < MIN_TASK_POINTS || points > MAX_TASK_POINTS) return null;
    const t: TaskTemplate = {
      id: newId('custom'),
      category,
      tr: clean,
      en: clean,
      defaultPoints: points,
      minPoints: MIN_TASK_POINTS,
      maxPoints: MAX_TASK_POINTS,
      custom: true,
    };
    set({ customTemplates: [...get().customTemplates, t] });
    return t.id;
  },

  addCustomReward: (title, thresholdPct = 100) => {
    const clean = title.trim();
    if (!clean) return null;
    const r: RewardTemplate = {
      id: newId('custom-reward'),
      tr: clean,
      en: clean,
      thresholdPct: thresholdPct >= 1 && thresholdPct <= 100 ? thresholdPct : 100,
      custom: true,
    };
    set({ customRewards: [...get().customRewards, r] });
    return r.id;
  },

  updateActiveGoal: (title, targetPoints, m25Title, m60Title) => {
    const clean = title.trim();
    if (!clean || !Number.isInteger(targetPoints) || targetPoints < 150 || targetPoints > 600) return false;
    set({
      activeGoal: {
        ...get().activeGoal,
        title: clean,
        targetPoints,
        m25Title: m25Title?.trim() || get().activeGoal.m25Title || 'Kahve Kaçamağı',
        m60Title: m60Title?.trim() || get().activeGoal.m60Title || 'Film Gecesi',
        rewardTitle: clean,
      },
    });
    return true;
  },

  updatePersonalGoal: (member, title, targetPoints, m25Title, m60Title) => {
    const clean = title.trim();
    if (!clean || !Number.isInteger(targetPoints) || targetPoints < 100 || targetPoints > 400) return false;
    set((s) => ({
      personalGoals: {
        ...s.personalGoals,
        [member]: {
          title: clean,
          targetPoints,
          m25Title: m25Title?.trim() || undefined,
          m60Title: m60Title?.trim() || undefined,
        },
      },
    }));
    return true;
  },

  proposeGoal: (targetType, title, targetPoints, m25Title, m60Title, targetMember) => {
    const clean = title.trim();
    const minPts = targetType === 'common' ? 150 : 100;
    const maxPts = targetType === 'common' ? 600 : 400;
    if (!clean || !Number.isInteger(targetPoints) || targetPoints < minPts || targetPoints > maxPts) {
      return false;
    }
    const { members, actor, updateActiveGoal, updatePersonalGoal } = get();
    // Tek kişi ise veya eşleşme henüz yoksa direkt onaysız uygula
    if (members.length < 2) {
      if (targetType === 'common') {
        return updateActiveGoal(clean, targetPoints, m25Title, m60Title);
      } else {
        const who = targetMember || targetType;
        return updatePersonalGoal(who, clean, targetPoints, m25Title, m60Title);
      }
    }

    const proposal: GoalProposal = {
      id: newId('prop'),
      targetType,
      proposedBy: actor || members[0] || 'Partner',
      targetMember: targetMember || (targetType !== 'common' ? targetType : undefined),
      title: clean,
      targetPoints,
      m25Title: m25Title?.trim() || undefined,
      m60Title: m60Title?.trim() || undefined,
      createdAt: Date.now(),
    };

    set({ pendingGoalProposal: proposal });
    return true;
  },

  acceptGoalProposal: () => {
    const { pendingGoalProposal, updateActiveGoal, updatePersonalGoal } = get();
    if (!pendingGoalProposal) return false;
    const { targetType, targetMember, title, targetPoints, m25Title, m60Title } = pendingGoalProposal;
    if (targetType === 'common') {
      updateActiveGoal(title, targetPoints, m25Title, m60Title);
    } else {
      const who = targetMember || targetType;
      updatePersonalGoal(who, title, targetPoints, m25Title, m60Title);
    }
    set({ pendingGoalProposal: null });
    return true;
  },

  rejectGoalProposal: () => {
    if (!get().pendingGoalProposal) return false;
    set({ pendingGoalProposal: null });
    return true;
  },

  adjustTargetPoints: (delta) => {
    const { activeGoal } = get();
    const next = Math.min(600, Math.max(150, activeGoal.targetPoints + delta));
    set({ activeGoal: { ...activeGoal, targetPoints: next } });
    return next;
  },

  updateTaskPoints: (templateId, points) => {
    if (!Number.isInteger(points) || points < MIN_TASK_POINTS || points > MAX_TASK_POINTS) {
      return false;
    }
    set({
      taskPointOverrides: {
        ...get().taskPointOverrides,
        [templateId]: points,
      },
    });
    return true;
  },

  approveActivity: (id, finalPoints) => {
    const { activities, members, actor, customTemplates } = get();
    const a = activities.find((x) => x.id === id);
    if (!a || a.status !== 'pending') return false;
    let pts = finalPoints ?? a.requestedPoints;
    if (a.templateId) {
      const t = findTemplate(a.templateId, customTemplates);
      if (t) {
        const override = get().taskPointOverrides[a.templateId];
        if (override !== undefined) {
          pts = Math.min(MAX_TASK_POINTS, Math.max(MIN_TASK_POINTS, pts));
        } else {
          pts = clampPoints(pts, t);
        }
      }
    } else if (!Number.isInteger(pts) || pts < MIN_TASK_POINTS || pts > MAX_TASK_POINTS) {
      return false;
    }
    const now = Date.now();
    const approver = actor && actor !== a.claimedBy ? actor : otherMember(members, a.claimedBy);
    set({
      activities: activities.map((x) =>
        x.id === id
          ? {
              ...x,
              status: 'approved' as const,
              points: pts,
              approvedBy: approver,
              decidedAt: now,
            }
          : x,
      ),
    });
    return true;
  },

  rejectActivity: (id) => {
    const { activities } = get();
    const a = activities.find((x) => x.id === id);
    if (!a || a.status !== 'pending') return false;
    set({
      activities: activities.map((x) =>
        x.id === id ? { ...x, status: 'rejected' as const, decidedAt: Date.now() } : x,
      ),
    });
    return true;
  },

  appreciate: () => {
    const { actor, members, activities } = get();
    if (!actor) return;
    const who = members.includes(actor) ? actor : (members[0] ?? actor);
    if (hasAppreciatedToday(activities, who)) return;
    const activity: Activity = {
      id: newId('a'),
      claimedBy: who,
      title: 'Teşekkür',
      requestedPoints: APPRECIATION_POINTS,
      points: APPRECIATION_POINTS,
      status: 'approved',
      type: 'appreciation',
      createdAt: Date.now(),
      approvedBy: who,
      decidedAt: Date.now(),
    };
    set({ activities: [activity, ...activities] });
  },

  startNewGoal: (title, targetPoints, m25Title, m60Title) => {
    const clean = title.trim();
    if (!clean || !Number.isInteger(targetPoints) || targetPoints < 150 || targetPoints > 600) return false;
    const { activeGoal, activities } = get();
    const total = totalPoints(activities);
    set({
      pastGoals: [...get().pastGoals, { ...activeGoal, total, finishedAt: Date.now() }],
      activeGoal: {
        title: clean,
        targetPoints,
        m25Title: m25Title?.trim() || 'Kahve Kaçamağı',
        m60Title: m60Title?.trim() || 'Film Gecesi',
        rewardTitle: clean,
      },
      activities: [],
    });
    return true;
  },

  reset: async () => {
    const { coupleId } = get();
    if (coupleId) {
      await updateCoupleDocument(coupleId, { partnerJoined: false });
    }
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }
    set({
      uid: null,
      members: [],
      actor: '',
      coupleId: null,
      pairingCode: null,
      partnerJoined: false,
      isPaired: false,
      activeGoal: { ...DEFAULT_GOAL },
      pastGoals: [],
      activities: [],
      customTemplates: [],
      customRewards: [],
      taskPointOverrides: {},
      personalGoals: {},
      pendingGoalProposal: null,
    });
  },
}));

let isSyncing = false;
let unsubscribeFirestore: (() => void) | null = null;

useBizde.subscribe((state, prevState) => {
  if (isSyncing) return;
  const currentCoupleId = state.coupleId;
  if (currentCoupleId && currentCoupleId !== prevState.coupleId) {
    if (unsubscribeFirestore) unsubscribeFirestore();
    const sharedData: SharedCoupleData = {
      members: state.members,
      activeGoal: state.activeGoal,
      pastGoals: state.pastGoals,
      activities: state.activities,
      customTemplates: state.customTemplates,
      customRewards: state.customRewards,
      taskPointOverrides: state.taskPointOverrides,
      personalGoals: state.personalGoals,
      pendingGoalProposal: state.pendingGoalProposal,
      partnerJoined: state.partnerJoined,
    };
    initCoupleDocument(currentCoupleId, sharedData).catch(console.error);
    unsubscribeFirestore = subscribeToCouple(currentCoupleId, (remoteData) => {
      isSyncing = true;
      let nextMembers = remoteData.members || [];
      
      // ponytail: if I joined an existing couple and my name isn't there, add it and sync back.
      if (state.actor && !nextMembers.includes(state.actor)) {
        nextMembers = [...nextMembers, state.actor].slice(0, 2);
        updateCoupleDocument(currentCoupleId, { members: nextMembers }).catch(console.error);
      }
      
      useBizde.setState({
        ...remoteData,
        members: nextMembers,
        partnerJoined: remoteData.partnerJoined ?? false,
      });
      setTimeout(() => { isSyncing = false; }, 0);
    });
  } else if (currentCoupleId && currentCoupleId === prevState.coupleId) {
    const sharedData: SharedCoupleData = {
      members: state.members,
      activeGoal: state.activeGoal,
      pastGoals: state.pastGoals,
      activities: state.activities,
      customTemplates: state.customTemplates,
      customRewards: state.customRewards,
      taskPointOverrides: state.taskPointOverrides,
      personalGoals: state.personalGoals,
      pendingGoalProposal: state.pendingGoalProposal,
      partnerJoined: state.partnerJoined,
    };
    updateCoupleDocument(currentCoupleId, sharedData).catch(console.error);
  }
});

export function getPersonalGoal(
  personalGoals: Record<string, Goal>,
  member: string = '',
  members: string[] = []
): Goal {
  if (personalGoals[member]) return personalGoals[member];
  const isSecond = members.length > 1 && members[1] === member;
  if (isSecond) {
    return {
      title: 'Hafta Sonu Spa & Romantik Akşam Yemeği',
      targetPoints: 200,
      m25Title: 'En Sevdiği Çiçek & Tatlı',
      m60Title: 'Mum Işığında Akşam Yemeği',
    };
  }
  return {
    title: '3 Saat Kesintisiz PS & Masaj Gecesi',
    targetPoints: 200,
    m25Title: 'Favori Atıştırmalık & İçecek',
    m60Title: '3 Saat Kesintisiz Oyun / Maç',
  };
}

/** Onaylı toplam — bar ve hedef hesabı tek yerden. */
export function totalPoints(activities: Activity[]): number {
  return activities.reduce((sum, a) => (a.status === 'approved' ? sum + a.points : sum), 0);
}

/** Kişi bazında onaylı toplamlar (members sırasıyla). */
export function totalsByMember(activities: Activity[], members: string[]): number[] {
  return members.map((m) =>
    activities.reduce((sum, a) => (a.status === 'approved' && a.claimedBy === m ? sum + a.points : sum), 0),
  );
}

/** Onay bekleyenler (barda değil, ayrı listede). */
export function pendingActivities(activities: Activity[]): Activity[] {
  return activities.filter((a) => a.status === 'pending');
}

/** Aktif kullanıcıya partnerinden gelen görev istekleri. */
export function incomingRequests(activities: Activity[], actor: string): Activity[] {
  return activities.filter((a) => a.status === 'requested' && a.claimedBy === actor);
}

/** Aktif kullanıcının partnerine gönderdiği görev istekleri. */
export function outgoingRequests(activities: Activity[], actor: string): Activity[] {
  return activities.filter((a) => a.status === 'requested' && a.requestedBy === actor);
}

/** Geçmiş: sadece onaylı ve reddedilenler (ret sessiz, gri). Son 20. */
export function historyActivities(activities: Activity[]): Activity[] {
  return activities.filter((a) => a.status === 'approved' || a.status === 'rejected').slice(0, 20);
}

/** Eski adla uyum: son 5 onaylı/geçmiş. */
export function recentActivities(activities: Activity[]): Activity[] {
  return historyActivities(activities).slice(0, 5);
}

/** Belirtilen kullanıcının bugün teşekkür edip etmediği (günde 1 kez sınırı). */
export function hasAppreciatedToday(activities: Activity[], actor: string): boolean {
  if (!actor) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startMs = startOfToday.getTime();

  return activities.some(
    (a) =>
      a.type === 'appreciation' &&
      a.claimedBy.toLowerCase() === actor.toLowerCase() &&
      a.createdAt >= startMs &&
      a.status === 'approved',
  );
}
