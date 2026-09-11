import { useState, useEffect } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  historyActivities,
  pendingActivities,
  totalPoints,
  totalsByMember,
  useBizde,
} from '@/store';
import { calculateStreak } from '@/lib/progress';
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
import { BouncyPressable } from './game/BouncyPressable';
import { GamifiedProgressBar } from './game/GamifiedProgressBar';
import { StreakBadge } from './game/StreakBadge';
import { TaskCard } from './game/TaskCard';
import { CelebrationOverlay } from './game/CelebrationOverlay';

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
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('ev');
  const [customTitle, setCustomTitle] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [customCat, setCustomCat] = useState<TaskCategory>('ev');
  const [adjust, setAdjust] = useState<Record<string, string>>({});
  const [goalModal, setGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [rewardId, setRewardId] = useState(REWARD_TEMPLATES[0]?.id ?? '');
  const [error, setError] = useState('');
  const [celebratedGoal, setCelebratedGoal] = useState(false);

  const total = totalPoints(activities);
  const target = activeGoal.targetPoints;
  const [n1, n2] = totalsByMember(activities, members);
  const done = total >= target;
  const pending = pendingActivities(activities);
  const history = historyActivities(activities);
  const allTemplates: TaskTemplate[] = [...TASK_TEMPLATES, ...customTemplates];
  const streak = calculateStreak(activities);

  // Trigger celebration modal once when target is reached
  useEffect(() => {
    if (done && !celebratedGoal && total > 0) {
      setCelebratedGoal(true);
    }
  }, [done, celebratedGoal, total]);

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
    setCelebratedGoal(false);
    setGoalModal(false);
  };

  const filteredTemplates = allTemplates.filter((t) => t.category === selectedCategory);

  return (
    <View style={styles.box}>
      {/* Top Bar: Active player chips + Streak Flame Badge */}
      <View style={styles.headerBar}>
        <View style={styles.actorGroup}>
          <Text style={styles.actorLabelText}>{t(lang, 'home.actorLabel')}:</Text>
          <View style={styles.memberChips}>
            {members.map((m) => {
              const isActive = actor === m;
              return (
                <BouncyPressable
                  key={m}
                  title={m}
                  variant={isActive ? 'primary' : 'ghost'}
                  onPress={() => setActor(m)}
                  style={styles.chipButton}
                  textStyle={styles.chipText}
                />
              );
            })}
          </View>
        </View>

        {/* Dynamic Streak Badge with Lottie Flame */}
        <StreakBadge streakDays={streak} label={lang === 'tr' ? 'Gün' : 'Days'} />
      </View>

      {/* Goal Title & Reward */}
      <View style={styles.goalHeader}>
        <Text style={styles.goalSubtitle}>{t(lang, 'home.goal')}</Text>
        <Text style={styles.goalMainTitle}>{activeGoal.title}</Text>
      </View>

      {/* Gamified XP Progress Bar with Spring Animation */}
      <GamifiedProgressBar
        total={total}
        target={target}
        member1Name={members[0] ?? 'Partner 1'}
        member1Points={n1 ?? 0}
        member2Name={members[1] ?? 'Partner 2'}
        member2Points={n2 ?? 0}
        color1={BAR_COLORS[0]}
        color2={BAR_COLORS[1]}
      />

      {/* Primary Action Buttons: Add Task & Appreciation */}
      <View style={styles.actionRow}>
        <BouncyPressable
          variant="primary"
          title={`⚡ ${t(lang, 'home.addPoints')}`}
          onPress={() => setTaskModal(true)}
          style={styles.actionButton}
          textStyle={styles.actionText}
        />
        <BouncyPressable
          variant="amber"
          title={`💖 ${t(lang, 'home.thanks')}`}
          onPress={() => appreciate()}
          style={styles.actionButton}
          textStyle={styles.actionText}
        />
      </View>

      {/* Pending Claims Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t(lang, 'home.pending')}</Text>
        {pending.length > 0 && (
          <View style={styles.pendingCountBadge}>
            <Text style={styles.pendingCountText}>{pending.length}</Text>
          </View>
        )}
      </View>

      {pending.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t(lang, 'home.emptyPending')}</Text>
        </View>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(a) => a.id}
          style={styles.pendingList}
          renderItem={({ item }) => (
            <View style={styles.pendingCard}>
              <View style={styles.pendingLeft}>
                <Text style={styles.pendingClaimer}>👤 {item.claimedBy}</Text>
                <Text style={styles.pendingTaskTitle}>{item.title}</Text>
                <Text style={styles.pendingPoints}>+{item.requestedPoints} XP</Text>
              </View>

              <View style={styles.pendingActions}>
                <TextInput
                  style={styles.pointsInput}
                  keyboardType="number-pad"
                  placeholder={String(item.requestedPoints)}
                  value={adjust[item.id] ?? ''}
                  onChangeText={(v) => setAdjust((s) => ({ ...s, [item.id]: v }))}
                />
                <BouncyPressable
                  variant="success"
                  title={`✓ ${t(lang, 'home.approve')}`}
                  onPress={() => approve(item.id, item.requestedPoints, item.templateId)}
                  style={styles.miniBtn}
                  textStyle={styles.miniBtnText}
                />
                <BouncyPressable
                  variant="danger"
                  title={`✕ ${t(lang, 'home.reject')}`}
                  onPress={() => rejectActivity(item.id)}
                  style={styles.miniBtn}
                  textStyle={styles.miniBtnText}
                />
              </View>
            </View>
          )}
        />
      )}

      {/* History Section */}
      <Text style={styles.sectionTitle}>{t(lang, 'home.history')}</Text>
      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t(lang, 'home.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(a) => a.id}
          style={styles.historyList}
          renderItem={({ item }) => {
            const isApproved = item.status === 'approved';
            return (
              <View style={[styles.historyCard, !isApproved && styles.historyRejectedCard]}>
                <View style={styles.historyRow}>
                  <Text style={styles.historyName}>{item.claimedBy}</Text>
                  <Text style={[styles.historyItemTitle, !isApproved && styles.rejectedText]}>
                    {item.title}
                  </Text>
                  <View
                    style={[
                      styles.historyBadge,
                      isApproved ? styles.badgeSuccess : styles.badgeRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyBadgeText,
                        isApproved ? styles.badgeSuccessText : styles.badgeRejectedText,
                      ]}
                    >
                      {isApproved ? `+${item.points} XP` : t(lang, 'home.rejected')}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Task Picker Modal */}
      <Modal visible={taskModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>🎯 {t(lang, 'home.modalTitle')}</Text>
              <BouncyPressable
                variant="ghost"
                title="✕"
                onPress={() => {
                  setTaskModal(false);
                  setError('');
                }}
                style={styles.closeButton}
              />
            </View>

            {/* Category Tabs */}
            <View style={styles.categoryTabs}>
              {CATEGORIES.map((c) => {
                const isSelected = selectedCategory === c;
                return (
                  <BouncyPressable
                    key={c}
                    title={t(lang, `cats.${c}`)}
                    variant={isSelected ? 'secondary' : 'ghost'}
                    onPress={() => setSelectedCategory(c)}
                    style={styles.categoryTab}
                    textStyle={styles.categoryTabText}
                  />
                );
              })}
            </View>

            {/* Task list for selected category */}
            <FlatList
              data={filteredTemplates}
              keyExtractor={(tpl) => tpl.id}
              style={styles.taskList}
              renderItem={({ item }) => (
                <TaskCard
                  template={item}
                  title={templateTitle(item, lang)}
                  onClaim={claim}
                  claimButtonText={t(lang, 'home.claim')}
                />
              )}
            />

            {/* Custom Quest Creator Accordion */}
            <View style={styles.customSection}>
              <Text style={styles.customHeading}>✨ {t(lang, 'home.customTitle')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t(lang, 'home.taskPlaceholder')}
                placeholderTextColor="#94a3b8"
                value={customTitle}
                onChangeText={setCustomTitle}
              />
              <View style={styles.customRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder={t(lang, 'home.pointsPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  value={customPoints}
                  onChangeText={setCustomPoints}
                />
                <BouncyPressable
                  variant="primary"
                  title={t(lang, 'home.save')}
                  onPress={saveCustom}
                  style={styles.saveCustomBtn}
                />
              </View>
              <View style={styles.categoryChipsRow}>
                {CATEGORIES.map((c) => (
                  <BouncyPressable
                    key={c}
                    title={customCat === c ? `• ${t(lang, `cats.${c}`)}` : t(lang, `cats.${c}`)}
                    variant={customCat === c ? 'primary' : 'ghost'}
                    onPress={() => setCustomCat(c)}
                    style={styles.categoryChip}
                    textStyle={styles.categoryChipText}
                  />
                ))}
              </View>
              {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            </View>
          </View>
        </View>
      </Modal>

      {/* Goal Setting Modal */}
      <Modal visible={goalModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>🏆 {t(lang, 'home.newGoal')}</Text>
              <BouncyPressable
                variant="ghost"
                title="✕"
                onPress={() => {
                  setGoalModal(false);
                  setError('');
                }}
                style={styles.closeButton}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{t(lang, 'home.goal')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t(lang, 'home.goalTitlePlaceholder')}
                placeholderTextColor="#94a3b8"
                value={goalTitle}
                onChangeText={setGoalTitle}
              />

              <Text style={styles.inputLabel}>{t(lang, 'home.goalTargetPlaceholder')}</Text>
              <TextInput
                style={styles.input}
                placeholder="400"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                value={goalTarget}
                onChangeText={setGoalTarget}
              />

              <Text style={styles.inputLabel}>{t(lang, 'home.rewardLabel')}</Text>
              {REWARD_TEMPLATES.map((r) => {
                const isSelected = rewardId === r.id;
                return (
                  <BouncyPressable
                    key={r.id}
                    variant={isSelected ? 'secondary' : 'ghost'}
                    onPress={() => setRewardId(r.id)}
                    style={styles.rewardCard}
                  >
                    <Text style={styles.rewardEmoji}>🎁</Text>
                    <Text style={styles.rewardTitleText}>
                      {rewardTitle(r, lang)} (%{r.thresholdPct})
                    </Text>
                    <Text style={styles.rewardCheck}>{isSelected ? '✓' : ''}</Text>
                  </BouncyPressable>
                );
              })}

              {error.length > 0 && <Text style={styles.error}>{error}</Text>}

              <View style={styles.goalActions}>
                <BouncyPressable
                  variant="amber"
                  title={`🚀 ${t(lang, 'home.start')}`}
                  onPress={saveGoal}
                  style={styles.startGoalBtn}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Screen-Wide Celebration Overlay with Confetti & Trophy */}
      <CelebrationOverlay
        visible={celebratedGoal}
        title={activeGoal.title}
        subtitle={`${total} / ${target} XP Ulaşıldı!`}
        newGoalButtonText={t(lang, 'home.newGoal')}
        onNewGoal={() => {
          setCelebratedGoal(false);
          setGoalModal(true);
        }}
        onClose={() => setCelebratedGoal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: '#f8fafc',
    gap: 12,
    padding: 18,
    paddingTop: 54,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actorLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  memberChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 36,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalHeader: {
    gap: 2,
  },
  goalSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  goalMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  pendingCountBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  pendingCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  pendingList: {
    maxHeight: 140,
  },
  pendingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    marginBottom: 8,
    gap: 8,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingClaimer: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ea580c',
  },
  pendingTaskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginHorizontal: 8,
  },
  pendingPoints: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f766e',
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  pointsInput: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '700',
    width: 54,
    textAlign: 'center',
  },
  miniBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 34,
  },
  miniBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  historyList: {
    flex: 1,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 6,
  },
  historyRejectedCard: {
    opacity: 0.5,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    width: 60,
  },
  historyItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  rejectedText: {
    textDecorationLine: 'line-through',
  },
  historyBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeSuccess: {
    backgroundColor: '#ecfdf5',
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  badgeRejected: {
    backgroundColor: '#fef2f2',
  },
  badgeRejectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  categoryChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  categoryChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    minHeight: 28,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
    gap: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    minHeight: 36,
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    minHeight: 38,
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  taskList: {
    maxHeight: 280,
  },
  customSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    gap: 8,
  },
  customHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
    marginBottom: 4,
  },
  customRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveCustomBtn: {
    minWidth: 90,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 6,
    gap: 10,
    justifyContent: 'flex-start',
  },
  rewardEmoji: {
    fontSize: 20,
  },
  rewardTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  rewardCheck: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f766e',
  },
  goalActions: {
    marginTop: 16,
    marginBottom: 20,
  },
  startGoalBtn: {
    width: '100%',
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
});
