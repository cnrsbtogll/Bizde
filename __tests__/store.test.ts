import {
  historyActivities,
  incomingRequests,
  outgoingRequests,
  pendingActivities,
  totalPoints,
  totalsByMember,
  useBizde,
} from '@/store';
import { APPRECIATION_POINTS } from '@/lib/progress';

// Firebase needs a real backend + ESM the Jest transform can't parse;
// the seam is one function, so mock it and test store logic for real.
jest.mock('@/firebase', () => ({
  signInAnon: jest.fn(async () => null),
}));

beforeEach(() => {
  useBizde.getState().reset();
});

function pairedAs(ayse = 'Ayşe', hakan = 'Hakan') {
  useBizde.getState().signIn(ayse);
  useBizde.getState().setPartner(hakan);
  const code = useBizde.getState().createCode();
  expect(useBizde.getState().isPaired).toBe(true);
  return code;
}

describe('pairing', () => {
  it('signIn + partner + createCode pairs with a 6-digit code', () => {
    const code = pairedAs();
    expect(code).toMatch(/^\d{6}$/);
    const s = useBizde.getState();
    expect(s.coupleId).toBe(`couple-${code}`);
    expect(s.members).toEqual(['Ayşe', 'Hakan']);
  });
  it('joinCode rejects bad codes, accepts the generated one', () => {
    useBizde.getState().signIn('Elif');
    expect(useBizde.getState().joinCode('123')).toBe(false);
    expect(useBizde.getState().isPaired).toBe(false);
    useBizde.getState().signIn('Elif');
    const code = useBizde.getState().createCode();
    useBizde.getState().reset();
    useBizde.getState().signIn('Elif');
    expect(useBizde.getState().joinCode(code)).toBe(true);
    expect(useBizde.getState().isPaired).toBe(true);
  });
});

describe('claim + approve flow', () => {
  it('pending claim counts nothing until approved (Ayşe claims, Hakan approves)', () => {
    pairedAs();
    useBizde.getState().setActor('Ayşe');
    const id = useBizde.getState().claimTask('Ev temizliği', 15, 'ev-bulasik');
    expect(id).not.toBeNull();
    expect(totalPoints(useBizde.getState().activities)).toBe(0);
    expect(pendingActivities(useBizde.getState().activities)).toHaveLength(1);
    useBizde.getState().setActor('Hakan');
    expect(useBizde.getState().approveActivity(id as string, 20)).toBe(true);
    expect(totalPoints(useBizde.getState().activities)).toBe(20);
  });
  it('approval clamps points to the card range', () => {
    pairedAs();
    const id = useBizde.getState().claimTask('Çöpü çıkar', 10, 'ev-cop');
    // ev-cop max 20 → 99 becomes 20
    expect(useBizde.getState().approveActivity(id as string, 99)).toBe(true);
    expect(totalPoints(useBizde.getState().activities)).toBe(20);
  });
  it('reject is silent: excluded from total, grey in history', () => {
    pairedAs();
    const id = useBizde.getState().claimTask('x iş', 10);
    expect(useBizde.getState().rejectActivity(id as string)).toBe(true);
    expect(totalPoints(useBizde.getState().activities)).toBe(0);
    expect(pendingActivities(useBizde.getState().activities)).toHaveLength(0);
    const h = historyActivities(useBizde.getState().activities);
    expect(h).toHaveLength(1);
    expect(h[0]?.status).toBe('rejected');
  });
  it('appreciation is instantly approved', () => {
    pairedAs();
    useBizde.getState().appreciate();
    expect(totalPoints(useBizde.getState().activities)).toBe(APPRECIATION_POINTS);
  });
  it('stacked totals split by member', () => {
    pairedAs();
    useBizde.getState().setActor('Ayşe');
    const a = useBizde.getState().claimTask('iş', 30);
    useBizde.getState().approveActivity(a as string);
    useBizde.getState().setActor('Hakan');
    const b = useBizde.getState().claimTask('iş', 10);
    useBizde.getState().approveActivity(b as string);
    const s = useBizde.getState();
    expect(totalsByMember(s.activities, s.members)).toEqual([30, 10]);
  });
});

describe('goal loop', () => {
  it('startNewGoal archives the finished goal and resets the bar', () => {
    pairedAs();
    const id = useBizde.getState().claimTask('iş', 50);
    useBizde.getState().approveActivity(id as string);
    expect(useBizde.getState().startNewGoal('Birlikte spor', 400, 'r60-film')).toBe(true);
    const s = useBizde.getState();
    expect(s.pastGoals).toHaveLength(1);
    expect(s.pastGoals[0]?.total).toBe(50);
    expect(s.activities).toHaveLength(0);
    expect(s.activeGoal.title).toBe('Birlikte spor');
    expect(totalPoints(s.activities)).toBe(0);
  });
  it('rejects bad targets', () => {
    pairedAs();
    expect(useBizde.getState().startNewGoal('x', 50, 'r60-film')).toBe(false);
    expect(useBizde.getState().startNewGoal('', 400, 'r60-film')).toBe(false);
  });
});

describe('custom cards', () => {
  it('custom card claims within 10-50 and is approvable', () => {
    pairedAs();
    const tid = useBizde.getState().addCustomTemplate('Balkonu yıka', 25, 'ev');
    expect(tid).not.toBeNull();
    const id = useBizde.getState().claimTask('Balkonu yıka', 25, tid as string);
    expect(id).not.toBeNull();
    expect(useBizde.getState().approveActivity(id as string)).toBe(true);
    expect(totalPoints(useBizde.getState().activities)).toBe(25);
  });
});

describe('hybrid task request flow', () => {
  it('requestTask creates a requested activity for partner', () => {
    pairedAs('Leyla', 'Caner');
    useBizde.getState().setActor('Leyla');
    const id = useBizde.getState().requestTask('Bulaşıkları yıka', 15, 'ev-bulasik');
    expect(id).not.toBeNull();

    const activities = useBizde.getState().activities;
    // Puan is not in the bar yet
    expect(totalPoints(activities)).toBe(0);

    // Caner sees this in incomingRequests
    const canerRequests = incomingRequests(activities, 'Caner');
    expect(canerRequests).toHaveLength(1);
    expect(canerRequests[0]?.claimedBy).toBe('Caner');
    expect(canerRequests[0]?.requestedBy).toBe('Leyla');
    expect(canerRequests[0]?.status).toBe('requested');

    // Leyla sees this in outgoingRequests
    const leylaOutgoing = outgoingRequests(activities, 'Leyla');
    expect(leylaOutgoing).toHaveLength(1);
  });

  it('completeRequestedTask transitions requested -> pending, then requester approves', () => {
    pairedAs('Leyla', 'Caner');
    useBizde.getState().setActor('Leyla');
    const id = useBizde.getState().requestTask('Bulaşıkları yıka', 15, 'ev-bulasik');

    // Caner completes it
    useBizde.getState().setActor('Caner');
    expect(useBizde.getState().completeRequestedTask(id as string)).toBe(true);

    const afterDone = useBizde.getState().activities;
    expect(pendingActivities(afterDone)).toHaveLength(1);

    // Leyla approves Caner's work
    useBizde.getState().setActor('Leyla');
    expect(useBizde.getState().approveActivity(id as string)).toBe(true);

    const finalState = useBizde.getState();
    expect(totalPoints(finalState.activities)).toBe(15);
    // Caner earned the points
    expect(totalsByMember(finalState.activities, finalState.members)).toEqual([0, 15]);
  });
});

describe('custom rewards', () => {
  it('adds custom reward and allows setting it as goal reward', () => {
    pairedAs('Leyla', 'Caner');
    const rid = useBizde.getState().addCustomReward('Hafta sonu spa', 100);
    expect(rid).not.toBeNull();
    const rewards = useBizde.getState().customRewards;
    expect(rewards).toHaveLength(1);
    expect(rewards[0]?.tr).toBe('Hafta sonu spa');
    expect(rewards[0]?.thresholdPct).toBe(100);

    expect(useBizde.getState().startNewGoal('Birlikte spa', 400, 'Kahve', 'Film')).toBe(true);
    expect(useBizde.getState().activeGoal.title).toBe('Birlikte spa');
    expect(useBizde.getState().activeGoal.m25Title).toBe('Kahve');
    expect(useBizde.getState().activeGoal.m60Title).toBe('Film');
  });

  it('updates personal goal for a member and retrieves defaults', () => {
    const { getPersonalGoal } = require('@/store');
    pairedAs('Emre', 'Cansu');
    const s = useBizde.getState();
    const g1 = getPersonalGoal(s.personalGoals, 'Emre', s.members);
    const g2 = getPersonalGoal(s.personalGoals, 'Cansu', s.members);
    expect(g1.title).toBe('3 Saat Kesintisiz PS & Masaj Gecesi');
    expect(g2.title).toBe('Hafta Sonu Spa & Romantik Akşam Yemeği');

    expect(useBizde.getState().updatePersonalGoal('Emre', 'Yeni PS Hedefi', 250, 'Atıştırmalık', 'Oyun')).toBe(true);
    const updated = useBizde.getState().personalGoals['Emre'];
    expect(updated?.title).toBe('Yeni PS Hedefi');
    expect(updated?.targetPoints).toBe(250);
  });
});

describe('mutual goal proposal flow', () => {
  it('proposes common goal and enforces min 150 points', () => {
    pairedAs('Caner', 'Leyla');
    useBizde.getState().setActor('Caner');

    // Rejects below 150 for common goal
    expect(useBizde.getState().proposeGoal('common', 'Ufak Hedef', 100)).toBe(false);

    // Accepts 150+
    expect(useBizde.getState().proposeGoal('common', 'Birlikte Kapadokya', 500, 'Kahve', 'Sinema')).toBe(true);
    const proposal = useBizde.getState().pendingGoalProposal;
    expect(proposal).not.toBeNull();
    expect(proposal?.proposedBy).toBe('Caner');
    expect(proposal?.title).toBe('Birlikte Kapadokya');
    expect(proposal?.targetPoints).toBe(500);

    // Goal is not changed until approved
    expect(useBizde.getState().activeGoal.title).not.toBe('Birlikte Kapadokya');

    // Leyla approves
    useBizde.getState().setActor('Leyla');
    expect(useBizde.getState().acceptGoalProposal()).toBe(true);
    expect(useBizde.getState().activeGoal.title).toBe('Birlikte Kapadokya');
    expect(useBizde.getState().activeGoal.targetPoints).toBe(500);
    expect(useBizde.getState().pendingGoalProposal).toBeNull();
  });

  it('proposes personal goal and handles rejection', () => {
    pairedAs('Caner', 'Leyla');
    useBizde.getState().setActor('Leyla');

    // Rejects below 100 for personal goal
    expect(useBizde.getState().proposeGoal('Leyla', 'Bedava Yemek', 50)).toBe(false);

    // Accepts 100+
    expect(useBizde.getState().proposeGoal('Leyla', 'Spa & Akşam Yemeği', 250)).toBe(true);
    expect(useBizde.getState().pendingGoalProposal).not.toBeNull();

    // Caner rejects
    useBizde.getState().setActor('Caner');
    expect(useBizde.getState().rejectGoalProposal()).toBe(true);
    expect(useBizde.getState().pendingGoalProposal).toBeNull();
    expect(useBizde.getState().personalGoals['Leyla']?.title).not.toBe('Spa & Akşam Yemeği');
  });
});


