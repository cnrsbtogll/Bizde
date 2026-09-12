import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getFirebase } from '../firebase';
import { type Activity, type Goal, type FinishedGoal, type GoalProposal, type RewardClaimProposal, type ApprovedRewardClaim } from '../store';
import { type TaskTemplate, type RewardTemplate } from '../mock/catalog';
// We store the shared state in a single document for simplicity
export interface SharedCoupleData {
  members: string[];
  activeGoal: Goal;
  pastGoals: FinishedGoal[];
  activities: Activity[];
  customTemplates: TaskTemplate[];
  customRewards: RewardTemplate[];
  taskPointOverrides: Record<string, number>;
  personalGoals: Record<string, Goal>;
  personalSpentPoints?: Record<string, number>;
  celebratedMilestones?: string[];
  pendingGoalProposal: GoalProposal | null;
  pendingRewardClaim?: RewardClaimProposal | null;
  lastApprovedRewardClaim?: ApprovedRewardClaim | null;
  partnerJoined?: boolean;
}

export function subscribeToCouple(
  coupleId: string,
  onData: (data: SharedCoupleData) => void
): () => void {
  const fb = getFirebase();
  if (!fb) {
    console.warn('[Firestore] subscribeToCouple skipped: Firebase not initialized');
    return () => {};
  }

  console.log('[Firestore] Subscribing to couple:', coupleId);
  const docRef = doc(fb.db, 'couples', coupleId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        console.log('[Firestore] Snapshot received for:', coupleId);
        onData(snapshot.data() as SharedCoupleData);
      } else {
        console.log('[Firestore] Snapshot: document does not exist yet:', coupleId);
      }
    },
    (err) => {
      console.error('[Firestore] subscribeToCouple listener error:', err);
    }
  );
}

function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function initCoupleDocument(coupleId: string, initialData: SharedCoupleData) {
  const fb = getFirebase();
  if (!fb) {
    console.warn('[Firestore] initCoupleDocument skipped: Firebase not initialized');
    return;
  }
  try {
    const docRef = doc(fb.db, 'couples', coupleId);
    await setDoc(docRef, cleanForFirestore(initialData), { merge: true });
    console.log('[Firestore] Successfully initialized couple document:', coupleId);
  } catch (err) {
    console.error('[Firestore] Error init couple document:', coupleId, err);
  }
}

export async function fetchCoupleDocument(coupleId: string): Promise<SharedCoupleData | null> {
  const fb = getFirebase();
  if (!fb) {
    console.warn('[Firestore] fetchCoupleDocument skipped: Firebase not initialized');
    return null;
  }
  try {
    console.log('[Firestore] Fetching couple document:', coupleId);
    const docRef = doc(fb.db, 'couples', coupleId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      console.log('[Firestore] Found couple document:', coupleId);
      return snapshot.data() as SharedCoupleData;
    }
    console.log('[Firestore] Couple document not found in DB:', coupleId);
  } catch (err) {
    console.error('[Firestore] Error fetching couple document:', coupleId, err);
  }
  return null;
}

export async function updateCoupleDocument(coupleId: string, updates: Partial<SharedCoupleData>) {
  const fb = getFirebase();
  if (!fb) return;
  try {
    const docRef = doc(fb.db, 'couples', coupleId);
    await updateDoc(docRef, cleanForFirestore(updates));
    console.log('[Firestore] Updated couple document:', coupleId);
  } catch (err) {
    console.error('[Firestore] Error updating couple document:', coupleId, err);
  }
}
