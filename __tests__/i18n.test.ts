import { leafKeys, t } from '@/i18n/strings';

describe('i18n parity', () => {
  it('every tr key resolves in en and vice versa', () => {
    for (const key of leafKeys()) {
      expect(t('en', key)).not.toBe(key);
      expect(t('tr', key)).not.toBe(key);
    }
  });
  it('falls back to the key for unknown paths', () => {
    expect(t('tr', 'nope.missing')).toBe('nope.missing');
  });
  it('spot-checks natural Turkish strings', () => {
    expect(t('tr', 'home.save')).toBe('Kaydet');
    expect(t('tr', 'home.cancel')).toBe('Vazgeç');
    expect(t('en', 'home.save')).toBe('Save');
  });
});
