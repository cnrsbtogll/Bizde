import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MILESTONES } from '@/lib/progress';

interface GamifiedProgressBarProps {
  total: number;
  target: number;
  member1Name: string;
  member1Points: number;
  member2Name: string;
  member2Points: number;
  color1?: string;
  color2?: string;
}

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 140,
};

export function GamifiedProgressBar({
  total,
  target,
  member1Name,
  member1Points,
  member2Name,
  member2Points,
  color1 = '#0f766e',
  color2 = '#ea580c',
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
      <View style={styles.topRow}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>HEDEF XP</Text>
        </View>
        <Text style={styles.pointsCounter}>
          <Text style={styles.boldPoints}>{total}</Text> / {target} XP
        </Text>
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
          return (
            <View
              key={m.pct}
              style={[
                styles.pinContainer,
                { left: `${m.pct}%` },
              ]}
            >
              <View
                style={[
                  styles.pinDot,
                  isReached ? styles.pinReached : styles.pinLocked,
                ]}
              >
                <Text style={styles.pinIcon}>{isReached ? '★' : '•'}</Text>
              </View>
            </View>
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
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.5,
  },
  pointsCounter: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  boldPoints: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  track: {
    height: 22,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
  },
  filledTrack: {
    height: '100%',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  pinContainer: {
    position: 'absolute',
    top: -3,
    marginLeft: -14,
    width: 28,
    alignItems: 'center',
    zIndex: 10,
  },
  pinDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
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
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '900',
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
