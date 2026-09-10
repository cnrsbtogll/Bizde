import { recentActivities, totalPoints, useBizde } from '@/store';
import { APPRECIATION_POINTS } from '@/lib/progress';

// Firebase needs a real backend + ESM the Jest transform can't parse;
// the seam is one function, so mock it and test store logic for real.
jest.mock('@/firebase', () => ({
  signInAnon: jest.fn(async () => null),
}));

beforeEach(() => {
  useBizde.getState().reset();
});

describe('pairing', () => {
  it('signIn + createCode pairs with a 6-digit code', () => {
    useBizde.getState().signIn('Mert');
    const code = useBizde.getState().createCode();
    expect(code).toMatch(/^\d{6}$/);
    const s = useBizde.getState();
    expect(s.isPaired).toBe(true);
    expect(s.coupleId).toBe(`couple-${code}`);
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

describe('activities', () => {
  it('addTask validates range and accumulates the shared total', () => {
    useBizde.getState().signIn('Mert');
    useBizde.getState().createCode();
    expect(useBizde.getState().addTask('Bulaşıkları yıkadı', 20)).toBe(true);
    expect(useBizde.getState().addTask('x', 5)).toBe(false);
    expect(useBizde.getState().addTask('', 20)).toBe(false);
    useBizde.getState().appreciate();
    expect(totalPoints(useBizde.getState().activities)).toBe(20 + APPRECIATION_POINTS);
  });
  it('recentActivities returns at most the last 5', () => {
    useBizde.getState().signIn('Mert');
    for (let i = 0; i < 7; i++) useBizde.getState().addTask(`iş ${i}`, 10);
    const recent = recentActivities(useBizde.getState().activities);
    expect(recent).toHaveLength(5);
    expect(recent[0]?.title).toBe('iş 6');
  });
});
