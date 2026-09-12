import { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BouncyPressable } from './game/BouncyPressable';
import { GamifiedProgressBar } from './game/GamifiedProgressBar';
import { PersonalGoalCard } from './game/PersonalGoalCard';
import { StreakBadge } from './game/StreakBadge';
import { TaskCard } from './game/TaskCard';
import { CelebrationOverlay } from './game/CelebrationOverlay';
import { MilestoneRewardModal } from './game/MilestoneRewardModal';
import { XPBurstOverlay, type BurstData } from './game/XPBurstOverlay';
import { colors, radii, shadows } from '@/theme/tokens';

const BAR_COLORS = [colors.copper[500], colors.emerald[600]];

export function HomeScreen({ lang = 'tr' }: { lang?: Lang }) {
  const insets = useSafeAreaInsets();
  const {
    pairingCode,
    partnerJoined,
    dismissPairingCode,
    members,
    actor,
    reset,
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
  const [showIndividualGoals, setShowIndividualGoals] = useState(true);
  const [burstData, setBurstData] = useState<BurstData | null>(null);
  const [milestoneReward, setMilestoneReward] = useState<{
    pct: number;
    title: string;
  } | null>(null);
  const [celebratedMilestones, setCelebratedMilestones] = useState<string[]>([]);

  const sendLoveReaction = (receiverName: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setBurstData({
      id: Date.now().toString(),
      text: '💋 ÖPÜCÜK FIRLATILDI!',
      subText: `${receiverName}'a kocaman bir öpücük gönderdin!`,
      emoji: '💋',
    });
  };

  const handleAppreciate = () => {
    appreciate();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBurstData({
      id: Date.now().toString(),
      text: '+50 XP SEVGİ PUANI!',
      subText: `💖 ${partnerName}'a teşekkür ettin!`,
      emoji: '💋',
    });
  };

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
  const currentPct = target > 0 ? (total / target) * 100 : 0;
  const pending = pendingActivities(activities);
  const incoming = incomingRequests(activities, actor);
  const outgoing = outgoingRequests(activities, actor);
  const history = historyActivities(activities);
  const allTemplates: TaskTemplate[] = [...TASK_TEMPLATES, ...customTemplates];
  const streak = calculateStreak(activities);

  const partnerName =
    members.find((m) => m !== actor) ??
    (members[0] === actor ? members[1] ?? 'Partner' : members[0] ?? 'Partner');

  const femaleMember: string = members[0] ?? actor ?? 'Kadın';
  const maleMember: string = members[1] ?? partnerName ?? 'Erkek';
  const femaleGoal = getPersonalGoal(personalGoals, femaleMember, members);
  const maleGoal = getPersonalGoal(personalGoals, maleMember, members);

  // Trigger celebration modal once per completed goal instance
  useEffect(() => {
    const currentGoalKey = `${activeGoal.title}-${activeGoal.targetPoints}`;
    if (done && total > 0 && celebratedGoalKey !== currentGoalKey) {
      setCelebratedGoalKey(currentGoalKey);
      setShowCelebration(true);
    }
  }, [done, total, activeGoal.title, activeGoal.targetPoints, celebratedGoalKey]);

  // Trigger milestone reward modal when 25% or 60% is reached
  useEffect(() => {
    if (target <= 0 || total <= 0) return;
    const goalPrefix = `${activeGoal.title}-${activeGoal.targetPoints}`;

    if (currentPct >= 60 && activeGoal.m60Title) {
      const m60Key = `${goalPrefix}-m60`;
      if (!celebratedMilestones.includes(m60Key)) {
        setCelebratedMilestones((prev) => [...prev, m60Key]);
        setMilestoneReward({ pct: 60, title: activeGoal.m60Title });
        return;
      }
    }

    if (currentPct >= 25 && activeGoal.m25Title) {
      const m25Key = `${goalPrefix}-m25`;
      if (!celebratedMilestones.includes(m25Key)) {
        setCelebratedMilestones((prev) => [...prev, m25Key]);
        setMilestoneReward({ pct: 25, title: activeGoal.m25Title });
      }
    }
  }, [currentPct, total, target, activeGoal.title, activeGoal.targetPoints, activeGoal.m25Title, activeGoal.m60Title, celebratedMilestones]);

  const handleTaskAction = (tpl: TaskTemplate) => {
    const title = templateTitle(tpl, lang);
    const effectivePoints = taskPointOverrides[tpl.id] ?? tpl.defaultPoints;
    if (taskMode === 'self') {
      const id = claimTask(title, effectivePoints, tpl.id);
      if (id) {
        setTaskModal(false);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setBurstData({
          id: Date.now().toString(),
          text: `+${effectivePoints} XP TALEP EDİLDİ!`,
          subText: '⚡ Eşinin onayına gönderildi',
          emoji: '🚀',
        });
      }
    } else {
      const id = requestTask(title, effectivePoints, tpl.id);
      if (id) {
        setTaskModal(false);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setBurstData({
          id: Date.now().toString(),
          text: 'İSTEK İLETİLDİ!',
          subText: `💌 ${partnerName}'a rica iletildi`,
          emoji: '💌',
        });
      }
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
    const finalPoints = tpl
      ? clampPoints(Number.isFinite(n) ? n : fallback, tpl)
      : (Number.isFinite(n) && n > 0 ? n : fallback);
    const ok = approveActivity(id, finalPoints);
    if (ok) {
      setAdjust((s) => ({ ...s, [id]: '' }));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setBurstData({
        id: Date.now().toString(),
        text: `+${finalPoints} XP KAZANILDI!`,
        subText: '🎉 Harikasınız! Görev Onaylandı',
        emoji: '🎯',
      });
    }
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
      {/* Pinned Solid White Top Header */}
      <View style={[styles.customHeaderBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerLeftContainer}>
          <Text style={styles.welcomeText}>
            👋 {lang === 'tr' ? `Hoş geldin, ${actor || members[0] || ''}` : `Welcome, ${actor || members[0] || ''}`}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <StreakBadge streakDays={streak} label={lang === 'tr' ? 'Gün' : 'Days'} />
          <Pressable
            onPress={() => {
              Alert.alert(
                lang === 'tr' ? 'Eşleşmeden Çık' : 'Leave Couple',
                lang === 'tr' ? 'Mevcut eşleşmeden çıkıp başlangıç ekranına dönmek istiyor musunuz?' : 'Do you want to leave the couple and return to the start screen?',
                [
                  { text: lang === 'tr' ? 'Vazgeç' : 'Cancel', style: 'cancel' },
                  { text: lang === 'tr' ? 'Çıkış Yap' : 'Leave', style: 'destructive', onPress: () => reset() },
                ]
              );
            }}
            style={styles.headerLeaveBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Eşleşmeden Çık"
          >
            <Text style={styles.headerLeaveBtnText}>🚪 Çıkış</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollBox}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {pairingCode && !partnerJoined && (
          <View style={{ backgroundColor: '#ecfdf5', padding: 14, borderRadius: 16, marginBottom: 16, alignItems: 'center', borderColor: '#a7f3d0', borderWidth: 1.5, position: 'relative' }}>
            <Pressable
              onPress={dismissPairingCode}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ position: 'absolute', top: 10, right: 12, padding: 4 }}
            >
              <Text style={{ color: '#059669', fontSize: 16, fontWeight: '700' }}>✕</Text>
            </Pressable>
            <Text style={{ color: '#059669', fontWeight: '700', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 }}>
              {lang === 'tr' ? 'Partnerine bu kodu vererek seni eklemesini sağlayabilirsin:' : 'Share this code with your partner to join:'}
            </Text>
            <Text style={{ fontSize: 30, fontWeight: '900', letterSpacing: 6, color: '#065f46', marginVertical: 6 }}>
              {pairingCode}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>
              {lang === 'tr' ? '⏳ Eşiniz koda katıldığında bu alan otomatik kapanır.' : '⏳ Automatically closes when your partner joins.'}
            </Text>
          </View>
        )}

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
          member1Name={femaleMember}
          member1Points={n1 ?? 0}
          member2Name={maleMember}
          member2Points={n2 ?? 0}
          color1={BAR_COLORS[0]}
          color2={BAR_COLORS[1]}
          onMilestonePress={(m) => {
            setSelectedMilestone(m);
            if (m.pct === 25 && activeGoal.m25Title) {
              setMilestoneReward({ pct: 25, title: activeGoal.m25Title });
            } else if (m.pct === 60 && activeGoal.m60Title) {
              setMilestoneReward({ pct: 60, title: activeGoal.m60Title });
            }
          }}
          onAdjustTarget={(delta) => adjustTargetPoints(delta)}
          onEditGoal={openEditGoalModal}
        />

        {/* Individual Goals Toggle Explanation */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <BouncyPressable
            variant="ghost"
            title={showIndividualGoals ? "👀 Bireysel Hedefleri Kapat" : "👀 Bireysel Hedefleri Aç"}
            onPress={() => {
              Alert.alert(
                "Bireysel Hedefler",
                "Uygulamamızın temel amacı aranızda bir rekabet ve çatışma doğurmak değil, birlikte zaman geçirmektir. Eğer bireysel ödüller (erkeğin / kadının hedefleri) adil hissettirmiyor veya bir rekabet yaratıyorsa, sadece Ortak Hedefe odaklanmak için bu kartları tamamen kapatabilirsiniz. (Kapatıldığında iki taraf için de gizlenir ve tamamen adil olur.)",
                [
                  { text: "Vazgeç", style: "cancel" },
                  {
                    text: showIndividualGoals ? "Kapat" : "Aç",
                    style: showIndividualGoals ? "destructive" : "default",
                    onPress: () => setShowIndividualGoals(!showIndividualGoals)
                  }
                ]
              );
            }}
            style={{ paddingVertical: 4, minHeight: 28, paddingHorizontal: 12 }}
            textStyle={{ fontSize: 12, color: '#64748b' }}
          />
        </View>

        {/* 2 Personal Goals: Kadının Hedefi & Erkeğin Hedefi */}
        {showIndividualGoals && (
          <View style={styles.personalGoalsSection}>
            <PersonalGoalCard
              member={femaleMember}
              isFemale={true}
              points={n1 ?? 0}
              goal={femaleGoal}
              accentColor={BAR_COLORS[0]}
              onEdit={() => openEditPersonalGoalModal(femaleMember, true)}
            />
            <PersonalGoalCard
              member={maleMember}
              isFemale={false}
              points={n2 ?? 0}
              goal={maleGoal}
              accentColor={BAR_COLORS[1]}
              onEdit={() => openEditPersonalGoalModal(maleMember, false)}
            />
          </View>
        )}

        {/* Primary Action Buttons: Add Task & Appreciation */}
        {(() => {
          const isAppreciated = hasAppreciatedToday(activities, actor);
          return (
            <View style={styles.actionRow}>
              <BouncyPressable
                variant="primary"
                title={`⚡ ${t(lang, 'home.addPoints')}`}
                onPress={() => setTaskModal(true)}
                wrapperStyle={styles.actionButtonWrapper}
                style={styles.actionButton}
                textStyle={styles.actionText}
              />
              <BouncyPressable
                variant={isAppreciated ? 'ghost' : 'love'}
                title={
                  isAppreciated
                    ? (lang === 'tr' ? '💖 Teşekkür Edildi' : '💖 Appreciated')
                    : `💖 ${t(lang, 'home.thanks')}`
                }
                disabled={isAppreciated}
                onPress={handleAppreciate}
                wrapperStyle={styles.actionButtonWrapper}
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
                  <Text style={styles.requestTitle}>
                    {lang === 'tr' ? `"${item.title}" görevini yapmanı rica ederim.` : `Could you please do: "${item.title}"?`}
                  </Text>
                  <Text style={styles.requestPoints}>+{item.requestedPoints} XP</Text>
                </View>
                <View style={styles.requestActions}>
                  <BouncyPressable
                    variant="success"
                    title={`✨ ${t(lang, 'home.markDone')}`}
                    onPress={() => {
                      completeRequestedTask(item.id);
                      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      setBurstData({
                        id: Date.now().toString(),
                        text: `+${item.requestedPoints} XP TAMAMLANDI!`,
                        subText: '✨ Eşinin onayına sunuldu!',
                        emoji: '💫',
                      });
                    }}
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
              ⏳ {lang === 'tr' ? "Eşine gönderdiğin istekler:" : "Requests sent to partner:"}
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
              const isAppreciation = item.type === 'appreciation' || item.title.toLowerCase().includes('takdir') || item.title.toLowerCase().includes('teşekkür');
              const displayText = isAppreciation
                ? (lang === 'tr' ? 'Teşekkür etti' : 'Said thanks')
                : `${item.title} ${isApproved ? (lang === 'tr' ? '(yaptı)' : '(did it)') : (lang === 'tr' ? '(olmadı)' : '(rejected)')}`;

              return (
                <View key={item.id} style={[styles.historyCard, !isApproved && styles.historyRejectedCard]}>
                  <View style={styles.historyRow}>
                    <Text style={styles.historyName} numberOfLines={1}>{item.claimedBy}</Text>
                    <Text style={[styles.historyItemTitle, !isApproved && styles.rejectedText]} numberOfLines={1}>
                      {displayText}
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
                    {isApproved && (
                      <Pressable
                        onPress={() => sendLoveReaction(item.claimedBy)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.loveReactBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Öpücük Gönder"
                      >
                        <Text style={styles.loveReactText}>💋</Text>
                      </Pressable>
                    )}
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
      <Modal visible={taskModal} transparent animationType="slide" onRequestClose={() => setTaskModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
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
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
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
        </KeyboardAvoidingView>
      </Modal>

      {/* Goal Setting Modal */}
      <Modal visible={goalModal} transparent animationType="slide" onRequestClose={() => setGoalModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
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
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
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
        </KeyboardAvoidingView>
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
      <Modal visible={editingTask !== null} transparent animationType="fade" onRequestClose={() => setEditingTask(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
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
        </KeyboardAvoidingView>
      </Modal>

      {/* Screen-Wide Celebration Overlay with Confetti & Trophy */}
      <CelebrationOverlay
        visible={showCelebration}
        title={activeGoal.title}
        subtitle={`${total} / ${target} XP Ulaşıldı!`}
        onNewGoal={() => {
          setShowCelebration(false);
          // Wait for celebration modal to dismiss on iOS before presenting goal modal
          setTimeout(() => {
            openNewGoalModal();
          }, 350);
        }}
        onClose={() => setShowCelebration(false)}
      />

      {/* Milestone Reward Popup Modal */}
      {milestoneReward && (
        <MilestoneRewardModal
          visible={Boolean(milestoneReward)}
          milestonePct={milestoneReward.pct}
          rewardTitle={milestoneReward.title}
          partnerName={partnerName}
          onClaimBreak={() => {
            const reward = milestoneReward;
            setMilestoneReward(null);
            if (reward) {
              sendLoveReaction(partnerName);
            }
          }}
          onClose={() => setMilestoneReward(null)}
        />
      )}

      {/* Floating XP Burst and Love Reactions Overlay */}
      <XPBurstOverlay burst={burstData} onComplete={() => setBurstData(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollBox: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 64,
    gap: 10,
  },
  box: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    gap: 10,
    padding: 14,
    paddingTop: 8,
  },
  customHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    ...shadows.soft,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLeaveBtn: {
    backgroundColor: colors.rose[50],
    borderColor: colors.rose[200],
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeaveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.rose[600],
  },
  actorLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[500],
  },
  memberChips: {
    flexDirection: 'row',
    gap: 5,
  },
  chipButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.2,
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
    backgroundColor: colors.emerald[50],
    borderColor: colors.emerald[200],
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  editGoalBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.emerald[700],
  },
  activeRewardBadge: {
    backgroundColor: colors.copper[50],
    borderColor: colors.copper[200],
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
    maxWidth: '100%',
  },
  activeRewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.copper[700],
  },
  goalSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.emerald[700],
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  goalMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  actionButtonWrapper: {
    flex: 1,
  },
  actionButton: {
    width: '100%',
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radii.md,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  incomingSection: {
    backgroundColor: colors.copper[50],
    borderColor: colors.copper[200],
    borderWidth: 1.5,
    borderRadius: radii.lg,
    padding: 12,
    gap: 8,
    ...shadows.soft,
  },
  incomingSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.copper[800],
  },
  incomingBadge: {
    backgroundColor: colors.copper[600],
    borderRadius: radii.full,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  incomingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.copper[100],
  },
  requestLeft: {
    gap: 2,
  },
  requestNote: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.copper[700],
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  requestPoints: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.emerald[700],
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionMiniBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    minHeight: 32,
  },
  outgoingSection: {
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    padding: 10,
    gap: 6,
  },
  outgoingSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  outgoingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    padding: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  outgoingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[800],
    flex: 1,
  },
  cancelMiniBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 26,
    borderRadius: radii.xs,
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
    color: colors.neutral[900],
    letterSpacing: 0.3,
  },
  pendingCountBadge: {
    backgroundColor: colors.copper[500],
    borderRadius: radii.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  pendingCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: colors.neutral[400],
    fontWeight: '600',
  },
  pendingList: {
    gap: 6,
  },
  pendingCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.copper[200],
    marginBottom: 4,
    gap: 6,
    ...shadows.soft,
  },
  pendingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pendingClaimer: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.copper[600],
  },
  pendingTaskTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[900],
    flex: 1,
    marginHorizontal: 6,
  },
  pendingPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emerald[700],
  },
  waitingBadge: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[200],
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  pointsInput: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
    borderWidth: 1,
    borderRadius: radii.xs,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
    width: 48,
    textAlign: 'center',
    color: colors.neutral[900],
  },
  miniBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
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
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.neutral[200],
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
    color: colors.neutral[500],
    width: 48,
  },
  historyItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[800],
    flex: 1,
    marginHorizontal: 4,
  },
  rejectedText: {
    textDecorationLine: 'line-through',
  },
  showMoreBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    alignSelf: 'center',
  },
  showMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[600],
  },
  historyBadge: {
    borderRadius: radii.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeSuccess: {
    backgroundColor: colors.emerald[50],
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.emerald[700],
  },
  badgeRejected: {
    backgroundColor: colors.rose[50],
  },
  badgeRejectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.rose[600],
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  loveReactBtn: {
    backgroundColor: colors.rose[50],
    borderColor: colors.rose[200],
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loveReactText: {
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 29, 33, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    maxHeight: '90%',
    flex: 1,
    gap: 10,
    ...shadows.floating,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    minHeight: 32,
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radii.md,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  floatingModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radii.lg,
    padding: 5,
    gap: 5,
    marginHorizontal: 20,
    marginBottom: 8,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  modeBtn: {
    paddingVertical: 6,
    borderRadius: radii.sm,
    minHeight: 32,
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
    paddingVertical: 6,
    borderRadius: radii.sm,
    minHeight: 30,
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
    borderTopColor: colors.neutral[200],
    paddingTop: 8,
    gap: 6,
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    padding: 10,
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.neutral[200],
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
    fontWeight: '800',
    color: colors.neutral[800],
  },
  input: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[200],
    borderWidth: 1.5,
    borderRadius: radii.sm,
    padding: 10,
    fontSize: 13,
    color: colors.neutral[900],
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[700],
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
    borderRadius: radii.xs,
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
    borderRadius: radii.md,
    marginBottom: 6,
    gap: 10,
    justifyContent: 'flex-start',
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  rewardEmoji: {
    fontSize: 20,
  },
  rewardTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
    flex: 1,
  },
  rewardCheck: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.emerald[700],
  },
  goalModalScroll: {
    flex: 1,
  },
  pkgSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.neutral[900],
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
    borderRadius: radii.md,
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  pkgCardSelected: {
    backgroundColor: colors.emerald[50],
    borderColor: colors.emerald[500],
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
    color: colors.neutral[900],
  },
  pkgTitleSelected: {
    color: colors.emerald[700],
  },
  pkgTargetText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[500],
  },
  suggestionChipsRow: {
    gap: 6,
    paddingVertical: 4,
    marginBottom: 4,
  },
  suggestionChip: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[700],
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
    paddingBottom: 60,
  },
  goalTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 2,
  },
  stepperBigBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBigText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.emerald[700],
  },
  goalTargetInput: {
    width: 90,
    height: 42,
    backgroundColor: colors.neutral[50],
    borderColor: colors.emerald[600],
    borderWidth: 2,
    borderRadius: radii.sm,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: colors.neutral[900],
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
    borderRadius: radii.sm,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  xpPresetChipActive: {
    backgroundColor: colors.emerald[50],
    borderColor: colors.emerald[400],
  },
  xpPresetText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[500],
  },
  xpPresetTextActive: {
    color: colors.emerald[700],
    fontWeight: '800',
  },
  milestonesMiniRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  miniMilestonePill: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  miniMilestoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[700],
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
    borderRadius: radii.sm,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRewardTag: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.emerald[700],
  },
  stepRewardInput: {
    flex: 1,
    marginBottom: 0,
  },
  error: {
    color: '#DC2626',
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
    color: colors.neutral[500],
  },
  milestoneSheet: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 16,
    ...shadows.floating,
  },
  milestoneBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  milestoneIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIconText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.white,
  },
  pinReached: {
    backgroundColor: colors.copper[500],
  },
  pinLocked: {
    backgroundColor: colors.neutral[300],
  },
  milestoneBody: {
    gap: 12,
  },
  milestoneStatCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    gap: 4,
  },
  milestoneStatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral[500],
    textTransform: 'uppercase',
  },
  milestoneStatValue: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.neutral[900],
  },
  milestoneStatSub: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.emerald[700],
    marginTop: 2,
  },
  milestoneRewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.copper[50],
    borderColor: colors.copper[200],
    borderWidth: 1.5,
    borderRadius: radii.lg,
    padding: 14,
  },
  milestoneRewardEmoji: {
    fontSize: 24,
  },
  milestoneRewardHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.copper[700],
    textTransform: 'uppercase',
  },
  milestoneRewardName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.copper[900],
  },
  milestoneDoneBtn: {
    marginTop: 4,
  },
  taskEditSheet: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 14,
    ...shadows.floating,
  },
  taskEditTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  taskEditNotice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[500],
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
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskStepperBigText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.emerald[700],
  },
  taskEditInput: {
    width: 80,
    height: 48,
    backgroundColor: colors.neutral[50],
    borderColor: colors.emerald[600],
    borderWidth: 2,
    borderRadius: radii.sm,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: colors.neutral[900],
  },
  taskEditActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  proposalCard: {
    backgroundColor: colors.gold[50],
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.gold[300],
    padding: 14,
    marginBottom: 12,
    gap: 10,
    ...shadows.soft,
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
    color: colors.gold[900],
  },
  proposalSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gold[700],
  },
  proposalDetailsBox: {
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.gold[200],
    gap: 6,
  },
  proposalTargetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neutral[900],
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
    color: colors.copper[700],
    backgroundColor: colors.copper[50],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  proposalSubBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[500],
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
    backgroundColor: colors.emerald[50],
    borderWidth: 1,
    borderColor: colors.emerald[200],
    borderRadius: radii.xs,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  proposalSwitchPartnerText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emerald[700],
  },
  proposalWaitingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.copper[700],
    flex: 1,
  },
  proposalCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.xs,
    backgroundColor: colors.rose[50],
  },
  proposalCancelText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.rose[600],
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.emerald[50],
    borderColor: colors.emerald[200],
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  feedbackBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emerald[800],
    flex: 1,
  },
  feedbackCloseText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.emerald[800],
    paddingLeft: 8,
  },
});
