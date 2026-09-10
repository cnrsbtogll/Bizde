import {
  genPairingCode,
  progressFraction,
  reachedMilestones,
  validPairingCode,
  validTaskPoints,
} from '@/lib/progress';

describe('progressFraction', () => {
  it('computes share of target', () => {
    expect(progressFraction(100, 400)).toBe(0.25);
    expect(progressFraction(400, 400)).toBe(1);
  });
  it('clamps to [0, 1] and guards bad targets', () => {
    expect(progressFraction(500, 400)).toBe(1);
    expect(progressFraction(-5, 400)).toBe(0);
    expect(progressFraction(10, 0)).toBe(0);
    expect(progressFraction(10, -4)).toBe(0);
  });
});

describe('reachedMilestones', () => {
  it('unlocks %25 at 100/400 and all at 400/400', () => {
    expect(reachedMilestones(100, 400)).toEqual([25]);
    expect(reachedMilestones(240, 400)).toEqual([25, 60]);
    expect(reachedMilestones(400, 400)).toEqual([25, 60, 100]);
    expect(reachedMilestones(0, 400)).toEqual([]);
  });
});

describe('validTaskPoints', () => {
  it('accepts integers in [10, 50] only', () => {
    expect(validTaskPoints(10)).toBe(true);
    expect(validTaskPoints(50)).toBe(true);
    expect(validTaskPoints(9)).toBe(false);
    expect(validTaskPoints(51)).toBe(false);
    expect(validTaskPoints(20.5)).toBe(false);
    expect(validTaskPoints('20')).toBe(false);
    expect(validTaskPoints(NaN)).toBe(false);
  });
});

describe('pairing codes', () => {
  it('generates 6-digit codes', () => {
    expect(genPairingCode(() => 0)).toBe('100000');
    expect(genPairingCode(() => 0.999999)).toMatch(/^\d{6}$/);
  });
  it('validates code shape', () => {
    expect(validPairingCode('123456')).toBe(true);
    expect(validPairingCode('12345')).toBe(false);
    expect(validPairingCode('abcdef')).toBe(false);
    expect(validPairingCode(123456)).toBe(false);
  });
});
