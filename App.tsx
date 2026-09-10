import { useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useBizde } from '@/store';
import { PairingScreen } from '@/components/PairingScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { type Lang } from '@/i18n/strings';

// Thin root: language toggle + screen switch. All logic lives in src/*.
export default function App() {
  const isPaired = useBizde((s) => s.isPaired);
  const [lang, setLang] = useState<Lang>('tr');

  return (
    <View style={styles.root}>
      <StatusBar style="auto" />
      <View style={styles.toggle}>
        <Button
          title={lang === 'tr' ? 'EN' : 'TR'}
          onPress={() => setLang((l) => (l === 'tr' ? 'en' : 'tr'))}
        />
      </View>
      {isPaired ? <HomeScreen lang={lang} /> : <PairingScreen lang={lang} />}
    </View>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1 },
  toggle: { alignSelf: 'flex-end', marginRight: 16, marginTop: 48 },
});
