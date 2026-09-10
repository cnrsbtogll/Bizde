import { useState } from 'react';
import { Button, FlatList, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { recentActivities, totalPoints, useBizde } from '@/store';
import { MILESTONES, progressFraction, reachedMilestones, validTaskPoints } from '@/lib/progress';
import { t, type Lang } from '@/i18n/strings';

export function HomeScreen({ lang }: { lang: Lang }) {
  const { goalTitle, targetPoints, activities, addTask, appreciate } = useBizde();
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [points, setPoints] = useState('');
  const [error, setError] = useState('');

  const total = totalPoints(activities);
  const frac = progressFraction(total, targetPoints);
  const reached = reachedMilestones(total, targetPoints);

  const save = () => {
    const n = Number(points);
    if (!validTaskPoints(n) || title.trim().length === 0) {
      setError(t(lang, 'home.badPoints'));
      return;
    }
    if (addTask(title, n)) {
      setModal(false);
      setTitle('');
      setPoints('');
      setError('');
    }
  };

  return (
    <View style={styles.box}>
      <Text style={styles.label}>{t(lang, 'home.goal')}</Text>
      <Text style={styles.title}>{goalTitle}</Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { flex: frac }]} />
        <View style={{ flex: 1 - frac }} />
      </View>
      <Text style={styles.total}>
        {total} / {targetPoints}
      </Text>
      <View style={styles.milestones}>
        {MILESTONES.map((m) => (
          <Text key={m.pct} style={reached.includes(m.pct) ? styles.hit : styles.miss}>
            %{m.pct} {t(lang, `milestones.${m.labelKey}`)} {reached.includes(m.pct) ? '✓' : ''}
          </Text>
        ))}
      </View>
      <View style={styles.row}>
        <Button title={t(lang, 'home.addPoints')} onPress={() => setModal(true)} />
        <Button title={t(lang, 'home.thanks')} onPress={() => appreciate()} />
      </View>
      <Text style={styles.label}>{t(lang, 'home.history')}</Text>
      {activities.length === 0 ? (
        <Text style={styles.sub}>{t(lang, 'home.empty')}</Text>
      ) : (
        <FlatList
          data={recentActivities(activities)}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <Text style={styles.item}>
              {item.createdBy} · {item.title} (+{item.points})
            </Text>
          )}
        />
      )}
      <Modal visible={modal} transparent animationType="slide">
        <View style={styles.sheet}>
          <Text style={styles.title}>{t(lang, 'home.modalTitle')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t(lang, 'home.taskPlaceholder')}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder={t(lang, 'home.pointsPlaceholder')}
            keyboardType="number-pad"
            value={points}
            onChangeText={setPoints}
          />
          {error.length > 0 && <Text style={styles.error}>{error}</Text>}
          <View style={styles.row}>
            <Button title={t(lang, 'home.save')} onPress={save} />
            <Button
              title={t(lang, 'home.cancel')}
              onPress={() => {
                setModal(false);
                setError('');
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, gap: 10, padding: 24, paddingTop: 64 },
  label: { color: '#555' },
  title: { fontSize: 22, fontWeight: '700' },
  sub: { color: '#555' },
  bar: { backgroundColor: '#eee', borderRadius: 8, flexDirection: 'row', height: 24, overflow: 'hidden' },
  fill: { backgroundColor: '#2e7d32' },
  total: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  milestones: { gap: 2 },
  hit: { color: '#2e7d32', fontWeight: '600' },
  miss: { color: '#888' },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-around' },
  item: { borderBottomColor: '#eee', borderBottomWidth: 1, paddingVertical: 6 },
  sheet: { backgroundColor: '#fff', borderRadius: 12, gap: 10, margin: 24, marginTop: 120, padding: 20 },
  input: { borderColor: '#ccc', borderRadius: 8, borderWidth: 1, padding: 10 },
  error: { color: '#b00020' },
});
