import { useState, useEffect } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  historyActivities,
  incomingRequests,
  outgoingRequests,
  pendingActivities,
  totalPoints,
  totalsByMember,
  useBizde,
} from '@/store';
import { calculateStreak, type Milestone } from '@/lib/progress';
import {
  CATEGORIES,
  REWARD_TEMPLATES,
  TASK_TEMPLATES,
  clampPoints,
  findReward,
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
    customRewards,
    taskPointOverrides,
    activities,
    claimTask,
    requestTask,
    completeRequestedTask,
    addCustomTemplate,
    addCustomReward,
    approveActivity,
    rejectActivity,
    appreciate,
    startNewGoal,
    updateActiveGoal,
    adjustTargetPoints,
    updateTaskPoints,
  } = useBizde();

  const [taskModal, setTaskModal] = useState(false);
  const [taskMode, setTaskMode] = useState<'self' | 'partner'>('self');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('ev');
  const [customTitle, setCustomTitle] = useState('');
  const [customPoints, setCustomPoints] = useState('');
  const [customCat, setCustomCat] = useState<TaskCategory>('ev');
  const [adjust, setAdjust] = useState<Record<string, string>>({});
  const [goalModal, setGoalModal] = useState(false);
  const [goalModalMode, setGoalModalMode] = useState<'edit' | 'new'>('new');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [rewardId, setRewardId] = useState(REWARD_TEMPLATES[0]?.id ?? '');
  const [customRewardTitle, setCustomRewardTitle] = useState('');
  const [customRewardPct, setCustomRewardPct] = useState(100);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [editingTask, setEditingTask] = useState<TaskTemplate | null>(null);
  const [editingTaskPoints, setEditingTaskPoints] = useState('');
  const [error, setError] = useState('');
  const [celebratedGoal, setCelebratedGoal] = useState(false);

  const total = totalPoints(activities);
  const target = activeGoal.targetPoints;
  const [n1, n2] = totalsByMember(activities, members);
  const done = total >= target;
  const pending = pendingActivities(activities);
  const incoming = incomingRequests(activities, actor);
  const outgoing = outgoingRequests(activities, actor);
  const history = historyActivities(activities);
  const allTemplates: TaskTemplate[] = [...TASK_TEMPLATES, ...customTemplates];
  const allRewards = [...REWARD_TEMPLATES, ...customRewards];
  const activeReward = findReward(activeGoal.rewardId, customRewards);
  const streak = calculateStreak(activities);

  const partnerName =
    members.find((m) => m !== actor) ??
    (members[0] === actor ? members[1] ?? 'Partner' : members[0] ?? 'Partner');

  // Trigger celebration modal once when target is reached
  useEffect(() => {
    if (done && !celebratedGoal && total > 0) {
      setCelebratedGoal(true);
    }
  }, [done, celebratedGoal, total]);

  const handleTaskAction = (tpl: TaskTemplate) => {
    const title = templateTitle(tpl, lang);
    const effectivePoints = taskPointOverrides[tpl.id] ?? tpl.defaultPoints;
    if (taskMode === 'self') {
      const id = claimTask(title, effectivePoints, tpl.id);
      if (id) setTaskModal(false);
    } else {
      const id = requestTask(title, effectivePoints, tpl.id);
      if (id) setTaskModal(false);
    }
  };

  const openEditGoalModal = () => {
    setGoalModalMode('edit');
    setGoalTitle(activeGoal.title);
    setGoalTarget(String(activeGoal.targetPoints));
    setRewardId(activeGoal.rewardId ?? REWARD_TEMPLATES[0]?.id ?? '');
    setError('');
    setGoalModal(true);
  };

  const openNewGoalModal = () => {
    setGoalModalMode('new');
    setGoalTitle('');
    setGoalTarget('');
    setRewardId(REWARD_TEMPLATES[0]?.id ?? '');
    setError('');
    setGoalModal(true);
  };

  const openEditTaskModal = (tpl: TaskTemplate) => {
    setEditingTask(tpl);
    const currentPts = taskPointOverrides[tpl.id] ?? tpl.defaultPoints;
    setEditingTaskPoints(String(currentPts));
    setError('');
  };

  const saveTaskPoints = () => {
    if (!editingTask) return;
    const pts = Number(editingTaskPoints);
    if (!Number.isInteger(pts) || pts < 10 || pts > 50) {
      setError(t(lang, 'home.minMaxPointsNotice'));
      return;
    }
    updateTaskPoints(editingTask.id, pts);
    setEditingTask(null);
    setEditingTaskPoints('');
    setError('');
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
    if (tpl) handleTaskAction(tpl);
  };

  const saveCustomReward = () => {
    const clean = customRewardTitle.trim();
    if (!clean) return;
    const id = addCustomReward(clean, customRewardPct);
    if (id) {
      setRewardId(id);
      setCustomRewardTitle('');
    }
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
    const pts = Number(goalTarget);
    if (!goalTitle.trim() || !Number.isInteger(pts) || pts < 100 || pts > 2000) {
      setError(t(lang, 'home.badPoints'));
      return;
    }
    if (goalModalMode === 'edit') {
      const ok = updateActiveGoal(goalTitle, pts, rewardId);
      if (!ok) {
        setError(t(lang, 'home.badPoints'));
        return;
      }
    } else {
      const ok = startNewGoal(goalTitle, pts, rewardId);
      if (!ok) {
        setError(t(lang, 'home.badPoints'));
        return;
      }
      setCelebratedGoal(false);
    }
    setError('');
    setGoalTitle('');
    setGoalTarget('');
    setCustomRewardTitle('');
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
        <View style={styles.goalRow}>
          <Text style={styles.goalSubtitle}>{t(lang, 'home.goal')}</Text>
          <View style={styles.goalRowActions}>
            <Pressable
              onPress={() => {
                void Haptics.selectionAsync();
                openEditGoalModal();
              }}
              style={styles.editGoalBtn}
              accessibilityRole="button"
              accessibilityLabel={t(lang, 'home.editGoal')}
            >
              <Text style={styles.editGoalBtnText}>✏️ {t(lang, 'home.editGoal')}</Text>
            </Pressable>
            {activeReward && (
              <View style={styles.activeRewardBadge}>
                <Text style={styles.activeRewardText}>
                  🎁 {rewardTitle(activeReward, lang)} (%{activeReward.thresholdPct})
                </Text>
              </View>
            )}
          </View>
        </View>
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
        onMilestonePress={(m) => setSelectedMilestone(m)}
        onAdjustTarget={(delta) => adjustTargetPoints(delta)}
        onEditGoal={openEditGoalModal}
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

      {/* Section 1: Incoming Requests (Partner asked ME to do this) */}
      {incoming.length > 0 && (
        <View style={styles.incomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.incomingSectionTitle}>💌 {t(lang, 'home.incomingRequests')}</Text>
            <View style={styles.incomingBadge}>
              <Text style={styles.incomingBadgeText}>{incoming.length}</Text>
            </View>
          </View>
          {incoming.map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <View style={styles.requestLeft}>
                <Text style={styles.requestNote}>
                  {item.requestedBy} {t(lang, 'home.requestedBy')}:
                </Text>
                <Text style={styles.requestTitle}>{item.title}</Text>
                <Text style={styles.requestPoints}>+{item.requestedPoints} XP</Text>
              </View>
              <View style={styles.requestActions}>
                <BouncyPressable
                  variant="success"
                  title={`✨ ${t(lang, 'home.markDone')}`}
                  onPress={() => completeRequestedTask(item.id)}
                  style={styles.actionMiniBtn}
                  textStyle={styles.miniBtnText}
                />
                <BouncyPressable
                  variant="ghost"
                  title={`✕ ${t(lang, 'home.reject')}`}
                  onPress={() => rejectActivity(item.id)}
                  style={styles.actionMiniBtn}
                  textStyle={styles.miniBtnText}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Section 2: Outgoing Requests (I asked partner to do this, partner hasn't done yet) */}
      {outgoing.length > 0 && (
        <View style={styles.outgoingSection}>
          <Text style={styles.outgoingSubtitle}>
            ⏳ {partnerName}{"'a gönderdiğin istekler:"}
          </Text>
          {outgoing.map((item) => (
            <View key={item.id} style={styles.outgoingCard}>
              <Text style={styles.outgoingText}>
                {item.title} (+{item.requestedPoints} XP)
              </Text>
              <BouncyPressable
                variant="ghost"
                title={t(lang, 'home.cancel')}
                onPress={() => rejectActivity(item.id)}
                style={styles.cancelMiniBtn}
                textStyle={styles.cancelMiniText}
              />
            </View>
          ))}
        </View>
      )}

      {/* Section 3: Pending Approval (Activity is done; waiting for partner to approve) */}
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
          renderItem={({ item }) => {
            const isMyClaim = item.claimedBy === actor;
            return (
              <View style={styles.pendingCard}>
                <View style={styles.pendingLeft}>
                  <Text style={styles.pendingClaimer}>
                    {isMyClaim ? `👤 Sen (${item.claimedBy})` : `👤 ${item.claimedBy}`}
                  </Text>
                  <Text style={styles.pendingTaskTitle}>
                    {item.title} {isMyClaim ? `(yaptın)` : `(yaptı)`}
                  </Text>
                  <Text style={styles.pendingPoints}>+{item.requestedPoints} XP</Text>
                </View>

                {isMyClaim ? (
                  // Self-approval guarded: Actor sees waiting status, cannot approve own claim!
                  <View style={styles.waitingBadge}>
                    <Text style={styles.waitingText}>
                      🕒 {partnerName}{"'ın"} {t(lang, 'home.waitingApproval')}
                    </Text>
                  </View>
                ) : (
                  // Partner approval: Can approve or reject partner's completed work
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
                )}
              </View>
            );
          }}
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

      {/* Task Picker Modal (with Hybrid Switch: Ben Yaptım vs Partnerime İste) */}
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

            {/* Hybrid Mode Switcher */}
            <View style={styles.modeSwitcher}>
              <BouncyPressable
                variant={taskMode === 'self' ? 'primary' : 'ghost'}
                title={`🙋 ${t(lang, 'home.tabSelf')}`}
                onPress={() => setTaskMode('self')}
                style={styles.modeBtn}
                textStyle={styles.modeBtnText}
              />
              <BouncyPressable
                variant={taskMode === 'partner' ? 'amber' : 'ghost'}
                title={`💌 ${t(lang, 'home.tabPartner')}`}
                onPress={() => setTaskMode('partner')}
                style={styles.modeBtn}
                textStyle={styles.modeBtnText}
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
              renderItem={({ item }) => {
                const effectivePts = taskPointOverrides[item.id] ?? item.defaultPoints;
                const itemWithOverride = { ...item, defaultPoints: effectivePts };
                return (
                  <TaskCard
                    template={itemWithOverride}
                    title={templateTitle(item, lang)}
                    onClaim={handleTaskAction}
                    onEditPoints={openEditTaskModal}
                    claimButtonText={
                      taskMode === 'self' ? t(lang, 'home.claim') : t(lang, 'home.requestButton')
                    }
                    variant={taskMode === 'self' ? 'primary' : 'amber'}
                  />
                );
              }}
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
                  variant={taskMode === 'self' ? 'primary' : 'amber'}
                  title={taskMode === 'self' ? t(lang, 'home.save') : t(lang, 'home.requestButton')}
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
              <Text style={styles.sheetTitle}>
                {goalModalMode === 'edit'
                  ? `✏️ ${t(lang, 'home.editGoal')}`
                  : `🏆 ${t(lang, 'home.newGoal')}`}
              </Text>
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
              {allRewards.map((r) => {
                const isSelected = rewardId === r.id;
                return (
                  <BouncyPressable
                    key={r.id}
                    variant={isSelected ? 'secondary' : 'ghost'}
                    onPress={() => setRewardId(r.id)}
                    style={styles.rewardCard}
                  >
                    <Text style={styles.rewardEmoji}>{r.custom ? '🌟' : '🎁'}</Text>
                    <Text style={styles.rewardTitleText}>
                      {rewardTitle(r, lang)} (%{r.thresholdPct}) {r.custom ? '★' : ''}
                    </Text>
                    <Text style={styles.rewardCheck}>{isSelected ? '✓' : ''}</Text>
                  </BouncyPressable>
                );
              })}

              {/* Custom Reward Creator */}
              <View style={styles.customRewardBox}>
                <Text style={styles.customHeading}>✨ {t(lang, 'home.customRewardTitle')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t(lang, 'home.rewardPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  value={customRewardTitle}
                  onChangeText={setCustomRewardTitle}
                />
                <View style={styles.customRewardBottomRow}>
                  <View style={styles.pctChipsGroup}>
                    {[25, 60, 100].map((pct) => (
                      <BouncyPressable
                        key={pct}
                        title={`%${pct}`}
                        variant={customRewardPct === pct ? 'secondary' : 'ghost'}
                        onPress={() => setCustomRewardPct(pct)}
                        style={styles.categoryChip}
                        textStyle={styles.categoryChipText}
                      />
                    ))}
                  </View>
                  <BouncyPressable
                    variant="primary"
                    title={t(lang, 'home.addReward')}
                    onPress={saveCustomReward}
                    style={styles.saveCustomBtn}
                  />
                </View>
              </View>

              {error.length > 0 && <Text style={styles.error}>{error}</Text>}

              <View style={styles.goalActions}>
                <BouncyPressable
                  variant="amber"
                  title={
                    goalModalMode === 'edit'
                      ? `💾 ${t(lang, 'home.updateGoal')}`
                      : `🚀 ${t(lang, 'home.start')}`
                  }
                  onPress={saveGoal}
                  style={styles.startGoalBtn}
                />
                {goalModalMode === 'edit' && (
                  <BouncyPressable
                    variant="ghost"
                    title={`🔄 ${t(lang, 'home.newGoal')} (Sıfırla)`}
                    onPress={() => {
                      setGoalModalMode('new');
                      setGoalTitle('');
                      setGoalTarget('');
                    }}
                    style={styles.switchGoalModeBtn}
                    textStyle={styles.switchGoalModeText}
                  />
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Milestone Inspection Sheet / Modal */}
      <Modal visible={selectedMilestone !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.milestoneSheet}>
            {selectedMilestone && (() => {
              const milestoneTarget = Math.round(target * (selectedMilestone.pct / 100));
              const isReached = total >= milestoneTarget;
              const remaining = Math.max(0, milestoneTarget - total);
              const milestoneReward = allRewards.find(
                (r) => r.thresholdPct === selectedMilestone.pct,
              );

              return (
                <>
                  <View style={styles.sheetHeader}>
                    <View style={styles.milestoneBadgeRow}>
                      <View
                        style={[
                          styles.milestoneIconBox,
                          isReached ? styles.pinReached : styles.pinLocked,
                        ]}
                      >
                        <Text style={styles.milestoneIconText}>
                          {isReached ? '★' : '•'}
                        </Text>
                      </View>
                      <Text style={styles.sheetTitle}>
                        {t(lang, 'home.milestonesTitle')} (%{selectedMilestone.pct})
                      </Text>
                    </View>
                    <BouncyPressable
                      variant="ghost"
                      title="✕"
                      onPress={() => setSelectedMilestone(null)}
                      style={styles.closeButton}
                    />
                  </View>

                  <View style={styles.milestoneBody}>
                    <View style={styles.milestoneStatCard}>
                      <Text style={styles.milestoneStatLabel}>Gereken Hedef</Text>
                      <Text style={styles.milestoneStatValue}>{milestoneTarget} XP</Text>
                      <Text style={styles.milestoneStatSub}>
                        {isReached
                          ? '🎉 Bu kademeye ulaşıldı!'
                          : `Hedefe kalan: ${remaining} XP`}
                      </Text>
                    </View>

                    {milestoneReward && (
                      <View style={styles.milestoneRewardCard}>
                        <Text style={styles.milestoneRewardEmoji}>🎁</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.milestoneRewardHeading}>
                            Bu Kademede Açılan Ödül
                          </Text>
                          <Text style={styles.milestoneRewardName}>
                            {rewardTitle(milestoneReward, lang)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <BouncyPressable
                    variant="primary"
                    title="Tamam"
                    onPress={() => setSelectedMilestone(null)}
                    style={styles.milestoneDoneBtn}
                  />
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* Task Points Customizer Modal */}
      <Modal visible={editingTask !== null} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.taskEditSheet}>
            {editingTask && (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>✏️ {t(lang, 'home.editTaskPoints')}</Text>
                  <BouncyPressable
                    variant="ghost"
                    title="✕"
                    onPress={() => {
                      setEditingTask(null);
                      setError('');
                    }}
                    style={styles.closeButton}
                  />
                </View>

                <Text style={styles.taskEditTitle}>
                  {templateTitle(editingTask, lang)}
                </Text>
                <Text style={styles.taskEditNotice}>
                  {t(lang, 'home.minMaxPointsNotice')} (10 - 50 XP)
                </Text>

                <View style={styles.taskEditStepperRow}>
                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const n = Math.max(10, (Number(editingTaskPoints) || 10) - 5);
                      setEditingTaskPoints(String(n));
                    }}
                    style={styles.taskStepperBigBtn}
                    accessibilityRole="button"
                    accessibilityLabel="5 XP Azalt"
                  >
                    <Text style={styles.taskStepperBigText}>-5</Text>
                  </Pressable>

                  <TextInput
                    style={styles.taskEditInput}
                    value={editingTaskPoints}
                    onChangeText={setEditingTaskPoints}
                    keyboardType="number-pad"
                    maxLength={3}
                  />

                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const n = Math.min(50, (Number(editingTaskPoints) || 10) + 5);
                      setEditingTaskPoints(String(n));
                    }}
                    style={styles.taskStepperBigBtn}
                    accessibilityRole="button"
                    accessibilityLabel="5 XP Artır"
                  >
                    <Text style={styles.taskStepperBigText}>+5</Text>
                  </Pressable>
                </View>

                {error.length > 0 && <Text style={styles.error}>{error}</Text>}

                <View style={styles.taskEditActions}>
                  <BouncyPressable
                    variant="primary"
                    title={t(lang, 'home.save')}
                    onPress={saveTaskPoints}
                    style={{ flex: 1 }}
                  />
                  <BouncyPressable
                    variant="ghost"
                    title={t(lang, 'home.cancel')}
                    onPress={() => {
                      setEditingTask(null);
                      setError('');
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
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
          openNewGoalModal();
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
    gap: 4,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editGoalBtn: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  editGoalBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  activeRewardBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeRewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
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
  incomingSection: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 12,
    gap: 8,
  },
  incomingSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400e',
  },
  incomingBadge: {
    backgroundColor: '#d97706',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  incomingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  requestLeft: {
    gap: 2,
  },
  requestNote: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  requestPoints: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f766e',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionMiniBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 32,
  },
  outgoingSection: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 10,
    gap: 6,
  },
  outgoingSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  outgoingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: 10,
  },
  outgoingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  cancelMiniBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 26,
    borderRadius: 6,
  },
  cancelMiniText: {
    fontSize: 11,
    fontWeight: '700',
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
    maxHeight: 150,
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
  waitingBadge: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
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
    maxHeight: '88%',
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
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 38,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '800',
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
    maxHeight: 260,
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
  customRewardBox: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 8,
    gap: 8,
  },
  customRewardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  pctChipsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  switchGoalModeBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
  switchGoalModeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  milestoneSheet: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  milestoneBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  milestoneIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIconText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  pinReached: {
    backgroundColor: '#f59e0b',
  },
  pinLocked: {
    backgroundColor: '#cbd5e1',
  },
  milestoneBody: {
    gap: 12,
  },
  milestoneStatCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    gap: 4,
  },
  milestoneStatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  milestoneStatValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
  },
  milestoneStatSub: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e',
    marginTop: 2,
  },
  milestoneRewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
  },
  milestoneRewardEmoji: {
    fontSize: 24,
  },
  milestoneRewardHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    textTransform: 'uppercase',
  },
  milestoneRewardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#78350f',
  },
  milestoneDoneBtn: {
    marginTop: 4,
  },
  taskEditSheet: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  taskEditTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  taskEditNotice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  taskEditStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 8,
  },
  taskStepperBigBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskStepperBigText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f766e',
  },
  taskEditInput: {
    width: 80,
    height: 48,
    backgroundColor: '#f8fafc',
    borderColor: '#0f766e',
    borderWidth: 2,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  taskEditActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
