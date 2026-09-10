// Jest setup for Bizde: silence noisy logs. No native modules to mock yet
// (store/progress/i18n are pure JS; firebase is lazy and unconfigured in tests).
process.env.EXPO_OS = 'ios';
process.env.EXPO_PUBLIC_NO_TELEMETRY = '1';
