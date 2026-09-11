import {
  historyActivities,
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
