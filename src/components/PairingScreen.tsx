import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useBizde } from '@/store';
import { fetchCoupleDocument } from '@/services/firestore';
import { signInAnon } from '@/firebase';
import { t, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE_OPTION, type Lang } from '@/i18n/strings';
import { validPairingCode } from '@/lib/progress';
import { BouncyPressable } from './game/BouncyPressable';
import { colors, radii, shadows } from '@/theme/tokens';

export function PairingScreen({ lang: propLang }: { lang?: Lang } = {}) {
  const { signIn, setPartner, createCode, joinCode, pairingCode, language, setLanguage } = useBizde();
  const lang: Lang = propLang ?? language ?? 'tr';

  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [partner, setPartnerName] = useState('');
  const [join, setJoin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundMembers, setFoundMembers] = useState<string[] | null>(null);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLangOption =
    SUPPORTED_LANGUAGES.find((item) => item.code === lang) ?? DEFAULT_LANGUAGE_OPTION;

  const handleCreateCode = async () => {
    if (name.trim().length === 0 || partner.trim().length === 0) {
      setError(t(lang, 'pairing.invalid'));
      return;
    }
    setError('');
    await signIn(name);
    setPartner(partner);
    createCode();
  };

  const handleJoinCode = async () => {
    const cleanJoin = join.trim();
    if (!validPairingCode(cleanJoin)) {
      setError(t(lang, 'pairing.invalidCode'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInAnon();
      const couple = await fetchCoupleDocument(`couple-${cleanJoin}`);
      if (couple && couple.members && couple.members.length > 1) {
        setFoundMembers(couple.members);
      } else {
        const success = await joinCode(cleanJoin);
        if (!success) {
          setError(t(lang, 'pairing.wrongCode'));
        }
      }
    } catch {
      setError(t(lang, 'pairing.wrongCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIdentity = async (selectedName: string) => {
    const cleanJoin = join.trim();
    setLoading(true);
    try {
      const success = await joinCode(cleanJoin, selectedName);
      if (!success) {
        setError(t(lang, 'pairing.wrongCode'));
      }
    } catch {
      setError(t(lang, 'pairing.wrongCode'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLanguage = (newLang: Lang) => {
    void Haptics.selectionAsync();
    setLanguage(newLang);
    setLangModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Language Switcher */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.langChip}
            onPress={() => {
              void Haptics.selectionAsync();
              setLangModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.langChipFlag}>{currentLangOption.flag}</Text>
            <Text style={styles.langChipText}>{currentLangOption.nativeName}</Text>
            <Text style={styles.langChipChevron}>▾</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroEmoji}>🌿 💖 🌿</Text>
          </View>
          <Text style={styles.title}>{t(lang, 'pairing.title')}</Text>
          <Text style={styles.sub}>{t(lang, 'pairing.subtitle')}</Text>
        </View>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabBtn, mode === 'create' && styles.tabBtnActive]}
            onPress={() => {
              setMode('create');
              setFoundMembers(null);
              setError('');
            }}
          >
            <Text style={[styles.tabText, mode === 'create' && styles.tabTextActive]}>
              ✨ {t(lang, 'pairing.createCode')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, mode === 'join' && styles.tabBtnActive]}
            onPress={() => {
              setMode('join');
              setFoundMembers(null);
              setError('');
            }}
          >
            <Text style={[styles.tabText, mode === 'join' && styles.tabTextActive]}>
              🔗 {t(lang, 'pairing.joinCode')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {mode === 'create' ? (
            <>
              <View style={styles.roleHintCard}>
                <Text style={styles.roleHintText}>{t(lang, 'pairing.rolesHint')}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t(lang, 'pairing.wifeLabel')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t(lang, 'pairing.wifePlaceholder')}
                  placeholderTextColor={colors.neutral[400]}
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    setError('');
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t(lang, 'pairing.husbandLabel')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t(lang, 'pairing.husbandPlaceholder')}
                  placeholderTextColor={colors.neutral[400]}
                  value={partner}
                  onChangeText={(val) => {
                    setPartnerName(val);
                    setError('');
                  }}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <BouncyPressable
                variant="primary"
                title={`✨ ${t(lang, 'pairing.createCode')}`}
                onPress={handleCreateCode}
                wrapperStyle={{ width: '100%', marginTop: 8 }}
                style={styles.primaryBtn}
              />

              {pairingCode && (
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>{t(lang, 'pairing.codeLabel')}</Text>
                  <Text style={styles.code}>{pairingCode}</Text>
                </View>
              )}
            </>
          ) : foundMembers ? (
            <View style={styles.identitySelectCard}>
              <Text style={styles.identityTitle}>
                {t(lang, 'pairing.whoAreYou')}
              </Text>
              <Text style={styles.identitySubtitle}>
                {t(lang, 'pairing.selectName')}
              </Text>
              <View style={styles.identityButtonsRow}>
                {foundMembers.map((m, idx) => (
                  <BouncyPressable
                    key={m}
                    variant={idx === 0 ? 'copper' : 'primary'}
                    title={`👤 ${m}`}
                    onPress={() => handleSelectIdentity(m)}
                    wrapperStyle={{ flex: 1 }}
                    style={styles.identityBtn}
                  />
                ))}
              </View>
              <Pressable
                onPress={() => setFoundMembers(null)}
                style={styles.changeCodeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.changeCodeText}>
                  {t(lang, 'pairing.enterDifferentCode')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.joinLabel}>{t(lang, 'pairing.joinTitle')}</Text>
              <TextInput
                style={[styles.input, styles.joinInput]}
                placeholder="123456"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="number-pad"
                maxLength={6}
                value={join}
                onChangeText={(val) => {
                  setJoin(val);
                  setError('');
                }}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <BouncyPressable
                variant="copper"
                title={`🔗 ${t(lang, 'pairing.joinCode')}`}
                onPress={handleJoinCode}
                wrapperStyle={{ width: '100%', marginTop: 8 }}
                style={styles.primaryBtn}
                disabled={loading}
              />
              {loading && <ActivityIndicator style={{ marginTop: 12 }} color={colors.copper[500]} />}
            </>
          )}
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLangModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🌐 {t(lang, 'settings.selectLanguage')}</Text>
              <TouchableOpacity
                onPress={() => setLangModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.langList}>
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.langOptionRow, isSelected && styles.langOptionRowSelected]}
                    onPress={() => handleSelectLanguage(item.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.langOptionFlag}>{item.flag}</Text>
                    <View style={styles.langOptionTextCol}>
                      <Text
                        style={[
                          styles.langOptionNative,
                          isSelected && styles.langOptionNativeSelected,
                        ]}
                      >
                        {item.nativeName}
                      </Text>
                      <Text style={styles.langOptionLabel}>{item.label}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.langCheckCircle}>
                        <Text style={styles.langCheckmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <BouncyPressable
              variant="secondary"
              title={t(lang, 'settings.close')}
              onPress={() => setLangModalVisible(false)}
              style={styles.modalDismissBtn}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    padding: 20,
    paddingTop: 44,
    paddingBottom: 40,
    gap: 16,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: -6,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.card,
  },
  langChipFlag: {
    fontSize: 16,
  },
  langChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  langChipChevron: {
    fontSize: 12,
    color: colors.neutral[400],
    fontWeight: '800',
  },
  heroCard: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  heroBadge: {
    backgroundColor: colors.emerald[50],
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.emerald[200],
    marginBottom: 4,
  },
  heroEmoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  sub: {
    fontSize: 13.5,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[200],
    borderRadius: radii.full,
    padding: 4,
    width: '100%',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radii.full,
  },
  tabBtnActive: {
    backgroundColor: colors.white,
    ...shadows.card,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  tabTextActive: {
    color: colors.neutral[900],
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.card,
  },
  roleHintCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radii.md,
    padding: 10,
  },
  roleHintText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
    lineHeight: 17,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.neutral[700],
  },
  input: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.neutral[900],
    fontWeight: '600',
  },
  joinInput: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 6,
    paddingVertical: 14,
  },
  primaryBtn: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBox: {
    marginTop: 10,
    padding: 16,
    backgroundColor: colors.emerald[50],
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.emerald[300],
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emerald[700],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  code: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.emerald[800],
    letterSpacing: 8,
  },
  joinLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neutral[700],
    textAlign: 'center',
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  identitySelectCard: {
    gap: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  identityTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  identitySubtitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.neutral[500],
    textAlign: 'center',
  },
  identityButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  identityBtn: {
    width: '100%',
    paddingVertical: 14,
  },
  changeCodeBtn: {
    marginTop: 10,
    padding: 8,
  },
  changeCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[500],
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    ...shadows.card,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.neutral[900],
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.neutral[600],
  },
  langList: {
    gap: 8,
  },
  langOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    gap: 12,
  },
  langOptionRowSelected: {
    borderColor: colors.emerald[500],
    backgroundColor: colors.emerald[50],
  },
  langOptionFlag: {
    fontSize: 26,
  },
  langOptionTextCol: {
    flex: 1,
    gap: 2,
  },
  langOptionNative: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[800],
  },
  langOptionNativeSelected: {
    color: colors.emerald[800],
  },
  langOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[400],
  },
  langCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.emerald[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  langCheckmark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  modalDismissBtn: {
    marginTop: 4,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
