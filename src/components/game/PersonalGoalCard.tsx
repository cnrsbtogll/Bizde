import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { Goal } from '@/store';
import { colors, radii, spring, shadows } from '@/theme/tokens';

interface PersonalGoalCardProps {
  member: string;
  isFemale?: boolean;
  points: number;
  goal: Goal;
  onEdit: () => void;
  accentColor?: string;
  badgeEmoji?: string;
}

export function PersonalGoalCard({
  member,
  isFemale = false,
  points,
  goal,
  onEdit,
  accentColor,
  badgeEmoji,
}: PersonalGoalCardProps) {
  const themeColor = accentColor ?? (isFemale ? colors.copper[500] : colors.emerald[600]);
  const emoji = badgeEmoji ?? (isFemale ? '🍷' : '🎮');
  const target = Math.max(1, goal.targetPoints);
  const percentage = Math.min(100, Math.round((points / target) * 100));

  const progressAnim = useSharedValue(percentage);

  useEffect(() => {
    progressAnim.value = withSpring(percentage, spring.settle);
  }, [percentage, progressAnim]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%` as DimensionValue,
  }));

  return (
    <View style={[styles.card, { borderColor: isFemale ? colors.copper[100] : colors.emerald[100] }]}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeEmoji}>{emoji}</Text>
          <Text style={[styles.memberLabel, { color: themeColor }]}>
            {member.toUpperCase()} İÇİN ÖDÜL
          </Text>
        </View>
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            onEdit();
          }}
          style={[styles.editBtn, { backgroundColor: isFemale ? colors.copper[50] : colors.emerald[50] }]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${member} için ödülü düzenle`}
        >
          <Text style={[styles.editBtnText, { color: themeColor }]}>✏️ Düzenle</Text>
        </Pressable>
      </View>

      {/* Goal Title */}
      <Text style={styles.goalTitle} numberOfLines={1}>
        {goal.title}
      </Text>

      {/* Progress Bar Track */}
      <View style={styles.trackWrapper}>
        <View style={styles.trackBg} />
        <Animated.View
          style={[styles.trackFill, { backgroundColor: themeColor }, fillStyle]}
        />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Text style={styles.pointsText}>
          <Text style={[styles.boldPoints, { color: themeColor }]}>{points}</Text> / {target} XP
        </Text>
        <View style={[styles.pctBadge, { backgroundColor: isFemale ? colors.copper[50] : colors.emerald[50] }]}>
          <Text style={[styles.pctText, { color: themeColor }]}>%{percentage}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    ...shadows.soft,
    gap: 8,
  },
  topRow: {
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
  memberLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.xs,
    backgroundColor: colors.neutral[100],
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.1,
  },
  trackWrapper: {
    height: 8,
    borderRadius: radii.full,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.neutral[100],
    marginTop: 2,
  },
  trackBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral[100],
  },
  trackFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: '600',
  },
  boldPoints: {
    fontSize: 13,
    fontWeight: '900',
  },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '800',
  },
});

