import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useBizde } from '@/store';
import { t, type Lang } from '@/i18n/strings';
import { validPairingCode } from '@/lib/progress';
import { BouncyPressable } from './game/BouncyPressable';

export function PairingScreen({ lang }: { lang: Lang }) {
  const { signIn, setPartner, createCode, joinCode, pairingCode } = useBizde();
  const [name, setName] = useState('');
  const [partner, setPartnerName] = useState('');
  const [join, setJoin] = useState('');
  const [error, setError] = useState('');

  const ensureNames = (): boolean => {
    if (name.trim().length === 0 || partner.trim().length === 0) {
      setError(t(lang, 'pairing.invalid'));
      return false;
    }
    signIn(name);
    setPartner(partner);
    return true;
  };

  return (
    <View style={styles.box}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>🎮 💖</Text>
        <Text style={styles.title}>{t(lang, 'pairing.title')}</Text>
        <Text style={styles.sub}>{t(lang, 'pairing.subtitle')}</Text>
      </View>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder={t(lang, 'pairing.namePlaceholder')}
          placeholderTextColor="#94a3b8"
          value={name}
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
          onChangeText={(v) => {
            setPartnerName(v);
            setError('');
          }}
        />

        <BouncyPressable
          variant="primary"
          title={`✨ ${t(lang, 'pairing.createCode')}`}
          onPress={() => {
            if (ensureNames()) createCode();
          }}
          style={styles.btn}
        />

        {pairingCode !== null && (
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>{t(lang, 'pairing.codeLabel')}</Text>
            <Text style={styles.code}>{pairingCode}</Text>
          </View>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>VEYA</Text>
          <View style={styles.dividerLine} />
        </View>

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
        <BouncyPressable
          variant="secondary"
          title={`🔗 ${t(lang, 'pairing.joinCode')}`}
          onPress={() => {
            if (!ensureNames()) return;
            if (!validPairingCode(join)) {
              setError(t(lang, 'pairing.invalidCode'));
              return;
            }
            if (!joinCode(join)) setError(t(lang, 'pairing.wrongCode'));
          }}
          style={styles.btn}
        />

        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 4,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
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
});
