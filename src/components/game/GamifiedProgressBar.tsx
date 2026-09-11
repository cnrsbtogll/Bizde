import { useEffect } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MILESTONES, type Milestone } from '@/lib/progress';

interface GamifiedProgressBarProps {
  total: number;
  target: number;
  goalTitle?: string;
  m25Title?: string;
  m60Title?: string;
  member1Name: string;
  member1Points: number;
  member2Name: string;
  member2Points: number;
  color1?: string;
  color2?: string;
  onMilestonePress?: (milestone: Milestone) => void;
  onAdjustTarget?: (delta: number) => void;
  onEditGoal?: () => void;
}

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 140,
};

export function GamifiedProgressBar({
  total,
  target,
  goalTitle,
  m25Title,
  m60Title,
  member1Name,
  member1Points,
  member2Name,
  member2Points,
  color1 = '#0f766e',
  color2 = '#ea580c',
  onMilestonePress,
  onAdjustTarget,
  onEditGoal,
}: GamifiedProgressBarProps) {
  const fraction = target > 0 ? Math.min(1, Math.max(0, total / target)) : 0;
  const f1 = total > 0 ? member1Points / total : 0;

  const animatedTotalWidth = useSharedValue(0);
  const animatedP1Width = useSharedValue(0);

  useEffect(() => {
    animatedTotalWidth.value = withSpring(fraction * 100, SPRING_CONFIG);
    animatedP1Width.value = withSpring(f1 * 100, SPRING_CONFIG);
  }, [fraction, f1, animatedTotalWidth, animatedP1Width]);

  const totalFillStyle = useAnimatedStyle(() => ({
    width: `${animatedTotalWidth.value}%`,
  }));

  const p1FillStyle = useAnimatedStyle(() => ({
    width: `${animatedP1Width.value}%`,
  }));

  const percentage = Math.round(fraction * 100);

  return (
    <View style={styles.card}>
      {/* Top Header Row matching PersonalGoalCard */}
      <View style={styles.topHeaderRow}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeEmoji}>🏆</Text>
          <Text style={styles.badgeLabel}>ORTAK HEDEF</Text>
        </View>
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            onEditGoal?.();
          }}
          style={styles.editBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Ortak Hedefi Düzenle"
        >
          <Text style={styles.editBtnText}>✏️ Düzenle</Text>
        </Pressable>
      </View>

      {/* Goal Title */}
      {goalTitle ? (
        <Text style={styles.goalMainTitle} numberOfLines={1}>
          {goalTitle}
        </Text>
      ) : null}

      {/* Milestones Pills Row */}
      {(m25Title || m60Title) ? (
        <View style={styles.milestonesMiniRow}>
          {m25Title ? (
            <View style={styles.miniMilestonePill}>
              <Text style={styles.miniMilestoneText}>☕ %25: {m25Title}</Text>
            </View>
          ) : null}
          {m60Title ? (
            <View style={styles.miniMilestonePill}>
              <Text style={styles.miniMilestoneText}>🎬 %60: {m60Title}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Target XP & Stepper Row */}
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <Text style={styles.targetBadgeText}>HEDEF XP</Text>
        </View>

        <View style={styles.targetControlGroup}>
          {onAdjustTarget && (
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onAdjustTarget(-50);
              }}
              style={styles.stepperBtn}
              accessibilityRole="button"
              accessibilityLabel="Hedefi 50 XP azalt"
            >
              <Text style={styles.stepperBtnText}>-</Text>
            </Pressable>
          )}

          <Text style={styles.pointsCounter}>
            <Text style={styles.boldPoints}>{total}</Text> / {target} XP
          </Text>

          {onAdjustTarget && (
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onAdjustTarget(50);
              }}
              style={styles.stepperBtn}
              accessibilityRole="button"
              accessibilityLabel="Hedefi 50 XP artır"
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Track */}
      <View style={styles.track}>
        <Animated.View style={[styles.filledTrack, totalFillStyle]}>
          <Animated.View
            style={[
              styles.segment,
              { backgroundColor: color1 },
              p1FillStyle,
            ]}
          />
          <View
            style={[
              styles.segment,
              { backgroundColor: color2, flex: 1 },
            ]}
          />
        </Animated.View>

        {/* Milestone Node Pins */}
        {MILESTONES.map((m) => {
          const isReached = percentage >= m.pct;
          const pinPositionStyle: ViewStyle =
            m.pct === 100
              ? { right: -2, marginLeft: 0 }
              : m.pct === 0
                ? { left: -2, marginLeft: 0 }
                : { left: `${m.pct}%` as DimensionValue, marginLeft: -18 };

          return (
            <Pressable
              key={m.pct}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onMilestonePress?.(m);
              }}
              style={[styles.pinContainer, pinPositionStyle]}
              accessibilityRole="button"
              accessibilityLabel={`Kademe %${m.pct}`}
            >
              <View
                style={[
                  styles.pinDot,
                  isReached ? styles.pinReached : styles.pinLocked,
                ]}
              >
                <Text style={styles.pinIcon}>{isReached ? '★' : '•'}</Text>
              </View>
              <Text
                numberOfLines={1}
                style={[styles.pinPctLabel, isReached && styles.pinPctLabelReached]}
              >
                %{m.pct}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Member Legends */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: color1 }]} />
          <Text style={styles.legendText}>
            {member1Name}: <Text style={styles.legendValue}>{member1Points}</Text>
          </Text>
        </View>
        <Text style={styles.pctBadge}>%{percentage}</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: color2 }]} />
          <Text style={styles.legendText}>
            {member2Name}: <Text style={styles.legendValue}>{member2Points}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeEmoji: {
    fontSize: 13,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f766e',
    letterSpacing: 0.5,
  },
  editBtn: {
    backgroundColor: '#f0fdfa',
    borderColor: '#ccfbf1',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f766e',
  },
  goalMainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  milestonesMiniRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniMilestonePill: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  miniMilestoneText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  targetBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.5,
  },
  targetControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  stepperBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    lineHeight: 16,
  },
  pointsCounter: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  boldPoints: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  track: {
    height: 18,
    backgroundColor: '#f1f5f9',
    borderRadius: 9,
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 14,
  },
  filledTrack: {
    height: '100%',
    borderRadius: 9,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  pinContainer: {
    position: 'absolute',
    top: -2,
    width: 32,
    alignItems: 'center',
    zIndex: 10,
  },
  pinDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  pinReached: {
    backgroundColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  pinLocked: {
    backgroundColor: '#cbd5e1',
  },
  pinIcon: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '900',
  },
  pinPctLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'center',
    width: 32,
  },
  pinPctLabelReached: {
    color: '#b45309',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  legendValue: {
    fontWeight: '700',
    color: '#0f172a',
  },
  pctBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f766e',
  },
});
