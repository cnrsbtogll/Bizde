import { useState } from 'react';
import { Button, FlatList, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  historyActivities,
  pendingActivities,
  totalPoints,
  totalsByMember,
  useBizde,
} from '@/store';
import { MILESTONES, progressFraction, reachedMilestones } from '@/lib/progress';
import {
  CATEGORIES,
  REWARD_TEMPLATES,
  TASK_TEMPLATES,
  clampPoints,
  findTemplate,
  rewardTitle,
  templateTitle,
  type TaskCategory,
  type TaskTemplate,
} from '@/mock/catalog';
import { t, type Lang } from '@/i18n/strings';

const BAR_COLORS = ['#0f766e', '#ea580c'];

export function HomeScreen({ lang }: { lang: Lang }) {
  const {
    members,
    actor,
    setActor,
    activeGoal,
    customTemplates,
    activities,
    claimTask,
    addCustomTemplate,
    approveActivity,
    rejectActivity,
    appreciate,
    startNewGoal,
  } = useBizde();

  const [taskModal, setTaskModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [customCat, setCustomCat] = useState<TaskCategory>('ev');
  const [adjust, setAdjust] = useState<Record<string, string>>({});
  const [goalModal, setGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [rewardId, setRewardId] = useState(REWARD_TEMPLATES[0]?.id ?? '');
  const [error, setError] = useState('');

  const total = totalPoints(activities);
  const target = activeGoal.targetPoints;
  const frac = progressFraction(total, target);
  const reached = reachedMilestones(total, target);
  const [n1, n2] = totalsByMember(activities, members);
  const f1 = total > 0 ? (n1 ?? 0) / total : 0;
  const done = total >= target;
  const pending = pendingActivities(activities);
  const history = historyActivities(activities);
  const allTemplates: TaskTemplate[] = [...TASK_TEMPLATES, ...customTemplates];

  const claim = (tpl: TaskTemplate) => {
    const id = claimTask(templateTitle(tpl, lang), tpl.defaultPoints, tpl.id);
    if (id) setTaskModal(false);
  };

  const saveCustom = () => {
    const pts = Number(customPoints);
    const id = addCustomTemplate(customTitle, pts, customCat);
    if (!id) {
      setError(t(lang, 'home.badPoints'));
      return;
    }
    const tpl = findTemplate(id, useBizde.getState().customTemplates);
    setError('');
    setCustomTitle('');
    setCustomPoints('');
    if (tpl) claim(tpl);
  };

  const approve = (id: string, fallback: number, templateId?: string) => {
    const raw = adjust[id];
    const tpl = templateId ? findTemplate(templateId, customTemplates) : undefined;
    const n = raw === undefined || raw === '' ? fallback : Number(raw);
    const ok = tpl
      ? approveActivity(id, clampPoints(Number.isFinite(n) ? n : fallback, tpl))
      : approveActivity(id, n);
    if (ok) setAdjust((s) => ({ ...s, [id]: '' }));
  };

  const saveGoal = () => {
    const ok = startNewGoal(goalTitle, Number(goalTarget), rewardId);
    if (!ok) {
      setError(t(lang, 'home.badPoints'));
      return;
    }
    setError('');
    setGoalTitle('');
    setGoalTarget('');
    setGoalModal(false);
  };

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Text style={styles.label}>
          {t(lang, 'home.actorLabel')}: {actor}
        </Text>
        {members.map((m) => (
          <Button key={m} title={m} onPress={() => setActor(m)} />
        ))}
      </View>

      <Text style={styles.label}>{t(lang, 'home.goal')}</Text>
      <Text style={styles.title}>{activeGoal.title}</Text>

      <View style={styles.bar}>
        <View style={[styles.fill, { flex: frac * f1, backgroundColor: BAR_COLORS[0] }]} />
        <View style={[styles.fill, { flex: frac * (1 - f1), backgroundColor: BAR_COLORS[1] }]} />
        <View style={{ flex: 1 - frac }} />
      </View>
      <Text style={styles.total}>
        {total} / {target}
      </Text>
      <Text style={styles.sub}>
        <Text style={{ color: BAR_COLORS[0] }}>
          {members[0] ?? ''}: {n1 ?? 0}
        </Text>
        {'  '}
        <Text style={{ color: BAR_COLORS[1] }}>
          {members[1] ?? ''}: {n2 ?? 0}
        </Text>
      </Text>

      <View style={styles.milestones}>
        {MILESTONES.map((m) => (
          <Text key={m.pct} style={reached.includes(m.pct) ? styles.hit : styles.miss}>
            %{m.pct} {t(lang, `milestones.${m.labelKey}`)} {reached.includes(m.pct) ? '✓' : ''}
          </Text>
        ))}
      </View>

      {done && (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>{t(lang, 'home.goalDone')}</Text>
          <Button title={t(lang, 'home.newGoal')} onPress={() => setGoalModal(true)} />
        </View>
      )}

      <View style={styles.row}>
        <Button title={t(lang, 'home.addPoints')} onPress={() => setTaskModal(true)} />
        <Button title={t(lang, 'home.thanks')} onPress={() => appreciate()} />
      </View>

      <Text style={styles.label}>{t(lang, 'home.pending')}</Text>
      <Text style={styles.sub}>{t(lang, 'home.pendingNote')}</Text>
      {pending.length === 0 ? (
        <Text style={styles.sub}>{t(lang, 'home.emptyPending')}</Text>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <View style={styles.pendingItem}>
              <Text style={styles.item}>
                {item.claimedBy} · {item.title} ({item.requestedPoints})
              </Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.pointsInput}
                  keyboardType="number-pad"
                  placeholder={String(item.requestedPoints)}
                  value={adjust[item.id] ?? ''}
                  onChangeText={(v) => setAdjust((s) => ({ ...s, [item.id]: v }))}
                />
                <Button
                  title={t(lang, 'home.approve')}
                  onPress={() => approve(item.id, item.requestedPoints, item.templateId)}
                />
                <Button title={t(lang, 'home.reject')} onPress={() => rejectActivity(item.id)} />
              </View>
            </View>
          )}
        />
      )}

      <Text style={styles.label}>{t(lang, 'home.history')}</Text>
      {history.length === 0 ? (
        <Text style={styles.sub}>{t(lang, 'home.empty')}</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <Text style={item.status === 'rejected' ? styles.rejected : styles.item}>
              {item.claimedBy} · {item.title} (+{item.status === 'approved' ? item.points : item.requestedPoints})
              {item.status === 'rejected' ? ` — ${t(lang, 'home.rejected')}` : ''}
            </Text>
          )}
        />
      )}

      <Modal visible={taskModal} transparent animationType="slide">
        <View style={styles.sheet}>
          <Text style={styles.title}>{t(lang, 'home.modalTitle')}</Text>
          {CATEGORIES.map((c) => (
            <View key={c}>
              <Text style={styles.label}>
                {t(lang, `cats.${c}`)}
              </Text>
              {allTemplates
                .filter((tpl) => tpl.category === c)
                .map((tpl) => (
                  <View key={tpl.id} style={styles.row}>
                    <Text style={styles.item}>
                      {templateTitle(tpl, lang)} ({tpl.defaultPoints})
                    </Text>
                    <Button title={t(lang, 'home.claim')} onPress={() => claim(tpl)} />
                  </View>
                ))}
            </View>
          ))}
          <Text style={styles.title}>{t(lang, 'home.customTitle')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t(lang, 'home.taskPlaceholder')}
            value={customTitle}
            onChangeText={setCustomTitle}
          />
          <TextInput
            style={styles.input}
            placeholder={t(lang, 'home.pointsPlaceholder')}
            keyboardType="number-pad"
            value={customPoints}
            onChangeText={setCustomPoints}
          />
          <View style={styles.row}>
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                title={customCat === c ? `• ${t(lang, `cats.${c}`)}` : t(lang, `cats.${c}`)}
                onPress={() => setCustomCat(c)}
              />
            ))}
          </View>
          {error.length > 0 && <Text style={styles.error}>{error}</Text>}
          <View style={styles.row}>
            <Button title={t(lang, 'home.save')} onPress={saveCustom} />
            <Button
              title={t(lang, 'home.cancel')}
              onPress={() => {
                setTaskModal(false);
                setError('');
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={goalModal} transparent animationType="slide">
        <View style={styles.sheet}>
          <Text style={styles.title}>{t(lang, 'home.newGoal')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t(lang, 'home.goalTitlePlaceholder')}
            value={goalTitle}
            onChangeText={setGoalTitle}
          />
          <TextInput
            style={styles.input}
            placeholder={t(lang, 'home.goalTargetPlaceholder')}
            keyboardType="number-pad"
            value={goalTarget}
            onChangeText={setGoalTarget}
          />
          <Text style={styles.label}>{t(lang, 'home.rewardLabel')}</Text>
          {REWARD_TEMPLATES.map((r) => (
            <View key={r.id} style={styles.row}>
              <Text style={styles.item}>
                {rewardTitle(r, lang)} (%{r.thresholdPct})
              </Text>
              <Button
                title={rewardId === r.id ? '✓' : '○'}
                onPress={() => setRewardId(r.id)}
              />
            </View>
          ))}
          {error.length > 0 && <Text style={styles.error}>{error}</Text>}
          <View style={styles.row}>
            <Button title={t(lang, 'home.start')} onPress={saveGoal} />
            <Button
              title={t(lang, 'home.cancel')}
              onPress={() => {
                setGoalModal(false);
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
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-around', alignItems: 'center' },
  item: { borderBottomColor: '#eee', borderBottomWidth: 1, paddingVertical: 6 },
  rejected: { color: '#aaa', paddingVertical: 6, textDecorationLine: 'line-through' },
  pendingItem: { gap: 4, paddingVertical: 4 },
  pointsInput: { borderColor: '#ccc', borderRadius: 8, borderWidth: 1, padding: 6, width: 64 },
  doneBox: { backgroundColor: '#e8f5e9', borderRadius: 8, gap: 8, padding: 12 },
  doneText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  sheet: { backgroundColor: '#fff', borderRadius: 12, gap: 10, margin: 24, marginTop: 120, padding: 20 },
  input: { borderColor: '#ccc', borderRadius: 8, borderWidth: 1, padding: 10 },
  error: { color: '#b00020' },
});
