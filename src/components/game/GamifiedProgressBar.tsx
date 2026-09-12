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
import { colors, radii, spring, shadows } from '@/theme/tokens';

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
  color1 = colors.emerald[600],
  color2 = colors.copper[500],
  onMilestonePress,
  onAdjustTarget,
  onEditGoal,
}: GamifiedProgressBarProps) {
  const fraction = target > 0 ? Math.min(1, Math.max(0, total / target)) : 0;
  const f1 = total > 0 ? member1Points / total : 0;

  const animatedTotalWidth = useSharedValue(0);
  const animatedP1Width = useSharedValue(0);

  useEffect(() => {
    animatedTotalWidth.value = withSpring(fraction * 100, spring.settle);
    animatedP1Width.value = withSpring(f1 * 100, spring.settle);
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
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    paddingBottom: 16,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    gap: 10,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.emerald[700],
    letterSpacing: 0.6,
  },
  editBtn: {
    backgroundColor: colors.emerald[50],
    borderColor: colors.emerald[200],
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emerald[700],
  },
  goalMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.2,
  },
  milestonesMiniRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniMilestonePill: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  miniMilestoneText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  targetBadge: {
    backgroundColor: colors.copper[50],
    borderColor: colors.copper[200],
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.copper[700],
    letterSpacing: 0.6,
  },
  targetControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[800],
    lineHeight: 18,
  },
  pointsCounter: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  boldPoints: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.neutral[900],
  },
  track: {
    height: 20,
    backgroundColor: colors.neutral[100],
    borderRadius: radii.full,
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  filledTrack: {
    height: '100%',
    borderRadius: radii.full,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  pinReached: {
    backgroundColor: colors.copper[500],
    ...shadows.copperGlow,
  },
  pinLocked: {
    backgroundColor: colors.neutral[300],
  },
  pinIcon: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '900',
  },
  pinPctLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.neutral[400],
    marginTop: 2,
    textAlign: 'center',
    width: 32,
  },
  pinPctLabelReached: {
    color: colors.copper[700],
    fontWeight: '800',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
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
    color: colors.neutral[600],
    fontWeight: '600',
  },
  legendValue: {
    fontWeight: '800',
    color: colors.neutral[900],
  },
  pctBadge: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.emerald[700],
  },
});

