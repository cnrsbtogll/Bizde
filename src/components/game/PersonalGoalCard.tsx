import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { Goal } from '@/store';

interface PersonalGoalCardProps {
  member: string;
  isFemale?: boolean;
  points: number;
  goal: Goal;
  onEdit: () => void;
  accentColor?: string;
  badgeEmoji?: string;
}

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 140,
};

export function PersonalGoalCard({
  member,
  isFemale = false,
  points,
  goal,
  onEdit,
  accentColor,
  badgeEmoji,
}: PersonalGoalCardProps) {
  const themeColor = accentColor ?? (isFemale ? '#E11D48' : '#0284C7');
  const emoji = badgeEmoji ?? (isFemale ? '🍷' : '🎮');
  const target = Math.max(1, goal.targetPoints);
  const percentage = Math.min(100, Math.round((points / target) * 100));

  const progressAnim = useSharedValue(percentage);

  useEffect(() => {
    progressAnim.value = withSpring(percentage, SPRING_CONFIG);
  }, [percentage, progressAnim]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%` as DimensionValue,
  }));

  return (
    <View style={[styles.card, { borderColor: isFemale ? '#FCE7F3' : '#E0F2FE' }]}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <Text style={styles.badgeEmoji}>{emoji}</Text>
          <Text style={[styles.memberLabel, { color: themeColor }]}>
            {member.toUpperCase()}'NİN HEDEFİ
          </Text>
        </View>
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            onEdit();
          }}
          style={styles.editBtn}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${member} hedefini düzenle`}
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
        <View style={[styles.pctBadge, { backgroundColor: isFemale ? '#FFF1F2' : '#F0F9FF' }]}>
          <Text style={[styles.pctText, { color: themeColor }]}>%{percentage}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeEmoji: {
    fontSize: 13,
  },
  memberLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  editBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  trackWrapper: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f1f5f9',
    marginTop: 1,
  },
  trackBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f1f5f9',
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  boldPoints: {
    fontSize: 12,
    fontWeight: '800',
  },
  pctBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  pctText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
