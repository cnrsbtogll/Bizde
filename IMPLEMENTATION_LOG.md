# Bizde — implementation log (rnengineering)

## 2026-09-10 — MVP slice 1: pairing + shared-goal home, local-first
- PRD: `strategy/2026-W38-prd.md` (2 screens, Firebase, Zustand, Expo SDK 51+).
- Scaffold was blank-typescript on Expo 57 / RN 0.86 — kept it (newer than PRD
  floor; no downgrade churn). `expo-doctor` 21/21 green.
- Deliberate deviations (ponytail):
  - No `expo-router` for 2 screens — `App.tsx` switches on `isPaired`.
    Add a router only if screens grow past 3.
  - No `react-i18next` — custom `t(lang, key)` in `src/i18n/strings.ts`
    (no plurals/ICU in PRD). en/tr parity enforced by test.
  - Firebase lazy + optional: no `EXPO_PUBLIC_FIREBASE_*` env → local-only
    demo mode. Firestore pairing/sync plugs into the same store actions later.
  - No component-render tests — pure-logic suites only (store/progress/i18n);
    Firebase seam mocked in `store.test.ts` (Firebase 12 ESM isn't Jest-parseable).
- Files: `App.tsx`, `src/store.ts`, `src/firebase.ts`, `src/lib/progress.ts`,
  `src/i18n/strings.ts`, `src/components/PairingScreen.tsx`,
  `src/components/HomeScreen.tsx`, `__tests__/{progress,i18n,store}.test.ts`.
- Gates: `tsc --noEmit` 0 · `eslint --max-warnings=0` 0 ·
  `jest --ci --runInBand` 13/13 · `expo-doctor` 21/21.
- Toolchain notes: needs `@react-native/jest-preset@0.86.3` (matches RN 0.86;
  latest 0.87 breaks on `react-native/setup-env`); tsconfig needs explicit
  `"types": ["jest"]` + `"ignoreDeprecations": "6.0"` under TS 6.

## 2026-09-11 — Slice 2: katalog + iddia/onay + hedef döngüsü (mock, local)
- 12 default görev kartı (4 kategori: ev/ilgi/vakit/plan) + 5 ödül:
  `src/mock/catalog.ts` — tipler Firestore `templates/*` ile birebir.
- İddia + onay akışı (B): `claimTask` pending açar, bara girmez;
  `approveActivity` kart aralığına clamp'ler, `rejectActivity` sessiz
  (geçmişte gri). Takdir anında onaylı.
- Stacked bar: kişi başına renk (teal/turuncu), isim+puan etiketi;
  bekleyenler bar altında ayrı listede.
- Hedef döngüsü: 400 dolunca ödül banner + `startNewGoal` (arşiv →
  `pastGoals`, bar sıfırlanır). Custom kart: başlık + 10-50 puan + kategori.
- Eşleşme: 2 isim (sen + partner), cihazda rol değiştirme ("Ben").
  Firestore pairing (TTL'li kod) sadece `firebase.ts`'e eklenecek.
- Gates: `tsc` 0 · `eslint` 0 · `jest --ci --runInBand` 23/23.

## 2026-09-11 — Slice 3: oyunlaştırma + animasyonlar (Reanimated, Lottie, Haptics)
- Paketler: `react-native-reanimated@4.5.1`, `lottie-react-native@7.3.8`, `expo-haptics@57.0.2`, `react-native-worklets@0.10.1`.
- Duolingo/Brawl Stars tarzı 3D bouncy butonlar (`BouncyPressable`): spring physics (scale 0.95, translateY 3) + dokunsal haptic titreşim.
- Dinamik XP seviye çubuğu (`GamifiedProgressBar`): Reanimated `withSpring` akıcı dolum, %25/%60/%100 kilit açılma rozetleri.
- Çiftler arası seri/streak sayacı (`StreakBadge`): Lottie alev animasyonu (`flame.json`) + spring nabız efekti + `calculateStreak` pure math.
- Hedef zafer kutlaması (`CelebrationOverlay`): 400 puan dolduğunda ekranı kaplayan konfeti yağmuru (`confetti.json`) + kupa (`trophy.json`) + zafer haptiği.
- Görev kartları (`TaskCard`): Kategori rozetleri, XP etiketleri ve bouncy iddia butonları.
- Gates: `tsc` 0 · `eslint` 0 · `jest --ci --runInBand` 27/27 · `expo-doctor` 21/21.

## Next
- Kalıcılık (`zustand/persist` + AsyncStorage) — restartta veri siliniyor.
- Firestore pairing lookup + activity sync when backend env exists (see
  `src/firebase.ts` ponytail note). Firestore rules per PRD §5.
- No store build without explicit user approval.
