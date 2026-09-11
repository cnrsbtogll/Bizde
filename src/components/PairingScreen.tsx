import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useBizde } from '@/store';
import { t, type Lang } from '@/i18n/strings';
import { validPairingCode } from '@/lib/progress';

// ponytail: no expo-router for 2 screens — App switches on isPaired.
// Add a router only if screen count grows past 3.
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
      <Text style={styles.title}>{t(lang, 'pairing.title')}</Text>
      <Text style={styles.sub}>{t(lang, 'pairing.subtitle')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t(lang, 'pairing.namePlaceholder')}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError('');
        }}
      />
      <TextInput
        style={styles.input}
        placeholder={t(lang, 'pairing.partnerPlaceholder')}
        value={partner}
        onChangeText={(v) => {
          setPartnerName(v);
          setError('');
        }}
      />
      <Button
        title={t(lang, 'pairing.createCode')}
        onPress={() => {
          if (ensureNames()) createCode();
        }}
      />
      {pairingCode !== null && (
        <Text style={styles.code}>
          {t(lang, 'pairing.codeLabel')}: {pairingCode}
        </Text>
      )}
      <Text style={styles.sub}>{t(lang, 'pairing.joinTitle')}</Text>
      <TextInput
        style={styles.input}
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={6}
        value={join}
        onChangeText={(v) => {
          setJoin(v);
          setError('');
        }}
      />
      <Button
        title={t(lang, 'pairing.joinCode')}
        onPress={() => {
          if (!ensureNames()) return;
          if (!validPairingCode(join)) {
            setError(t(lang, 'pairing.invalidCode'));
            return;
          }
          if (!joinCode(join)) setError(t(lang, 'pairing.wrongCode'));
        }}
      />
      {error.length > 0 && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, gap: 12, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  sub: { color: '#555', textAlign: 'center' },
  input: { borderColor: '#ccc', borderRadius: 8, borderWidth: 1, padding: 10 },
  code: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  error: { color: '#b00020', textAlign: 'center' },
});
