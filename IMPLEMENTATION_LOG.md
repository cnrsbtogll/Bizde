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

## Next
- Firestore pairing lookup + activity sync when backend env exists (see
  `src/firebase.ts` ponytail note). Firestore rules per PRD §5.
- No store build without explicit user approval.
