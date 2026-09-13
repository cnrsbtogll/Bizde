import { leafKeys, t, SUPPORTED_LANGUAGES, type Lang } from '@/i18n/strings';

describe('i18n 7-language parity & coverage', () => {
  const languages: Lang[] = ['tr', 'en', 'es', 'de', 'fr', 'pt', 'it'];

  it('supports exactly 7 configured languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(7);
    expect(SUPPORTED_LANGUAGES.map((l) => l.code)).toEqual(languages);
  });

  it('every translation key resolves across all 7 languages', () => {
    const keys = leafKeys();
    expect(keys.length).toBeGreaterThan(30);

    for (const lang of languages) {
      for (const key of keys) {
        const resolved = t(lang, key);
        expect(resolved).not.toBe(key);
        expect(resolved.length).toBeGreaterThan(0);
      }
    }
  });

  it('falls back to the key for unknown paths', () => {
    expect(t('tr', 'nope.missing')).toBe('nope.missing');
    expect(t('es', 'nope.missing')).toBe('nope.missing');
  });

  it('spot-checks natural localized strings across all languages', () => {
    expect(t('tr', 'home.save')).toBe('Kaydet');
    expect(t('en', 'home.save')).toBe('Save');
    expect(t('es', 'home.save')).toBe('Guardar');
    expect(t('de', 'home.save')).toBe('Speichern');
    expect(t('fr', 'home.save')).toBe('Enregistrer');
    expect(t('pt', 'home.save')).toBe('Salvar');
    expect(t('it', 'home.save')).toBe('Salva');

    expect(t('tr', 'settings.language')).toBe('Dil');
    expect(t('en', 'settings.language')).toBe('Language');
    expect(t('es', 'settings.language')).toBe('Idioma');
    expect(t('de', 'settings.language')).toBe('Sprache');
    expect(t('fr', 'settings.language')).toBe('Langue');
    expect(t('pt', 'settings.language')).toBe('Idioma');
    expect(t('it', 'settings.language')).toBe('Lingua');
  });
});
