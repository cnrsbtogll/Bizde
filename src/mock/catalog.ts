// Default görev + ödül kataloğu (mock).
// Firestore'a taşınabilir şema: templates/{templateId} koleksiyonundaki
// dokümanlarla birebir — backend gelince bu dosya okunur, yazılmaz olur.
// ponytail: başlıklar tr/en inline; ayrı locale dosyası yok (kart sayısı küçük).

export type Lang = 'tr' | 'en';
export type TaskCategory = 'ev' | 'ilgi' | 'vakit' | 'plan';

export interface TaskTemplate {
  id: string;
  category: TaskCategory;
  tr: string;
  en: string;
  defaultPoints: number;
  minPoints: number;
  maxPoints: number;
  custom?: boolean;
}

export interface RewardTemplate {
  id: string;
  tr: string;
  en: string;
  thresholdPct: number;
}

export const CATEGORIES: TaskCategory[] = ['ev', 'ilgi', 'vakit', 'plan'];

export const TASK_TEMPLATES: TaskTemplate[] = [
  { id: 'ev-bulasik', category: 'ev', tr: 'Bulaşıkları yıka', en: 'Do the dishes', defaultPoints: 15, minPoints: 10, maxPoints: 30 },
  { id: 'ev-cop', category: 'ev', tr: 'Çöpü çıkar', en: 'Take out the trash', defaultPoints: 10, minPoints: 10, maxPoints: 20 },
  { id: 'ev-market', category: 'ev', tr: 'Market alışverişi yap', en: 'Do the grocery run', defaultPoints: 25, minPoints: 15, maxPoints: 40 },
  { id: 'ev-yemek', category: 'ev', tr: 'Yemek hazırla', en: 'Cook a meal', defaultPoints: 30, minPoints: 20, maxPoints: 50 },
  { id: 'ev-camasir', category: 'ev', tr: 'Çamaşır yıka / katla', en: 'Laundry wash / fold', defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'ilgi-kahve', category: 'ilgi', tr: 'Kahve hazırla', en: 'Make coffee', defaultPoints: 15, minPoints: 10, maxPoints: 20 },
  { id: 'ilgi-telefonsuz', category: 'ilgi', tr: 'Telefonsuz 30 dakika', en: '30 min phone-free time', defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'ilgi-not', category: 'ilgi', tr: 'Takdir notu yaz', en: 'Write an appreciation note', defaultPoints: 15, minPoints: 10, maxPoints: 25 },
  { id: 'vakit-yuruyus', category: 'vakit', tr: 'Birlikte yürüyüş', en: 'Walk together', defaultPoints: 25, minPoints: 15, maxPoints: 40 },
  { id: 'vakit-film', category: 'vakit', tr: 'Film gecesi kur', en: 'Set up movie night', defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'plan-fatura', category: 'plan', tr: 'Faturaları öde', en: 'Pay the bills', defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'plan-hafta', category: 'plan', tr: 'Haftalık plan yap', en: 'Plan the week', defaultPoints: 25, minPoints: 15, maxPoints: 35 },
];

export const REWARD_TEMPLATES: RewardTemplate[] = [
  { id: 'r25-kahve', tr: 'Kahve', en: 'Coffee', thresholdPct: 25 },
  { id: 'r60-film', tr: 'Film Gecesi', en: 'Movie Night', thresholdPct: 60 },
  { id: 'r60-kahvalti', tr: 'Dışarıda kahvaltı', en: 'Breakfast out', thresholdPct: 60 },
  { id: 'r100-restoran', tr: 'Restoran', en: 'Restaurant', thresholdPct: 100 },
  { id: 'r100-kacamak', tr: 'Günbirlik kaçamak', en: 'Day getaway', thresholdPct: 100 },
];

export function templateTitle(t: TaskTemplate, lang: Lang): string {
  return lang === 'tr' ? t.tr : t.en;
}

export function rewardTitle(r: RewardTemplate, lang: Lang): string {
  return lang === 'tr' ? r.tr : r.en;
}

/** Puanı kart aralığına sıkıştır (custom kartlar dahil). */
export function clampPoints(n: number, t: Pick<TaskTemplate, 'minPoints' | 'maxPoints'>): number {
  if (!Number.isFinite(n)) return t.minPoints;
  return Math.min(t.maxPoints, Math.max(t.minPoints, Math.round(n)));
}

export function findTemplate(
  id: string,
  custom: TaskTemplate[] = [],
): TaskTemplate | undefined {
  return custom.find((c) => c.id === id) ?? TASK_TEMPLATES.find((c) => c.id === id);
}
