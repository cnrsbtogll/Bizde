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
} from 'react-native';
import { useBizde } from '@/store';
import { fetchCoupleDocument } from '@/services/firestore';
import { signInAnon } from '@/firebase';
import { t, type Lang } from '@/i18n/strings';
import { validPairingCode } from '@/lib/progress';
import { BouncyPressable } from './game/BouncyPressable';
import { colors, radii, shadows } from '@/theme/tokens';

export function PairingScreen({ lang = 'tr' }: { lang?: Lang }) {
  const { signIn, setPartner, createCode, joinCode, pairingCode } = useBizde();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [partner, setPartnerName] = useState('');
  const [join, setJoin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundMembers, setFoundMembers] = useState<string[] | null>(null);

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

  const handleSelectIdentity = async (chosenName: string) => {
    const cleanJoin = join.trim();
    setError('');
    setLoading(true);
    try {
      const success = await joinCode(cleanJoin, chosenName);
      if (!success) {
        setError(t(lang, 'pairing.wrongCode'));
        setFoundMembers(null);
      }
    } catch {
      setError(t(lang, 'pairing.wrongCode'));
      setFoundMembers(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
              setError('');
            }}
          >
            <Text style={[styles.tabText, mode === 'join' && styles.tabTextActive]}>
              🔗 {t(lang, 'pairing.joinCode')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>
          {mode === 'create' ? (
            <>
              <View style={styles.roleHintBox}>
                <Text style={styles.roleHintText}>{t(lang, 'pairing.rolesHint')}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t(lang, 'pairing.wifeLabel')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t(lang, 'pairing.wifePlaceholder')}
                  placeholderTextColor={colors.neutral[400]}
                  value={name}
                  autoCapitalize="words"
                  onChangeText={(v) => {
                    setName(v);
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
                  autoCapitalize="words"
                  onChangeText={(v) => {
                    setPartnerName(v);
                    setError('');
                  }}
                />
              </View>

              <BouncyPressable
                variant="primary"
                title={`✨ ${t(lang, 'pairing.createCode')}`}
                onPress={handleCreateCode}
                style={styles.btn}
              />

              {pairingCode !== null && (
                <View style={styles.codeCard}>
                  <Text style={styles.codeLabel}>{t(lang, 'pairing.codeLabel')}</Text>
                  <Text style={styles.code}>{pairingCode}</Text>
                </View>
              )}
            </>
          ) : foundMembers ? (
            <View style={styles.identitySelectCard}>
              <Text style={styles.identityTitle}>
                {lang === 'tr' ? '👋 Hoş geldin! Sen kimsin?' : '👋 Welcome! Which one are you?'}
              </Text>
              <Text style={styles.identitySubtitle}>
                {lang === 'tr' ? 'Lütfen kendi adını seç:' : 'Please tap your name:'}
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
                  {lang === 'tr' ? '← Farklı Kod Gir' : '← Enter Different Code'}
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
                onChangeText={(v) => {
                  setJoin(v);
                  setError('');
                }}
              />
              {loading ? (
                <ActivityIndicator size="small" color={colors.emerald[600]} style={{ marginVertical: 12 }} />
              ) : (
                <BouncyPressable
                  variant="primary"
                  title={`🔗 ${t(lang, 'pairing.joinCode')}`}
                  onPress={handleJoinCode}
                  style={styles.btn}
                />
              )}
            </>
          )}

          {error.length > 0 && <Text style={styles.error}>{error}</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
    gap: 18,
  },
  heroCard: {
    alignItems: 'center',
    gap: 8,
  },
  heroBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.emerald[50],
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.emerald[200],
    marginBottom: 4,
  },
  heroEmoji: {
    fontSize: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.neutral[900],
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.lg,
    padding: 5,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: radii.md,
  },
  tabBtnActive: {
    backgroundColor: colors.white,
    ...shadows.soft,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.neutral[500],
  },
  tabTextActive: {
    color: colors.emerald[600],
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.card,
    gap: 14,
  },
  roleHintBox: {
    backgroundColor: colors.emerald[50],
    borderColor: colors.emerald[200],
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
  },
  roleHintText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.emerald[800],
    fontWeight: '600',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.neutral[800],
  },
  input: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[200],
    borderRadius: radii.md,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 15,
    color: colors.neutral[900],
    fontWeight: '500',
  },
  joinInput: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: 16,
    color: colors.emerald[700],
  },
  btn: {
    width: '100%',
    minHeight: 48,
  },
  codeCard: {
    backgroundColor: colors.emerald[50],
    borderColor: colors.emerald[200],
    borderWidth: 1.5,
    borderRadius: radii.lg,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    ...shadows.soft,
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
});
