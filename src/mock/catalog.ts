// Default görev + ödül kataloğu (mock).
// Firestore'a taşınabilir şema: templates/{templateId} koleksiyonundaki
// dokümanlarla birebir — backend gelince bu dosya okunur, yazılmaz olur.

import type { Lang } from '@/i18n/strings';

export type { Lang };
export type TaskCategory = 'ev' | 'ilgi' | 'vakit' | 'plan';

export interface TaskTemplate {
  id: string;
  category: TaskCategory;
  tr: string;
  en: string;
  es?: string;
  de?: string;
  fr?: string;
  pt?: string;
  it?: string;
  defaultPoints: number;
  minPoints: number;
  maxPoints: number;
  custom?: boolean;
}

export interface RewardTemplate {
  id: string;
  tr: string;
  en: string;
  es?: string;
  de?: string;
  fr?: string;
  pt?: string;
  it?: string;
  thresholdPct: number;
  custom?: boolean;
}

export const CATEGORIES: TaskCategory[] = ['ev', 'ilgi', 'vakit', 'plan'];

export const TASK_TEMPLATES: TaskTemplate[] = [
  // 🏠 Ev
  {
    id: 'ev-bulasik',
    category: 'ev',
    tr: 'Bulaşıkları yıka',
    en: 'Do the dishes',
    es: 'Lavar los platos',
    de: 'Geschirr spülen',
    fr: 'Faire la vaisselle',
    pt: 'Lavar a louça',
    it: 'Lavare i piatti',
    defaultPoints: 15,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'ev-cop',
    category: 'ev',
    tr: 'Çöpü çıkar',
    en: 'Take out the trash',
    es: 'Sacar la basura',
    de: 'Müll rausbringen',
    fr: 'Sortir les poubelles',
    pt: 'Tirar o lixo',
    it: 'Portare fuori la spazzatura',
    defaultPoints: 10,
    minPoints: 10,
    maxPoints: 20,
  },
  {
    id: 'ev-market',
    category: 'ev',
    tr: 'Market alışverişi yap',
    en: 'Do the grocery run',
    es: 'Hacer la compra',
    de: 'Lebensmittel einkaufen',
    fr: 'Faire les courses',
    pt: 'Fazer compras de mercado',
    it: 'Fare la spesa',
    defaultPoints: 25,
    minPoints: 15,
    maxPoints: 40,
  },
  {
    id: 'ev-yemek',
    category: 'ev',
    tr: 'Yemek hazırla',
    en: 'Cook a meal',
    es: 'Cocinar una comida',
    de: 'Eine Mahlzeit kochen',
    fr: 'Préparer un repas',
    pt: 'Cozinhar uma refeição',
    it: 'Cucinare un pasto',
    defaultPoints: 30,
    minPoints: 20,
    maxPoints: 50,
  },
  {
    id: 'ev-camasir',
    category: 'ev',
    tr: 'Çamaşır yıka / katla',
    en: 'Laundry wash / fold',
    es: 'Lavar / doblar ropa',
    de: 'Wäsche waschen / falten',
    fr: 'Laver / plier le linge',
    pt: 'Lavar / dobrar roupas',
    it: 'Lavare / piegare il bucato',
    defaultPoints: 20,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'ev-supur',
    category: 'ev',
    tr: 'Süpür / mop at',
    en: 'Vacuum / mop floors',
    es: 'Aspirar / fregar el suelo',
    de: 'Saugen / Boden wischen',
    fr: 'Aspirer / passer la serpillière',
    pt: 'Aspirar / passar pano',
    it: 'Aspirare / passare lo straccio',
    defaultPoints: 20,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'ev-banyo',
    category: 'ev',
    tr: 'Banyo temizle',
    en: 'Clean the bathroom',
    es: 'Limpiar el baño',
    de: 'Badezimmer putzen',
    fr: 'Nettoyer la salle de bain',
    pt: 'Limpar o banheiro',
    it: 'Pulire il bagno',
    defaultPoints: 25,
    minPoints: 15,
    maxPoints: 40,
  },
  {
    id: 'ev-buzdolabi',
    category: 'ev',
    tr: 'Buzdolabını düzenle',
    en: 'Tidy the fridge',
    es: 'Organizar la nevera',
    de: 'Kühlschrank aufräumen',
    fr: 'Ranger le réfrigérateur',
    pt: 'Organizar a geladeira',
    it: 'Riordinare il frigorifero',
    defaultPoints: 20,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'ev-cop-geri',
    category: 'ev',
    tr: 'Geri dönüşüm kutusunu boşalt',
    en: 'Empty recycling bin',
    es: 'Vaciar el reciclaje',
    de: 'Altpapier/Wertstoffe leeren',
    fr: 'Vider le bac de recyclage',
    pt: 'Esvaziar a lixeira reciclável',
    it: 'Svuotare la raccolta differenziata',
    defaultPoints: 10,
    minPoints: 10,
    maxPoints: 20,
  },

  // 💖 İlgi
  {
    id: 'ilgi-kahve',
    category: 'ilgi',
    tr: 'Kahve hazırla',
    en: 'Make coffee',
    es: 'Preparar café',
    de: 'Kaffee kochen',
    fr: 'Préparer un café',
    pt: 'Fazer café',
    it: 'Preparare il caffè',
    defaultPoints: 15,
    minPoints: 10,
    maxPoints: 20,
  },
  {
    id: 'ilgi-telefonsuz',
    category: 'ilgi',
    tr: 'Telefonsuz 30 dakika',
    en: '30 min phone-free time',
    es: '30 min sin pantallas',
    de: '30 Min. ohne Smartphone',
    fr: '30 min sans téléphone',
    pt: '30 min sem celular',
    it: '30 min senza telefono',
    defaultPoints: 20,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'ilgi-not',
    category: 'ilgi',
    tr: 'Takdir notu yaz',
    en: 'Write an appreciation note',
    es: 'Escribir una nota de cariño',
    de: 'Liebe Nachricht schreiben',
    fr: 'Écrire un mot doux',
    pt: 'Escrever um bilhete carinhoso',
    it: 'Scrivere un biglietto affettuoso',
    defaultPoints: 15,
    minPoints: 10,
    maxPoints: 25,
  },
  {
    id: 'ilgi-sarki',
    category: 'ilgi',
    tr: 'Eşine şarkı / playlist hazırla',
    en: 'Make a playlist for partner',
    es: 'Crear lista de música para pareja',
    de: 'Playlist für Partner erstellen',
    fr: 'Créer une playlist pour son partenaire',
    pt: 'Criar playlist para o par',
    it: 'Creare una playlist per il partner',
    defaultPoints: 20,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'ilgi-masaj',
    category: 'ilgi',
    tr: '10 dk boyun / sırt masajı',
    en: '10 min neck / back massage',
    es: '10 min masaje cuello / espalda',
    de: '10 Min. Nacken-/Rückenmassage',
    fr: '10 min massage cou / dos',
    pt: '10 min massagem pescoço/costas',
    it: '10 min massaggio collo / schiena',
    defaultPoints: 25,
    minPoints: 15,
    maxPoints: 40,
  },
  {
    id: 'ilgi-surpriz',
    category: 'ilgi',
    tr: 'Küçük sürpriz hazırla',
    en: 'Prepare a small surprise',
    es: 'Preparar una pequeña sorpresa',
    de: 'Kleine Überraschung vorbereiten',
    fr: 'Préparer une petite surprise',
    pt: 'Preparar uma pequena surpresa',
    it: 'Preparare una piccola sorpresa',
    defaultPoints: 20,
    minPoints: 15,
    maxPoints: 35,
  },

  // ☕ Vakit
  {
    id: 'vakit-film-sec',
    category: 'vakit',
    tr: 'Akşam filmi / dizi seç',
    en: 'Pick a movie / show for tonight',
    es: 'Elegir película / serie para hoy',
    de: 'Film / Serie für heute Abend wählen',
    fr: 'Choisir un film / série pour ce soir',
    pt: 'Escolher filme / série para hoje',
    it: 'Scegliere un film / serie per stasera',
    defaultPoints: 10,
    minPoints: 10,
    maxPoints: 20,
  },
  {
    id: 'vakit-misir',
    category: 'vakit',
    tr: 'Film gecesi mısırı hazırla',
    en: 'Prep popcorn for movie night',
    es: 'Preparar palomitas para la peli',
    de: 'Popcorn für den Filmabend machen',
    fr: 'Préparer du pop-corn pour la soirée film',
    pt: 'Fazer pipoca para a noite de filme',
    it: 'Preparare i popcorn per la serata film',
    defaultPoints: 10,
    minPoints: 10,
    maxPoints: 20,
  },
  {
    id: 'vakit-yuruyus-plan',
    category: 'vakit',
    tr: 'Yürüyüş planla (yer + saat)',
    en: 'Plan a walk (place + time)',
    es: 'Planear un paseo (lugar + hora)',
    de: 'Spaziergang planen (Ort + Zeit)',
    fr: 'Planifier une promenade (lieu + heure)',
    pt: 'Planejar caminhada (local + hora)',
    it: 'Pianificare passeggiata (luogo + ora)',
    defaultPoints: 15,
    minPoints: 10,
    maxPoints: 25,
  },
  {
    id: 'vakit-kahvalti',
    category: 'vakit',
    tr: 'Hafta sonu kahvaltı hazırla',
    en: 'Prepare weekend breakfast',
    es: 'Preparar desayuno de fin de semana',
    de: 'Wochenend-Frühstück zubereiten',
    fr: 'Préparer le petit-déjeuner du week-end',
    pt: 'Preparar café da manhã de fim de semana',
    it: 'Preparare la colazione del weekend',
    defaultPoints: 25,
    minPoints: 15,
    maxPoints: 40,
  },
  {
    id: 'vakit-restoran',
    category: 'vakit',
    tr: 'Restoran araştır / rezerve et',
    en: 'Research & book a restaurant',
    es: 'Buscar y reservar un restaurante',
    de: 'Restaurant suchen & reservieren',
    fr: 'Trouver et réserver un restaurant',
    pt: 'Pesquisar e reservar restaurante',
    it: 'Cercare e prenotare un ristorante',
    defaultPoints: 20,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'vakit-fotograf',
    category: 'vakit',
    tr: 'Birlikte fotoğraf çek',
    en: 'Take a photo together',
    es: 'Tomar una foto juntos',
    de: 'Ein gemeinsames Foto machen',
    fr: 'Prendre une photo ensemble',
    pt: 'Tirar uma foto juntos',
    it: 'Fare una foto insieme',
    defaultPoints: 10,
    minPoints: 10,
    maxPoints: 20,
  },

  // 🗓️ Plan
  {
    id: 'plan-fatura',
    category: 'plan',
    tr: 'Faturaları öde',
    en: 'Pay the bills',
    es: 'Pagar las facturas',
    de: 'Rechnungen bezahlen',
    fr: 'Payer les factures',
    pt: 'Pagar as contas',
    it: 'Pagare le bollette',
    defaultPoints: 20,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'plan-hafta',
    category: 'plan',
    tr: 'Haftalık plan yap',
    en: 'Plan the week',
    es: 'Planificar la semana',
    de: 'Woche planen',
    fr: 'Planifier la semaine',
    pt: 'Planejar a semana',
    it: 'Pianificare la settimana',
    defaultPoints: 25,
    minPoints: 15,
    maxPoints: 35,
  },
  {
    id: 'plan-randevu',
    category: 'plan',
    tr: 'Doktor / diş randevusu al',
    en: 'Book doctor / dentist',
    es: 'Pedir cita médica / dentista',
    de: 'Arzt- / Zahnarzttermin machen',
    fr: 'Prendre rendez-vous médecin / dentiste',
    pt: 'Marcar médico / dentista',
    it: 'Prenotare medico / dentista',
    defaultPoints: 20,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'plan-bütce',
    category: 'plan',
    tr: 'Aylık bütçeyi gözden geçir',
    en: 'Review monthly budget',
    es: 'Revisar presupuesto mensual',
    de: 'Monatsbudget überprüfen',
    fr: 'Revoir le budget mensuel',
    pt: 'Revisar orçamento mensal',
    it: 'Controllare il budget mensile',
    defaultPoints: 25,
    minPoints: 15,
    maxPoints: 35,
  },
  {
    id: 'plan-tatil',
    category: 'plan',
    tr: 'Tatil / gezi araştır',
    en: 'Research a trip / vacation',
    es: 'Buscar viajes / vacaciones',
    de: 'Urlaub / Reise planen',
    fr: 'Rechercher un voyage / vacances',
    pt: 'Pesquisar viagem / férias',
    it: 'Cercare una vacanza / viaggio',
    defaultPoints: 20,
    minPoints: 10,
    maxPoints: 30,
  },
  {
    id: 'plan-egzersiz',
    category: 'plan',
    tr: 'Haftalık spor planını yap',
    en: 'Plan weekly workout schedule',
    es: 'Planificar entrenamientos de la semana',
    de: 'Wöchentlichen Trainingsplan erstellen',
    fr: 'Planifier les séances de sport',
    pt: 'Planejar treinos da semana',
    it: 'Pianificare gli allenamenti settimanali',
    defaultPoints: 15,
    minPoints: 10,
    maxPoints: 25,
  },
];

export const REWARD_TEMPLATES: RewardTemplate[] = [
  {
    id: 'r25-kahve',
    tr: 'Kahve',
    en: 'Coffee',
    es: 'Café',
    de: 'Kaffee',
    fr: 'Café',
    pt: 'Café',
    it: 'Caffè',
    thresholdPct: 25,
  },
  {
    id: 'r60-film',
    tr: 'Film Gecesi',
    en: 'Movie Night',
    es: 'Noche de Película',
    de: 'Filmabend',
    fr: 'Soirée Film',
    pt: 'Noite de Cinema',
    it: 'Serata Film',
    thresholdPct: 60,
  },
  {
    id: 'r60-kahvalti',
    tr: 'Dışarıda kahvaltı',
    en: 'Breakfast out',
    es: 'Desayuno fuera',
    de: 'Frühstücken gehen',
    fr: 'Petit-déjeuner dehors',
    pt: 'Café da manhã fora',
    it: 'Colazione fuori',
    thresholdPct: 60,
  },
  {
    id: 'r100-restoran',
    tr: 'Restoran',
    en: 'Restaurant',
    es: 'Restaurante',
    de: 'Restaurant',
    fr: 'Restaurant',
    pt: 'Restaurante',
    it: 'Ristorante',
    thresholdPct: 100,
  },
  {
    id: 'r100-kacamak',
    tr: 'Günbirlik kaçamak',
    en: 'Day getaway',
    es: 'Escapada de un día',
    de: 'Tagesausflug',
    fr: 'Escapade d’un jour',
    pt: 'Passeio de um dia',
    it: 'Fuga di un giorno',
    thresholdPct: 100,
  },
];

export function templateTitle(t: TaskTemplate, lang: Lang): string {
  return t[lang] ?? t.en ?? t.tr;
}

export function rewardTitle(r: RewardTemplate, lang: Lang): string {
  return r[lang] ?? r.en ?? r.tr;
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
