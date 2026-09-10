// Minimal en/tr strings with t(lang, key). No react-i18next (PRD needs no
// plurals/ICU) — custom t() per expo-init-checklist §3.
export type Lang = 'tr' | 'en';

type Dict = { [k: string]: string | Dict };

const tr: Dict = {
  app: { name: 'Bizde' },
  pairing: {
    title: 'Eşinle eşleş',
    subtitle: 'Tek ortak hedef, tek çubuk. Borç-alacak yok.',
    namePlaceholder: 'Adın',
    createCode: 'Kod Üret',
    joinTitle: 'Partnerinin kodunu gir',
    joinCode: 'Koda Katıl',
    codeLabel: 'Eşleşme kodun',
    invalid: 'Önce adını yaz.',
    invalidCode: '6 haneli kodu gir.',
    wrongCode: 'Kod bulunamadı. Kodu kontrol et.',
  },
  home: {
    goal: 'Ortak hedef',
    addPoints: '+ Puan Ekle',
    thanks: 'Teşekkür Et',
    history: 'Son katkılar',
    empty: 'Henüz katkı yok. İlk puanı ekle!',
    modalTitle: 'Puan ekle',
    taskPlaceholder: 'Ne yaptın? (örn. Bulaşıkları yıkadı)',
    pointsPlaceholder: 'Puan (10-50)',
    save: 'Kaydet',
    cancel: 'Vazgeç',
    badPoints: 'Puan 10-50 arası olmalı.',
    thanksTitle: 'Takdir',
  },
  milestones: { m25: 'Kahve', m60: 'Film Gecesi', m100: 'Restoran' },
};

const en: Dict = {
  app: { name: 'Bizde' },
  pairing: {
    title: 'Pair with your partner',
    subtitle: 'One shared goal, one bar. No scorekeeping.',
    namePlaceholder: 'Your name',
    createCode: 'Generate Code',
    joinTitle: "Enter your partner's code",
    joinCode: 'Join with Code',
    codeLabel: 'Your pairing code',
    invalid: 'Enter your name first.',
    invalidCode: 'Enter the 6-digit code.',
    wrongCode: 'Code not found. Check the code.',
  },
  home: {
    goal: 'Shared goal',
    addPoints: '+ Add Points',
    thanks: 'Say Thanks',
    history: 'Recent contributions',
    empty: 'No contributions yet. Add the first points!',
    modalTitle: 'Add points',
    taskPlaceholder: 'What did you do? (e.g. Did the dishes)',
    pointsPlaceholder: 'Points (10-50)',
    save: 'Save',
    cancel: 'Cancel',
    badPoints: 'Points must be 10-50.',
    thanksTitle: 'Appreciation',
  },
  milestones: { m25: 'Coffee', m60: 'Movie Night', m100: 'Restaurant' },
};

const STRINGS: Record<Lang, Dict> = { tr, en };

function lookup(dict: Dict, parts: string[]): string | undefined {
  let cur: string | Dict = dict;
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    const next: string | Dict | undefined = cur[p];
    if (next === undefined) return undefined;
    cur = next;
  }
  return typeof cur === 'string' ? cur : undefined;
}

/** t('tr', 'home.save') → 'Kaydet'. Falls back to English, then the key. */
export function t(lang: Lang, key: string): string {
  const parts = key.split('.');
  return lookup(STRINGS[lang], parts) ?? lookup(en, parts) ?? key;
}

/** All leaf key paths — used by tests to assert en/tr parity. */
export function leafKeys(dict: Dict = tr, prefix = ''): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(dict)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.push(path);
    else out.push(...leafKeys(v, path));
  }
  return out;
}
