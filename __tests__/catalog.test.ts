import {
  CATEGORIES,
  REWARD_TEMPLATES,
  TASK_TEMPLATES,
  clampPoints,
  findTemplate,
} from '@/mock/catalog';

describe('catalog', () => {
  it('covers every category with at least two cards', () => {
    for (const c of CATEGORIES) {
      expect(TASK_TEMPLATES.filter((t) => t.category === c).length).toBeGreaterThanOrEqual(2);
    }
  });
  it('all cards have sane ranges inside 10-50', () => {
    for (const t of TASK_TEMPLATES) {
      expect(t.minPoints).toBeGreaterThanOrEqual(10);
      expect(t.maxPoints).toBeLessThanOrEqual(50);
      expect(t.defaultPoints).toBeGreaterThanOrEqual(t.minPoints);
      expect(t.defaultPoints).toBeLessThanOrEqual(t.maxPoints);
      expect(t.tr.length).toBeGreaterThan(0);
      expect(t.en.length).toBeGreaterThan(0);
    }
  });
  it('rewards map to milestone thresholds', () => {
    const pcts = new Set(REWARD_TEMPLATES.map((r) => r.thresholdPct));
    expect(pcts.has(25)).toBe(true);
    expect(pcts.has(60)).toBe(true);
    expect(pcts.has(100)).toBe(true);
  });
  it('clampPoints squeezes into the card range', () => {
    const t = findTemplate('ev-cop') as NonNullable<ReturnType<typeof findTemplate>>;
    expect(clampPoints(99, t)).toBe(t.maxPoints);
    expect(clampPoints(1, t)).toBe(t.minPoints);
    expect(clampPoints(15, t)).toBe(15);
  });
});
