// Jest setup for Bizdee: silence noisy logs.
process.env.EXPO_OS = 'ios';
process.env.EXPO_PUBLIC_NO_TELEMETRY = '1';

const mockStore = new Map<string, Record<string, unknown>>();

jest.mock('@/services/firestore', () => ({
  subscribeToCouple: jest.fn(() => jest.fn()),
  saveCoupleState: jest.fn(() => Promise.resolve()),
  fetchCoupleDocument: jest.fn((id: string) => Promise.resolve(mockStore.get(id) || null)),
  initCoupleDocument: jest.fn((id: string, data: Record<string, unknown>) => {
    mockStore.set(id, data);
    return Promise.resolve();
  }),
  updateCoupleDocument: jest.fn((id: string, updates: Record<string, unknown>) => {
    const prev = mockStore.get(id) || {};
    mockStore.set(id, { ...prev, ...updates });
    return Promise.resolve();
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
