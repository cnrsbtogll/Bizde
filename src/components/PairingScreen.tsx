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
import { t, type Lang } from '@/i18n/strings';
import { validPairingCode } from '@/lib/progress';
import { BouncyPressable } from './game/BouncyPressable';

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
    if (!validPairingCode(join)) {
      setError(t(lang, 'pairing.invalidCode'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const couple = await fetchCoupleDocument(`couple-${join}`);
      if (couple && couple.members && couple.members.length > 1) {
        setFoundMembers(couple.members);
      } else {
        const success = await joinCode(join);
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
    setError('');
    setLoading(true);
    try {
      const success = await joinCode(join, chosenName);
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
          <Text style={styles.heroEmoji}>🎮 💖</Text>
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
              <TextInput
                style={styles.input}
                placeholder={t(lang, 'pairing.namePlaceholder')}
                placeholderTextColor="#94a3b8"
                value={name}
                autoCapitalize="words"
                onChangeText={(v) => {
                  setName(v);
                  setError('');
                }}
              />
              <TextInput
                style={styles.input}
                placeholder={t(lang, 'pairing.partnerPlaceholder')}
                placeholderTextColor="#94a3b8"
                value={partner}
                autoCapitalize="words"
                onChangeText={(v) => {
                  setPartnerName(v);
                  setError('');
                }}
              />

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
                {foundMembers.map((m) => (
                  <BouncyPressable
                    key={m}
                    variant="primary"
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
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                maxLength={6}
                value={join}
                onChangeText={(v) => {
                  setJoin(v);
                  setError('');
                }}
              />
              {loading ? (
                <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 12 }} />
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
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  heroCard: {
    alignItems: 'center',
    gap: 6,
  },
  heroEmoji: {
    fontSize: 42,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 280,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 15,
    color: '#0f172a',
  },
  joinInput: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 6,
    paddingVertical: 16,
  },
  btn: {
    width: '100%',
  },
  codeCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
  },
  code: {
    fontSize: 28,
    fontWeight: '900',
    color: '#065f46',
    letterSpacing: 6,
  },
  joinLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  identitySelectCard: {
    gap: 12,
    alignItems: 'center',
    paddingVertical: 6,
  },
  identityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  identitySubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  identityButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  identityBtn: {
    width: '100%',
    paddingVertical: 14,
  },
  changeCodeBtn: {
    marginTop: 8,
    padding: 6,
  },
  changeCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
});
