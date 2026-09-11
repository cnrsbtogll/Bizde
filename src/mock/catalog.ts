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
  custom?: boolean;
}

export const CATEGORIES: TaskCategory[] = ['ev', 'ilgi', 'vakit', 'plan'];

export const TASK_TEMPLATES: TaskTemplate[] = [
  // 🏠 Ev
  { id: 'ev-bulasik',   category: 'ev', tr: 'Bulaşıkları yıka',            en: 'Do the dishes',             defaultPoints: 15, minPoints: 10, maxPoints: 30 },
  { id: 'ev-cop',       category: 'ev', tr: 'Çöpü çıkar',                  en: 'Take out the trash',         defaultPoints: 10, minPoints: 10, maxPoints: 20 },
  { id: 'ev-market',    category: 'ev', tr: 'Market alışverişi yap',        en: 'Do the grocery run',         defaultPoints: 25, minPoints: 15, maxPoints: 40 },
  { id: 'ev-yemek',     category: 'ev', tr: 'Yemek hazırla',                en: 'Cook a meal',                defaultPoints: 30, minPoints: 20, maxPoints: 50 },
  { id: 'ev-camasir',   category: 'ev', tr: 'Çamaşır yıka / katla',         en: 'Laundry wash / fold',        defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'ev-supur',     category: 'ev', tr: 'Süpür / mop at',               en: 'Vacuum / mop floors',        defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'ev-banyo',     category: 'ev', tr: 'Banyo temizle',                en: 'Clean the bathroom',         defaultPoints: 25, minPoints: 15, maxPoints: 40 },
  { id: 'ev-buzdolabi', category: 'ev', tr: 'Buzdolabını düzenle',          en: 'Tidy the fridge',            defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'ev-cop-geri',  category: 'ev', tr: 'Geri dönüşüm kutusunu boşalt', en: 'Empty recycling bin',        defaultPoints: 10, minPoints: 10, maxPoints: 20 },

  // 💖 İlgi
  { id: 'ilgi-kahve',      category: 'ilgi', tr: 'Kahve hazırla',                en: 'Make coffee',                   defaultPoints: 15, minPoints: 10, maxPoints: 20 },
  { id: 'ilgi-telefonsuz', category: 'ilgi', tr: 'Telefonsuz 30 dakika',          en: '30 min phone-free time',         defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'ilgi-not',        category: 'ilgi', tr: 'Takdir notu yaz',               en: 'Write an appreciation note',     defaultPoints: 15, minPoints: 10, maxPoints: 25 },
  { id: 'ilgi-sarki',      category: 'ilgi', tr: 'Eşine şarkı / playlist hazırla', en: 'Make a playlist for partner',   defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'ilgi-masaj',      category: 'ilgi', tr: '10 dk boyun / sırt masajı',     en: '10 min neck / back massage',     defaultPoints: 25, minPoints: 15, maxPoints: 40 },
  { id: 'ilgi-surpriz',    category: 'ilgi', tr: 'Küçük sürpriz hazırla',          en: 'Prepare a small surprise',       defaultPoints: 20, minPoints: 15, maxPoints: 35 },

  // ☕ Vakit
  { id: 'vakit-film-sec',  category: 'vakit', tr: 'Akşam filmi / dizi seç',        en: 'Pick a movie / show for tonight', defaultPoints: 10, minPoints: 10, maxPoints: 20 },
  { id: 'vakit-misir',     category: 'vakit', tr: 'Film gecesi mısırı hazırla',    en: 'Prep popcorn for movie night',    defaultPoints: 10, minPoints: 10, maxPoints: 20 },
  { id: 'vakit-yuruyus-plan', category: 'vakit', tr: 'Yürüyüş planla (yer + saat)', en: 'Plan a walk (place + time)',     defaultPoints: 15, minPoints: 10, maxPoints: 25 },
  { id: 'vakit-kahvalti',  category: 'vakit', tr: 'Hafta sonu kahvaltı hazırla',   en: 'Prepare weekend breakfast',       defaultPoints: 25, minPoints: 15, maxPoints: 40 },
  { id: 'vakit-restoran',  category: 'vakit', tr: 'Restoran araştır / rezerve et', en: 'Research & book a restaurant',    defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'vakit-fotograf',  category: 'vakit', tr: 'Birlikte fotoğraf çek',         en: 'Take a photo together',           defaultPoints: 10, minPoints: 10, maxPoints: 20 },

  // 🗓️ Plan
  { id: 'plan-fatura',    category: 'plan', tr: 'Faturaları öde',            en: 'Pay the bills',            defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'plan-hafta',     category: 'plan', tr: 'Haftalık plan yap',         en: 'Plan the week',            defaultPoints: 25, minPoints: 15, maxPoints: 35 },
  { id: 'plan-randevu',   category: 'plan', tr: 'Doktor / diş randevusu al', en: 'Book doctor / dentist',    defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'plan-bütce',     category: 'plan', tr: 'Aylık bütçeyi gözden geçir', en: 'Review monthly budget',  defaultPoints: 25, minPoints: 15, maxPoints: 35 },
  { id: 'plan-tatil',     category: 'plan', tr: 'Tatil / gezi araştır',      en: 'Research a trip / vacation', defaultPoints: 20, minPoints: 10, maxPoints: 30 },
  { id: 'plan-egzersiz',  category: 'plan', tr: 'Haftalık spor planını yap', en: 'Plan weekly workout schedule', defaultPoints: 15, minPoints: 10, maxPoints: 25 },
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
  id?: string,
  custom: TaskTemplate[] = [],
): TaskTemplate | undefined {
  if (!id) return undefined;
  return custom.find((c) => c.id === id) ?? TASK_TEMPLATES.find((c) => c.id === id);
}

export function findReward(
  id?: string,
  custom: RewardTemplate[] = [],
): RewardTemplate | undefined {
  if (!id) return undefined;
  return custom.find((c) => c.id === id) ?? REWARD_TEMPLATES.find((c) => c.id === id);
}

export type RewardAudience = 'ortak' | 'kadin_icin' | 'erkek_icin';

export interface GoalPackage {
  id: string;
  badge: string;
  titleTr: string;
  titleEn: string;
  targetPoints: number;
  audience: RewardAudience;
  m25Tr?: string;
  m25En?: string;
  m60Tr?: string;
  m60En?: string;
}

export const GOAL_PACKAGES: GoalPackage[] = [
  // Kadın / Partner Paketleri
  {
    id: 'pkg-kadin-romantik',
    badge: '🍷',
    titleTr: 'Romantik Kaçamak & Şımartma',
    titleEn: 'Romantic Getaway & Pampering',
    targetPoints: 250,
    audience: 'kadin_icin',
    m25Tr: 'En Sevdiği Tatlı & Çiçek',
    m25En: 'Favorite Dessert & Flowers',
    m60Tr: 'Mum Işığında Baş Başa Akşam Yemeği',
    m60En: 'Candlelight Dinner Together',
  },
  {
    id: 'pkg-kadin-spa',
    badge: '💆‍♀️',
    titleTr: 'Hafta Sonu Spa & Masaj Günü',
    titleEn: 'Weekend Spa & Massage Day',
    targetPoints: 200,
    audience: 'kadin_icin',
    m25Tr: 'Sürpriz Kahve & Favori Tatlı',
    m25En: 'Surprise Coffee & Dessert',
    m60Tr: 'Rahatlatıcı Ayak / Sırt Masajı',
    m60En: 'Relaxing Foot / Back Massage',
  },
  {
    id: 'pkg-kadin-alisveris',
    badge: '🛍️',
    titleTr: 'Baş Başa Alışveriş & Akşam Yemeği',
    titleEn: 'Shopping & Dinner Together',
    targetPoints: 180,
    audience: 'kadin_icin',
    m25Tr: 'Kahve Molası',
    m25En: 'Coffee Break',
    m60Tr: 'Şık Bir Restoranda Yemek',
    m60En: 'Dinner at a Nice Restaurant',
  },

  // Erkek / Partner Paketleri
  {
    id: 'pkg-erkek-oyun',
    badge: '🎮',
    titleTr: '3 Saat Kesintisiz PS & Masaj Gecesi',
    titleEn: '3h PS Gaming & Massage Night',
    targetPoints: 200,
    audience: 'erkek_icin',
    m25Tr: 'Favori Atıştırmalık & İçecek',
    m25En: 'Favorite Snack & Drink',
    m60Tr: '3 Saat Kesintisiz PS / Oyun Keyfi',
    m60En: '3 Hours Uninterrupted PS / Gaming',
  },
  {
    id: 'pkg-erkek-mac',
    badge: '⚽',
    titleTr: 'Maç & Arkadaş Gecesi Keyfi',
    titleEn: 'Match & Friends Night',
    targetPoints: 150,
    audience: 'erkek_icin',
    m25Tr: 'Maç Önü Atıştırmalık Hazırlığı',
    m25En: 'Pre-game Snack Prep',
    m60Tr: 'Rahat Maç İzleme Saati',
    m60En: 'Undisturbed Match Time',
  },
  {
    id: 'pkg-erkek-ozel',
    badge: '🔥',
    titleTr: 'Rahatlatıcı Masaj & Özel Gece',
    titleEn: 'Relaxing Massage & Special Night',
    targetPoints: 220,
    audience: 'erkek_icin',
    m25Tr: 'Sıcak Duş & Çay / Kahve Servisi',
    m25En: 'Hot Shower & Tea / Coffee',
    m60Tr: 'Omuz ve Sırt Masajı',
    m60En: 'Shoulder & Back Massage',
  },

  // Ortak Paketler
  {
    id: 'pkg-ortak-tatil',
    badge: '🥂',
    titleTr: 'Birlikte Mini Tatil & Konser',
    titleEn: 'Weekend Getaway & Concert',
    targetPoints: 400,
    audience: 'ortak',
    m25Tr: 'Kahve & Tatlı Kaçamağı',
    m25En: 'Coffee & Dessert Break',
    m60Tr: 'Sinema & Dışarıda Akşam Yemeği',
    m60En: 'Movie & Dinner Out',
  },
  {
    id: 'pkg-ortak-dinlenme',
    badge: '🛋️',
    titleTr: 'Evde Sıfır İş / Pazar Huzuru',
    titleEn: 'Zero Chores / Sunday Chill',
    targetPoints: 250,
    audience: 'ortak',
    m25Tr: 'Yatakta Kahvaltı Servisi',
    m25En: 'Breakfast in Bed',
    m60Tr: 'Favori Dizi Maratonu & Pizza',
    m60En: 'TV Show Marathon & Pizza',
  },
];

export interface AudienceOption {
  key: RewardAudience;
  labelTr: string;
  labelEn: string;
  badge: string;
}

export const AUDIENCE_OPTIONS: AudienceOption[] = [
  { key: 'ortak', labelTr: 'Ortak Ödüller', labelEn: 'Couple Rewards', badge: '🥂' },
  { key: 'kadin_icin', labelTr: 'Kadın İçin', labelEn: 'For Her', badge: '🍷' },
  { key: 'erkek_icin', labelTr: 'Erkek İçin', labelEn: 'For Him', badge: '🎮' },
];

export interface MilestoneSuggestions {
  m25: { tr: string; en: string }[];
  m60: { tr: string; en: string }[];
  m100: { tr: string; en: string }[];
}

export const SUGGESTIONS_BY_AUDIENCE: Record<RewardAudience, MilestoneSuggestions> = {
  ortak: {
    m25: [
      { tr: 'Kahve & Tatlı Kaçamağı', en: 'Coffee & Dessert Break' },
      { tr: 'Birlikte Dondurma Yürüyüşü', en: 'Ice Cream Walk' },
    ],
    m60: [
      { tr: 'Sinema & Pizza Gecesi', en: 'Movie & Pizza Night' },
      { tr: 'Birlikte Yeni Bir Restoran', en: 'Trying a New Restaurant' },
    ],
    m100: [
      { tr: 'Birlikte Hafta Sonu Tatili', en: 'Weekend Trip Together' },
      { tr: 'Konser & Lüks Akşam Yemeği', en: 'Concert & Fancy Dinner' },
      { tr: 'Tam Gün Sıfır Ev İşi / Pazar Huzuru', en: 'Zero Chores Sunday Chill' },
    ],
  },
  kadin_icin: {
    m25: [
      { tr: 'En Sevdiği Çiçek & Not', en: 'Her Favorite Flowers & Note' },
      { tr: 'Sürpriz Kahve & Favori Tatlısı', en: 'Surprise Coffee & Pastry' },
    ],
    m60: [
      { tr: 'Mum Işığında Baş Başa Akşam Yemeği', en: 'Candlelight Dinner Together' },
      { tr: 'Baş Başa Şarap & Kokteyl Gecesi', en: 'Wine & Cocktail Night' },
    ],
    m100: [
      { tr: 'Hafta Sonu Spa & Masaj Kaçamağı', en: 'Weekend Spa & Massage Getaway' },
      { tr: 'İstediği Şehirde Mini Tatil', en: 'Mini Vacation She Chooses' },
      { tr: 'Bütün Gün Prenses Muamelesi', en: 'All-Day Princess Treatment' },
    ],
  },
  erkek_icin: {
    m25: [
      { tr: 'Favori Atıştırmalık & Soğuk İçecek', en: 'Favorite Snacks & Cold Drink' },
      { tr: 'Günün Yorgunluğu İçin Sırt Masajı', en: 'Relaxing Back Massage' },
    ],
    m60: [
      { tr: '3 Saat Kesintisiz PS / Oyun Keyfi', en: '3h Uninterrupted PS / Gaming' },
      { tr: 'Arkadaşlarla Rahat Maç Gecesi', en: 'Game Night with Friends' },
    ],
    m100: [
      { tr: 'Rahatlatıcı Masaj & Özel Gece', en: 'Relaxing Massage & Special Night' },
      { tr: 'Tam Gün Kesintisiz Oyun / Hobi Günü', en: 'All-Day Gaming / Hobby Day' },
      { tr: 'Özel Akşam Menüsü & Gece Keyfi', en: 'Special Dinner & Night Chill' },
    ],
  },
};
