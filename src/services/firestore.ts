import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getFirebase } from '../firebase';
import { type Activity, type Goal, type FinishedGoal, type GoalProposal } from '../store';
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
  pendingGoalProposal: GoalProposal | null;
}

export function subscribeToCouple(
  coupleId: string,
  onData: (data: SharedCoupleData) => void
): () => void {
  const fb = getFirebase();
  if (!fb) return () => {};

  const docRef = doc(fb.db, 'couples', coupleId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data() as SharedCoupleData);
    }
  });
}

export async function initCoupleDocument(coupleId: string, initialData: SharedCoupleData) {
  const fb = getFirebase();
  if (!fb) return;
  const docRef = doc(fb.db, 'couples', coupleId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    await setDoc(docRef, initialData);
  }
}

export async function updateCoupleDocument(coupleId: string, updates: Partial<SharedCoupleData>) {
  const fb = getFirebase();
  if (!fb) return;
  const docRef = doc(fb.db, 'couples', coupleId);
  await updateDoc(docRef, updates);
}
