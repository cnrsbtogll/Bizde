// Minimal en/tr strings with t(lang, key). No react-i18next (PRD needs no
// plurals/ICU) — custom t() per expo-init-checklist §3.
export type Lang = 'tr' | 'en';

type Dict = { [k: string]: string | Dict };

const tr: Dict = {
  app: { name: 'Bizde' },
  pairing: {
    title: 'Eşinle eşleş',
    subtitle: 'Tek ortak hedef, tek çubuk. Borç-alacak yok.',
    wifeLabel: '👩 Kadın / Eş',
    wifePlaceholder: 'Kadın / Eş Adı (örn. Leyla)',
    husbandLabel: '👨 Erkek / Koca',
    husbandPlaceholder: 'Erkek / Koca Adı (örn. Ahmet)',
    rolesHint: '💡 Rol ve hedeflerin doğru eşleşmesi için lütfen kadın ve erkek adını ilgili alana yazın.',
    createCode: 'Kod Üret',
    joinTitle: 'Partnerinin kodunu gir',
    joinCode: 'Koda Katıl',
    codeLabel: 'Eşleşme kodun',
    invalid: 'İki adı da yaz.',
    invalidCode: '6 haneli kodu gir.',
    wrongCode: 'Kod bulunamadı. Kodu kontrol et.',
  },
  home: {
    goal: 'Ortak hedef',
    addPoints: '+ Görev',
    thanks: 'Teşekkür Et',
    history: 'Geçmiş',
    pending: 'Onay bekleyenler',
    empty: 'Henüz katkı yok. İlk görevi seç!',
    emptyPending: 'Bekleyen iddia yok.',
    modalTitle: 'Görev seç',
    customTitle: 'Kendi kartın',
    taskPlaceholder: 'Kart başlığı (örn. Balkonu yıka)',
    pointsPlaceholder: 'Puan (10-50)',
    save: 'Kaydet',
    claim: 'Yaptım',
    approve: 'Onayla',
    reject: 'Reddet',
    cancel: 'Vazgeç',
    badPoints: 'Puan 10-50 arası olmalı.',
    thanksTitle: 'Teşekkür',
    claimedBy: 'iddia',
    waitingApproval: 'onay bekliyor',
    approvedBy: 'onayladı',
    rejected: 'olmadı',
    actorLabel: 'Ben',
    newGoal: 'Yeni hedef başlat',
    goalDone: 'Hedef doldu! Ödül açıldı.',
    goalTitlePlaceholder: 'Yeni hedef (örn. Birlikte spor)',
    goalTargetPlaceholder: 'Hedef puan (100-600)',
    rewardLabel: 'Ödül',
    start: 'Başlat',
    pendingNote: 'Bekleyen puanlar bara dahil değil.',
    customCategory: 'Kategori',
    tabSelf: 'Ben Yaptım',
    tabPartner: 'Eşinden Rica Et',
    requestButton: 'Rica Et',
    incomingRequests: 'Sana Gelen İstekler',
    requestedBy: 'senden rica etti',
    waitingCompletion: 'yapması bekleniyor',
    markDone: 'Yaptım!',
    completed: 'tamamladı',
    customRewardTitle: 'Kendi Ödülünüz',
    rewardPlaceholder: 'Ödül başlığı (örn. Hafta sonu masajı)',
    addReward: 'Ödül Ekle',
    activeReward: 'Büyük Ödül',
    editGoal: 'Hedefi Düzenle',
    updateGoal: 'Hedefi Güncelle',
    adjustGoal: 'Hedefi Artır / Azalt',
    editTaskPoints: 'Puanı Düzenle',
    minMaxPointsNotice: 'Puan 10 - 50 arasında olmalıdır',
    milestonesTitle: 'Aşama Hedefleri',
  },
  cats: { ev: 'Ev', ilgi: 'İlgi', vakit: 'Vakit', plan: 'Plan' },
  milestones: { m25: 'Kahve', m60: 'Film Gecesi', m100: 'Restoran' },
};

const en: Dict = {
  app: { name: 'Bizde' },
  pairing: {
    title: 'Pair with your partner',
    subtitle: 'One shared goal, one bar. No scorekeeping.',
    wifeLabel: '👩 Wife / Female',
    wifePlaceholder: 'Wife / Female Name (e.g. Jane)',
    husbandLabel: '👨 Husband / Male',
    husbandPlaceholder: 'Husband / Male Name (e.g. John)',
    rolesHint: '💡 To ensure goals and roles match correctly, please enter wife and husband names in their respective fields.',
    createCode: 'Generate Code',
    joinTitle: "Enter your partner's code",
    joinCode: 'Join with Code',
    codeLabel: 'Your pairing code',
    invalid: 'Enter both names.',
    invalidCode: 'Enter the 6-digit code.',
    wrongCode: 'Code not found. Check the code.',
  },
  home: {
    goal: 'Shared goal',
    addPoints: '+ Task',
    thanks: 'Say Thanks',
    history: 'History',
    pending: 'Waiting approval',
    empty: 'No contributions yet. Claim the first task!',
    emptyPending: 'No pending claims.',
    modalTitle: 'Pick a task',
    customTitle: 'Your own card',
    taskPlaceholder: 'Card title (e.g. Cleaned the balcony)',
    pointsPlaceholder: 'Points (10-50)',
    save: 'Save',
    claim: 'I did it',
    approve: 'Approve',
    reject: 'Reject',
    cancel: 'Cancel',
    badPoints: 'Points must be 10-50.',
    thanksTitle: 'Appreciation',
    claimedBy: 'claimed',
    waitingApproval: 'waiting approval',
    approvedBy: 'approved',
    rejected: 'declined',
    actorLabel: 'Me',
    newGoal: 'Start new goal',
    goalDone: 'Goal reached! Reward unlocked.',
    goalTitlePlaceholder: 'New goal (e.g. Exercise together)',
    goalTargetPlaceholder: 'Target points (100-600)',
    rewardLabel: 'Reward',
    start: 'Start',
    pendingNote: 'Pending points are not in the bar yet.',
    customCategory: 'Category',
    tabSelf: 'I Did It',
    tabPartner: 'Ask Partner',
    requestButton: 'Request',
    incomingRequests: 'Requests For You',
    requestedBy: 'requested from you',
    waitingCompletion: 'waiting for completion',
    markDone: 'I Did It!',
    completed: 'completed',
    customRewardTitle: 'Custom Reward',
    rewardPlaceholder: 'Reward title (e.g. Weekend massage)',
    addReward: 'Add Reward',
    activeReward: 'Grand Reward',
    editGoal: 'Edit Goal',
    updateGoal: 'Update Goal',
    adjustGoal: 'Adjust Target',
    editTaskPoints: 'Edit Points',
    minMaxPointsNotice: 'Points must be between 10 and 50',
    milestonesTitle: 'Milestones',
  },
  cats: { ev: 'Home', ilgi: 'Care', vakit: 'Time', plan: 'Plans' },
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
