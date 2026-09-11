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
  getPersonalGoal,
  hasAppreciatedToday,
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
  GOAL_PACKAGES,
  SUGGESTIONS_BY_AUDIENCE,
  TASK_TEMPLATES,
  clampPoints,
  findTemplate,
  templateTitle,
  type GoalPackage,
  type RewardAudience,
  type TaskCategory,
  type TaskTemplate,
} from '@/mock/catalog';
import { t, type Lang } from '@/i18n/strings';
import { BouncyPressable } from './game/BouncyPressable';
import { GamifiedProgressBar } from './game/GamifiedProgressBar';
import { PersonalGoalCard } from './game/PersonalGoalCard';
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
    taskPointOverrides,
    personalGoals,
    activities,
    claimTask,
    requestTask,
    completeRequestedTask,
    addCustomTemplate,
    approveActivity,
    rejectActivity,
    appreciate,
    startNewGoal,
    updateActiveGoal,
    updatePersonalGoal,
    adjustTargetPoints,
    updateTaskPoints,
    pendingGoalProposal,
    proposeGoal,
    acceptGoalProposal,
    rejectGoalProposal,
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
  const [editingGoalTarget, setEditingGoalTarget] = useState<'common' | string>('common');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('400');
  const [m25Title, setM25Title] = useState('Kahve Kaçamağı');
  const [m60Title, setM60Title] = useState('Film Gecesi');
  const [suggestionAudience, setSuggestionAudience] = useState<RewardAudience>('ortak');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [editingTask, setEditingTask] = useState<TaskTemplate | null>(null);
  const [editingTaskPoints, setEditingTaskPoints] = useState('');
  const [error, setError] = useState('');
  const [celebratedGoalKey, setCelebratedGoalKey] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllPending, setShowAllPending] = useState(false);
  const [proposalFeedback, setProposalFeedback] = useState('');

  const applyGoalPackage = (pkg: GoalPackage) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGoalTitle(lang === 'tr' ? pkg.titleTr : pkg.titleEn);
    setGoalTarget(String(pkg.targetPoints));
    setM25Title((lang === 'tr' ? pkg.m25Tr : pkg.m25En) || '');
    setM60Title((lang === 'tr' ? pkg.m60Tr : pkg.m60En) || '');
  };

  const total = totalPoints(activities);
  const target = activeGoal.targetPoints;
  const [n1, n2] = totalsByMember(activities, members);
  const done = total >= target;
  const pending = pendingActivities(activities);
  const incoming = incomingRequests(activities, actor);
  const outgoing = outgoingRequests(activities, actor);
  const history = historyActivities(activities);
  const allTemplates: TaskTemplate[] = [...TASK_TEMPLATES, ...customTemplates];
  const streak = calculateStreak(activities);

  const partnerName =
    members.find((m) => m !== actor) ??
    (members[0] === actor ? members[1] ?? 'Partner' : members[0] ?? 'Partner');

  const maleMember: string = members[0] ?? actor ?? 'Erkek';
  const femaleMember: string = members[1] ?? partnerName ?? 'Kadın';
  const maleGoal = getPersonalGoal(personalGoals, maleMember, members);
  const femaleGoal = getPersonalGoal(personalGoals, femaleMember, members);

  // Trigger celebration modal once per completed goal instance
  useEffect(() => {
    const currentGoalKey = `${activeGoal.title}-${activeGoal.targetPoints}`;
    if (done && total > 0 && celebratedGoalKey !== currentGoalKey) {
      setCelebratedGoalKey(currentGoalKey);
      setShowCelebration(true);
    }
  }, [done, total, activeGoal.title, activeGoal.targetPoints, celebratedGoalKey]);

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
    setEditingGoalTarget('common');
    setGoalModalMode('edit');
    setGoalTitle(activeGoal.title);
    setGoalTarget(String(activeGoal.targetPoints));
    setM25Title(activeGoal.m25Title || 'Kahve Kaçamağı');
    setM60Title(activeGoal.m60Title || 'Film Gecesi');
    setSuggestionAudience('ortak');
    setError('');
    setGoalModal(true);
  };

  const openEditPersonalGoalModal = (member: string, isFemale: boolean) => {
    const goal = getPersonalGoal(personalGoals, member, members);
    setEditingGoalTarget(member);
    setGoalModalMode('edit');
    setGoalTitle(goal.title);
    setGoalTarget(String(goal.targetPoints));
    setM25Title(goal.m25Title || '');
    setM60Title(goal.m60Title || '');
    setSuggestionAudience(isFemale ? 'kadin_icin' : 'erkek_icin');
    setError('');
    setGoalModal(true);
  };

  const openNewGoalModal = () => {
    setEditingGoalTarget('common');
    setGoalModalMode('new');
    setGoalTitle('');
    setGoalTarget('400');
    setM25Title('Kahve Kaçamağı');
    setM60Title('Film Gecesi');
    setSuggestionAudience('ortak');
    setError('');
    setGoalModal(true);
  };

  const openEditTaskModal = (tpl: TaskTemplate) => {
    setTaskModal(false); // close task picker first — iOS can't stack two Modals
    setEditingTask(tpl);
    const currentPts = taskPointOverrides[tpl.id] ?? tpl.defaultPoints;
    setEditingTaskPoints(String(currentPts));
    setError('');
  };

  const saveTaskPoints = () => {
    if (!editingTask) return;
    const pts = Number(editingTaskPoints);
    const clamped = clampPoints(pts, editingTask);
    if (!Number.isFinite(pts) || pts !== clamped) {
      setError(
        lang === 'tr'
          ? `Puan ${editingTask.minPoints} ile ${editingTask.maxPoints} arasında olmalıdır.`
          : `Points must be between ${editingTask.minPoints} and ${editingTask.maxPoints}.`
      );
      return;
    }
    updateTaskPoints(editingTask.id, clamped);
    setEditingTask(null);
    setEditingTaskPoints('');
    setError('');
    setTaskModal(true); // reopen task picker
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
    const minPts = editingGoalTarget === 'common' ? 150 : 100;
    const maxPts = editingGoalTarget === 'common' ? 600 : 400;
    if (!goalTitle.trim() || !Number.isInteger(pts) || pts < minPts || pts > maxPts) {
      setError(
        editingGoalTarget === 'common'
          ? (lang === 'tr' ? 'Ortak hedef 150 - 600 puan arasında olmalıdır.' : 'Common goal must be 150 - 600 points.')
          : (lang === 'tr' ? 'Kişisel hedef 100 - 400 puan arasında olmalıdır.' : 'Personal goal must be 100 - 400 points.')
      );
      return;
    }

    if (members.length >= 2) {
      const ok = proposeGoal(
        editingGoalTarget,
        goalTitle,
        pts,
        editingGoalTarget === 'common' ? m25Title : undefined,
        editingGoalTarget === 'common' ? m60Title : undefined,
        editingGoalTarget !== 'common' ? editingGoalTarget : undefined
      );
      if (!ok) {
        setError(t(lang, 'home.badPoints'));
        return;
      }
      setGoalModal(false);
      setError('');
      setProposalFeedback(
        lang === 'tr'
          ? '🎯 Hedef teklifi eşine iletildi! Karşılıklı mutabakat bekleniyor.'
          : '🎯 Goal proposal sent to partner! Awaiting mutual approval.'
      );
      return;
    }

    if (editingGoalTarget === 'common') {
      if (goalModalMode === 'edit') {
        const ok = updateActiveGoal(goalTitle, pts, m25Title, m60Title);
        if (!ok) {
          setError(t(lang, 'home.badPoints'));
          return;
        }
      } else {
        const ok = startNewGoal(goalTitle, pts, m25Title, m60Title);
        if (!ok) {
          setError(t(lang, 'home.badPoints'));
          return;
        }
        setShowCelebration(false);
        setCelebratedGoalKey(null);
      }
    } else {
      const ok = updatePersonalGoal(editingGoalTarget, goalTitle, pts, m25Title, m60Title);
      if (!ok) {
        setError(t(lang, 'home.badPoints'));
        return;
      }
    }
    setError('');
    setGoalModal(false);
  };

  const filteredTemplates = allTemplates.filter((t) => t.category === selectedCategory);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollBox}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar: Active player chips + Streak Flame Badge */}
        <View style={styles.headerBar}>
          <View style={styles.actorGroup}>
            <Text style={styles.actorLabelText}>{t(lang, 'home.actorLabel')}:</Text>
            <View style={styles.memberChips}>
              {members.map((m) => {
                const isActive = actor === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setActor(m);
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                    style={[
                      styles.chipButton,
                      isActive ? styles.chipButtonActive : styles.chipButtonInactive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Kullanıcı ${m}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive ? styles.chipTextActive : styles.chipTextInactive,
                      ]}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Dynamic Streak Badge with Lottie Flame */}
          <StreakBadge streakDays={streak} label={lang === 'tr' ? 'Gün' : 'Days'} />
        </View>

        {/* Mutual Goal Proposal Banner */}
        {pendingGoalProposal && (
          <View style={styles.proposalCard}>
            <View style={styles.proposalHeaderRow}>
              <Text style={styles.proposalIcon}>🤝</Text>
              <View style={styles.proposalHeaderTextCol}>
                <Text style={styles.proposalTitle}>
                  {lang === 'tr' ? 'Hedef Değişiklik Teklifi' : 'Goal Change Proposal'}
                </Text>
                <Text style={styles.proposalSubtext}>
                  {pendingGoalProposal.proposedBy}{' '}
                  {pendingGoalProposal.targetType === 'common'
                    ? (lang === 'tr' ? 'ortak hedef için önerdi:' : 'proposed for common goal:')
                    : (lang === 'tr'
                      ? `${pendingGoalProposal.targetMember || ''} hedefi için önerdi:`
                      : `proposed for ${pendingGoalProposal.targetMember || ''}'s goal:`)}
                </Text>
              </View>
            </View>

            <View style={styles.proposalDetailsBox}>
              <Text style={styles.proposalTargetTitle} numberOfLines={2}>
                🏆 {pendingGoalProposal.title}
              </Text>
              <View style={styles.proposalBadgeRow}>
                <Text style={styles.proposalBadgeText}>{pendingGoalProposal.targetPoints} XP</Text>
                {pendingGoalProposal.m25Title && (
                  <Text style={styles.proposalSubBadgeText}>
                    %25: {pendingGoalProposal.m25Title}
                  </Text>
                )}
              </View>
            </View>

            {actor !== pendingGoalProposal.proposedBy ? (
              <View style={styles.proposalActionsRow}>
                <BouncyPressable
                  variant="primary"
                  title={lang === 'tr' ? '✅ Onayla' : '✅ Accept'}
                  onPress={() => {
                    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    acceptGoalProposal();
                    setProposalFeedback(
                      lang === 'tr'
                        ? '🎉 Yeni hedef mutabakatla onaylandı!'
                        : '🎉 Goal mutually approved!'
                    );
                  }}
                  style={styles.proposalActionBtn}
                />
                <BouncyPressable
                  variant="ghost"
                  title={lang === 'tr' ? '❌ Reddet' : '❌ Decline'}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    rejectGoalProposal();
                    setProposalFeedback(
                      lang === 'tr' ? 'Hedef teklifi reddedildi.' : 'Goal proposal declined.'
                    );
                  }}
                  style={styles.proposalActionBtn}
                />
              </View>
            ) : (
              <View style={styles.proposalWaitingCol}>
                <View style={styles.proposalWaitingRow}>
                  <Text style={styles.proposalWaitingText}>
                    ⏳ {lang === 'tr' ? 'Eşinin onayı bekleniyor...' : 'Awaiting partner approval...'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      void Haptics.selectionAsync();
                      rejectGoalProposal();
                      setProposalFeedback(
                        lang === 'tr' ? 'Teklif geri çekildi.' : 'Proposal retracted.'
                      );
                    }}
                    style={styles.proposalCancelBtn}
                  >
                    <Text style={styles.proposalCancelText}>
                      {lang === 'tr' ? 'Geri Çek' : 'Cancel'}
                    </Text>
                  </Pressable>
                </View>
                {(() => {
                  const partner = members.find((m) => m !== actor);
                  if (!partner) return null;
                  return (
                    <Pressable
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setActor(partner);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.proposalSwitchPartnerBtn}
                    >
                      <Text style={styles.proposalSwitchPartnerText}>
                        👤 {lang === 'tr' ? `${partner}'a Geç ve Onayla` : `Switch to ${partner} to review`}
                      </Text>
                    </Pressable>
                  );
                })()}
              </View>
            )}
          </View>
        )}

        {/* Temporary Feedback Banner */}
        {proposalFeedback.length > 0 && (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackBannerText}>{proposalFeedback}</Text>
            <Pressable onPress={() => setProposalFeedback('')}>
              <Text style={styles.feedbackCloseText}>✕</Text>
            </Pressable>
          </View>
        )}

        {/* Gamified XP Progress Bar with Integrated Common Goal Header & Journey */}
        <GamifiedProgressBar
          total={total}
          target={target}
          goalTitle={activeGoal.title}
          m25Title={activeGoal.m25Title}
          m60Title={activeGoal.m60Title}
          member1Name={maleMember}
          member1Points={n1 ?? 0}
          member2Name={femaleMember}
          member2Points={n2 ?? 0}
          color1={BAR_COLORS[0]}
          color2={BAR_COLORS[1]}
          onMilestonePress={(m) => setSelectedMilestone(m)}
          onAdjustTarget={(delta) => adjustTargetPoints(delta)}
          onEditGoal={openEditGoalModal}
        />

        {/* 2 Personal Goals: Kadının Hedefi & Erkeğin Hedefi */}
        <View style={styles.personalGoalsSection}>
          <PersonalGoalCard
            member={femaleMember}
            isFemale={true}
            points={n2 ?? 0}
            goal={femaleGoal}
            onEdit={() => openEditPersonalGoalModal(femaleMember, true)}
          />
          <PersonalGoalCard
            member={maleMember}
            isFemale={false}
            points={n1 ?? 0}
            goal={maleGoal}
            onEdit={() => openEditPersonalGoalModal(maleMember, false)}
          />
        </View>

        {/* Primary Action Buttons: Add Task & Appreciation */}
        {(() => {
          const isAppreciated = hasAppreciatedToday(activities, actor);
          return (
            <View style={styles.actionRow}>
              <BouncyPressable
                variant="primary"
                title={`⚡ ${t(lang, 'home.addPoints')}`}
                onPress={() => setTaskModal(true)}
                style={styles.actionButton}
                textStyle={styles.actionText}
              />
              <BouncyPressable
                variant={isAppreciated ? 'ghost' : 'amber'}
                title={
                  isAppreciated
                    ? (lang === 'tr' ? '💖 Teşekkür Edildi' : '💖 Appreciated')
                    : `💖 ${t(lang, 'home.thanks')}`
                }
                disabled={isAppreciated}
                onPress={() => appreciate()}
                style={styles.actionButton}
                textStyle={styles.actionText}
              />
            </View>
          );
        })()}

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
          <View style={styles.pendingList}>
            {(showAllPending ? pending : pending.slice(0, 3)).map((item) => {
              const isMyClaim = item.claimedBy === actor;
              return (
                <View key={item.id} style={styles.pendingCard}>
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
            })}
            {pending.length > 3 && (
              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  setShowAllPending(!showAllPending);
                }}
                style={styles.showMoreBtn}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <Text style={styles.showMoreText}>
                  {showAllPending
                    ? (lang === 'tr' ? '▲ Daha Az Göster' : '▲ Show Less')
                    : (lang === 'tr' ? `▼ Daha Fazla Göster (+${pending.length - 3})` : `▼ Show More (+${pending.length - 3})`)}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* History Section */}
        <Text style={styles.sectionTitle}>{t(lang, 'home.history')}</Text>
        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t(lang, 'home.empty')}</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {(showAllHistory ? history : history.slice(0, 3)).map((item) => {
              const isApproved = item.status === 'approved';
              const actionSuffix = isApproved
                ? (lang === 'tr' ? (item.type === 'appreciation' ? '(etti)' : '(yaptı)') : (item.type === 'appreciation' ? '(appreciated)' : '(did it)'))
                : (lang === 'tr' ? '(olmadı)' : '(rejected)');
              return (
                <View key={item.id} style={[styles.historyCard, !isApproved && styles.historyRejectedCard]}>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyName} numberOfLines={1}>{item.claimedBy}</Text>
                    <Text style={[styles.historyItemTitle, !isApproved && styles.rejectedText]} numberOfLines={1}>
                      {item.title} {actionSuffix}
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
            })}
            {history.length > 3 && (
              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  setShowAllHistory(!showAllHistory);
                }}
                style={styles.showMoreBtn}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              >
                <Text style={styles.showMoreText}>
                  {showAllHistory
                    ? (lang === 'tr' ? '▲ Daha Az Göster' : '▲ Show Less')
                    : (lang === 'tr' ? `▼ Daha Fazla Göster (+${history.length - 3})` : `▼ Show More (+${history.length - 3})`)}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

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

            {/* Mode Switcher */}
            <View style={styles.modeSwitcher}>
              <View style={{ flex: 1 }}>
                <BouncyPressable
                  variant={taskMode === 'self' ? 'primary' : 'ghost'}
                  title={`🙋 ${t(lang, 'home.tabSelf')}`}
                  onPress={() => setTaskMode('self')}
                  style={styles.modeBtn}
                  textStyle={styles.modeBtnText}
                />
              </View>
              <View style={{ flex: 1 }}>
                <BouncyPressable
                  variant={taskMode === 'partner' ? 'amber' : 'ghost'}
                  title={`💌 ${t(lang, 'home.tabPartner')}`}
                  onPress={() => setTaskMode('partner')}
                  style={styles.modeBtn}
                  textStyle={styles.modeBtnText}
                />
              </View>
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

            {/* Task list */}
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

            {/* Custom Card Creator */}
            <View style={styles.customSection}>
              <View style={styles.customSectionHeader}>
                <Text style={styles.customHeading}>✨ {t(lang, 'home.customTitle')}</Text>
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
              </View>
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
                {editingGoalTarget === 'common'
                  ? (goalModalMode === 'edit'
                    ? (lang === 'tr' ? '✏️ Ortak Hedefi Düzenle' : '✏️ Edit Common Goal')
                    : (lang === 'tr' ? '🏆 Yeni Ortak Hedef' : '🏆 New Common Goal'))
                  : (editingGoalTarget === femaleMember
                    ? `🍷 ${femaleMember}'nin Hedefi`
                    : `🎮 ${maleMember}'nin Hedefi`)}
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

            <ScrollView
              style={styles.goalModalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.goalFormContent}
            >
              {/* Ready-made Goal Packages - Filtered by Target */}
              <Text style={styles.pkgSectionTitle}>🎁 Hazır Hedef Paketleri (Tek Tıkla Yükle)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pkgScrollRow}
              >
                {GOAL_PACKAGES.filter((pkg) => {
                  if (editingGoalTarget === femaleMember) return pkg.audience === 'kadin_icin';
                  if (editingGoalTarget === maleMember) return pkg.audience === 'erkek_icin';
                  return pkg.audience === 'ortak';
                }).map((pkg) => {
                  const title = lang === 'tr' ? pkg.titleTr : pkg.titleEn;
                  const isSelected = goalTitle === title;
                  return (
                    <Pressable
                      key={pkg.id}
                      onPress={() => applyGoalPackage(pkg)}
                      style={[
                        styles.pkgCard,
                        isSelected && styles.pkgCardSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={title}
                    >
                      <Text style={styles.pkgBadge}>{pkg.badge}</Text>
                      <View style={styles.pkgInfo}>
                        <Text
                          style={[styles.pkgTitle, isSelected && styles.pkgTitleSelected]}
                          numberOfLines={1}
                        >
                          {title}
                        </Text>
                        <Text style={styles.pkgTargetText}>{pkg.targetPoints} XP</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Goal Title Input + Quick Suggestions */}
              <Text style={styles.inputLabel}>
                {editingGoalTarget === 'common'
                  ? `🏆 ${t(lang, 'home.goal')} (Büyük Ödül - %100)`
                  : (editingGoalTarget === femaleMember
                    ? `🍷 ${femaleMember}'nin Büyük Hedefi`
                    : `🎮 ${maleMember}'nin Büyük Hedefi`)}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t(lang, 'home.goalTitlePlaceholder')}
                placeholderTextColor="#94a3b8"
                value={goalTitle}
                onChangeText={setGoalTitle}
              />
              {/* Quick Suggestions */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionChipsRow}
              >
                {SUGGESTIONS_BY_AUDIENCE[suggestionAudience].m100.map((sug, i) => {
                  const text = lang === 'tr' ? sug.tr : sug.en;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setGoalTitle(text);
                      }}
                      style={styles.suggestionChip}
                    >
                      <Text style={styles.suggestionChipText}>+ {text}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Target XP Input & Presets */}
              <Text style={styles.inputLabel}>
                {editingGoalTarget === 'common'
                  ? (lang === 'tr' ? '🎯 Ortak Hedef Puanı (150 - 600 XP)' : '🎯 Common Goal Points (150 - 600 XP)')
                  : (lang === 'tr' ? '🎯 Kişisel Hedef Puanı (100 - 400 XP)' : '🎯 Personal Goal Points (100 - 400 XP)')}
              </Text>
              <View style={styles.goalTargetRow}>
                <Pressable
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const minAllowed = editingGoalTarget === 'common' ? 150 : 100;
                    const n = Math.max(minAllowed, (Number(goalTarget) || 200) - 50);
                    setGoalTarget(String(n));
                  }}
                  style={styles.stepperBigBtn}
                  accessibilityRole="button"
                  accessibilityLabel="50 XP Azalt"
                >
                  <Text style={styles.stepperBigText}>-50</Text>
                </Pressable>

                <TextInput
                  style={styles.goalTargetInput}
                  value={goalTarget}
                  onChangeText={setGoalTarget}
                  keyboardType="number-pad"
                />

                <Pressable
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const maxAllowed = editingGoalTarget === 'common' ? 600 : 400;
                    const n = Math.min(maxAllowed, (Number(goalTarget) || 200) + 50);
                    setGoalTarget(String(n));
                  }}
                  style={styles.stepperBigBtn}
                  accessibilityRole="button"
                  accessibilityLabel="50 XP Artır"
                >
                  <Text style={styles.stepperBigText}>+50</Text>
                </Pressable>
              </View>

              <View style={styles.xpPresetRow}>
                {(editingGoalTarget === 'common' ? [150, 250, 400, 600] : [100, 150, 200, 300]).map((xp) => (
                  <Pressable
                    key={xp}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setGoalTarget(String(xp));
                    }}
                    style={[
                      styles.xpPresetChip,
                      Number(goalTarget) === xp && styles.xpPresetChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.xpPresetText,
                        Number(goalTarget) === xp && styles.xpPresetTextActive,
                      ]}
                    >
                      {xp} XP
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Ara Ödüller - Only for Common Goal */}
              {editingGoalTarget === 'common' && (
                <>
                  <Text style={styles.inputLabel}>⭐ Yoldaki Ara Ödüller</Text>

                  {/* %25 Section */}
                  <View style={styles.stepRewardRow}>
                    <View style={styles.stepRewardTagBox}>
                      <Text style={styles.stepRewardTag}>%25</Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.stepRewardInput]}
                      placeholder="Ara Ödül (örn. Kahve Kaçamağı)"
                      placeholderTextColor="#94a3b8"
                      value={m25Title}
                      onChangeText={setM25Title}
                    />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestionChipsRow}
                  >
                    {SUGGESTIONS_BY_AUDIENCE[suggestionAudience].m25.map((sug, i) => {
                      const text = lang === 'tr' ? sug.tr : sug.en;
                      return (
                        <Pressable
                          key={i}
                          onPress={() => {
                            void Haptics.selectionAsync();
                            setM25Title(text);
                          }}
                          style={styles.suggestionChip}
                        >
                          <Text style={styles.suggestionChipText}>+ {text}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* %60 Section */}
                  <View style={styles.stepRewardRow}>
                    <View style={styles.stepRewardTagBox}>
                      <Text style={styles.stepRewardTag}>%60</Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.stepRewardInput]}
                      placeholder="Ara Ödül (örn. Film Gecesi)"
                      placeholderTextColor="#94a3b8"
                      value={m60Title}
                      onChangeText={setM60Title}
                    />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestionChipsRow}
                  >
                    {SUGGESTIONS_BY_AUDIENCE[suggestionAudience].m60.map((sug, i) => {
                      const text = lang === 'tr' ? sug.tr : sug.en;
                      return (
                        <Pressable
                          key={i}
                          onPress={() => {
                            void Haptics.selectionAsync();
                            setM60Title(text);
                          }}
                          style={styles.suggestionChip}
                        >
                          <Text style={styles.suggestionChipText}>+ {text}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </>
              )}

              {error.length > 0 && <Text style={styles.error}>{error}</Text>}

              <View style={styles.goalActions}>
                <BouncyPressable
                  variant="amber"
                  title={
                    members.length >= 2
                      ? (lang === 'tr' ? '🤝 Eşime Onaya Gönder' : '🤝 Send for Partner Approval')
                      : (goalModalMode === 'edit'
                        ? `💾 ${t(lang, 'home.updateGoal')}`
                        : `🚀 ${t(lang, 'home.start')}`)
                  }
                  onPress={saveGoal}
                  style={styles.startGoalBtn}
                />
                {editingGoalTarget === 'common' && goalModalMode === 'edit' && (
                  <BouncyPressable
                    variant="ghost"
                    title={`🔄 ${t(lang, 'home.newGoal')} (Sıfırla)`}
                    onPress={() => {
                      setGoalModalMode('new');
                      setGoalTitle('');
                      setGoalTarget('400');
                      setM25Title('Kahve Kaçamağı');
                      setM60Title('Film Gecesi');
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
              const milestoneRewardName =
                selectedMilestone.pct === 25
                  ? (activeGoal.m25Title || 'Kahve Kaçamağı')
                  : selectedMilestone.pct === 60
                    ? (activeGoal.m60Title || 'Film Gecesi')
                    : activeGoal.title;
              const milestoneEmoji =
                selectedMilestone.pct === 25 ? '☕' : selectedMilestone.pct === 60 ? '🎬' : '🏆';

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

                    <View style={styles.milestoneRewardCard}>
                      <Text style={styles.milestoneRewardEmoji}>{milestoneEmoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.milestoneRewardHeading}>
                          {selectedMilestone.pct === 100
                            ? 'Büyük Hedef'
                            : 'Bu Kademede Açılan Ara Ödül'}
                        </Text>
                        <Text style={styles.milestoneRewardName}>
                          {milestoneRewardName}
                        </Text>
                      </View>
                    </View>
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
                      setTaskModal(true);
                    }}
                    style={styles.closeButton}
                  />
                </View>

                <Text style={styles.taskEditTitle}>
                  {templateTitle(editingTask, lang)}
                </Text>
                <Text style={styles.taskEditNotice}>
                  {lang === 'tr'
                    ? `${editingTask.minPoints} ile ${editingTask.maxPoints} XP arasında olmalıdır`
                    : `Must be between ${editingTask.minPoints} and ${editingTask.maxPoints} XP`}
                </Text>

                <View style={styles.taskEditStepperRow}>
                  <Pressable
                    onPress={() => {
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const n = Math.max(editingTask.minPoints, (Number(editingTaskPoints) || editingTask.minPoints) - 5);
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
                      const n = Math.min(editingTask.maxPoints, (Number(editingTaskPoints) || editingTask.minPoints) + 5);
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
                  <View style={{ flex: 1 }}>
                    <BouncyPressable
                      variant="primary"
                      title={t(lang, 'home.save')}
                      onPress={saveTaskPoints}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <BouncyPressable
                      variant="ghost"
                      title={t(lang, 'home.cancel')}
                      onPress={() => {
                        setEditingTask(null);
                        setError('');
                        setTaskModal(true);
                      }}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Screen-Wide Celebration Overlay with Confetti & Trophy */}
      <CelebrationOverlay
        visible={showCelebration}
        title={activeGoal.title}
        subtitle={`${total} / ${target} XP Ulaşıldı!`}
        newGoalButtonText={t(lang, 'home.newGoal')}
        onNewGoal={() => {
          setShowCelebration(false);
          // Wait for celebration modal to dismiss on iOS before presenting goal modal
          setTimeout(() => {
            openNewGoalModal();
          }, 350);
        }}
        onClose={() => setShowCelebration(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 64,
    gap: 8,
  },
  box: {
    flex: 1,
    backgroundColor: '#f8fafc',
    gap: 8,
    padding: 14,
    paddingTop: 8,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actorLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  memberChips: {
    flexDirection: 'row',
    gap: 5,
  },
  chipButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipButtonActive: {
    backgroundColor: '#2563eb',
  },
  chipButtonInactive: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: '#475569',
  },
  goalHeader: {
    gap: 2,
  },
  personalGoalsSection: {
    gap: 6,
    marginTop: 4,
    marginBottom: 2,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editGoalBtn: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  editGoalBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  activeRewardBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
    maxWidth: '100%',
  },
  activeRewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
  },
  goalSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  goalMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 2,
  },
  actionButton: {
    flex: 1,
    minHeight: 34,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderBottomWidth: 3,
  },
  actionText: {
    fontSize: 12.5,
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
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
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
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  pendingList: {
    gap: 6,
  },
  pendingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 9,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    marginBottom: 4,
    gap: 6,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingClaimer: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ea580c',
  },
  pendingTaskTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginHorizontal: 6,
  },
  pendingPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f766e',
  },
  waitingBadge: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  pointsInput: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
    width: 48,
    textAlign: 'center',
  },
  miniBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    minHeight: 30,
  },
  miniBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  historyList: {
    gap: 4,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 3,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    width: 45,
  },
  historyItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    marginHorizontal: 4,
  },
  rejectedText: {
    textDecorationLine: 'line-through',
  },
  showMoreBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    alignSelf: 'center',
  },
  showMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 20,
    height: '92%',
    gap: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    minHeight: 30,
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
  floatingModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    padding: 5,
    gap: 5,
    marginHorizontal: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modeBtn: {
    paddingVertical: 5,
    borderRadius: 8,
    minHeight: 30,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 8,
    minHeight: 28,
  },
  categoryTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskList: {
    flex: 1,
  },
  customSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    gap: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginTop: 2,
  },
  customSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  customHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 8,
    fontSize: 13,
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
    minWidth: 72,
    paddingVertical: 8,
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
  goalModalScroll: {
    flexShrink: 1,
  },
  pkgSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
    marginBottom: 4,
  },
  pkgScrollRow: {
    gap: 8,
    paddingVertical: 4,
  },
  pkgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  pkgCardSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  pkgBadge: {
    fontSize: 20,
  },
  pkgInfo: {
    gap: 2,
  },
  pkgTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  pkgTitleSelected: {
    color: '#047857',
  },
  pkgTargetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  suggestionChipsRow: {
    gap: 6,
    paddingVertical: 4,
    marginBottom: 4,
  },
  suggestionChip: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  goalActions: {
    marginTop: 10,
    marginBottom: 16,
    gap: 8,
  },
  startGoalBtn: {
    width: '100%',
  },
  goalFormContent: {
    gap: 8,
    paddingBottom: 36,
  },
  goalTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 2,
  },
  stepperBigBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBigText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f766e',
  },
  goalTargetInput: {
    width: 88,
    height: 40,
    backgroundColor: '#f8fafc',
    borderColor: '#0f766e',
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  xpPresetRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 4,
  },
  xpPresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  xpPresetChipActive: {
    backgroundColor: '#ccfbf1',
    borderColor: '#14b8a6',
  },
  xpPresetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  xpPresetTextActive: {
    color: '#0f766e',
    fontWeight: '800',
  },
  milestonesMiniRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  miniMilestonePill: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  miniMilestoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  stepRewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stepRewardTagBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRewardTag: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f766e',
  },
  stepRewardInput: {
    flex: 1,
    marginBottom: 0,
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
  proposalCard: {
    backgroundColor: '#fefce8',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#facc15',
    padding: 14,
    marginBottom: 12,
    gap: 10,
    shadowColor: '#ca8a04',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  proposalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proposalIcon: {
    fontSize: 24,
  },
  proposalHeaderTextCol: {
    flex: 1,
    gap: 2,
  },
  proposalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#854d0e',
  },
  proposalSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a16207',
  },
  proposalDetailsBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fef08a',
    gap: 6,
  },
  proposalTargetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  proposalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  proposalBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#d97706',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proposalSubBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  proposalActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  proposalActionBtn: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
  },
  proposalWaitingCol: {
    gap: 6,
    paddingVertical: 2,
  },
  proposalWaitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  proposalSwitchPartnerBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  proposalSwitchPartnerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  proposalWaitingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
    flex: 1,
  },
  proposalCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  proposalCancelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#dc2626',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  feedbackBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
  },
  feedbackCloseText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
    paddingLeft: 8,
  },
});
