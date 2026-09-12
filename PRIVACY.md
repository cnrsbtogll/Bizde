# Privacy Policy — Bizdee

Last updated: September 2026
Contact: https://github.com/cnrsbtogll/Bizde/issues

Bizdee is a shared-goal app for couples: two people collect points toward
a common relationship reward. We respect your privacy. This policy explains
what data we collect, why, and how we handle it.
- **Without a configured backend (demo mode):** everything (names,
  tasks, points, goals) stays on your device only.
- **With Firebase configured:** the couple's shared data (member names,
  pairing code, activities, goals, custom cards) is synced through
  Cloud Firestore so both partners see the same state, using anonymous
  sign-in (no email, no password, no profile).

## Data sent to third parties
- **Google Firebase (only when the app is configured with a backend):**
  authentication identifiers and the shared couple data described above,
  processed under Google's privacy policy. Data is used solely to sync
  the couple's shared state between the two partners' devices.
- **Nothing else.** No advertising SDKs, no analytics SDKs, no crash
  reporters, no social logins.

## Data retention
Shared couple data exists to operate the sync feature. In demo mode
there is nothing to delete (all local). When Firebase is used, deleting
the app removes local data; server-side copies follow Google Firebase's
retention for the project hosting them.

## Children
The app is intended for adults in a relationship. It collects no data
directly from children.

## Changes
If the app's data handling changes, this policy will be updated in the
repository before the corresponding release.
