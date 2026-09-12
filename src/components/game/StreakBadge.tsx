import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import flameSource from '../../../assets/animations/flame.json';
import { colors, radii, spring } from '@/theme/tokens';

interface StreakBadgeProps {
  streakDays: number;
  label?: string;
}

export function StreakBadge({ streakDays, label = 'Seri' }: StreakBadgeProps) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (streakDays > 0) {
      pulseScale.value = withSequence(
        withSpring(1.15, spring.bouncy),
        withSpring(1, spring.settle)
      );
    }
  }, [streakDays, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.lottieContainer}>
        <LottieView
          source={flameSource}
          autoPlay
          loop
          style={styles.flame}
        />
      </View>
      <Text style={styles.streakText}>
        <Text style={styles.streakNumber}>{streakDays}</Text>
        <Text style={styles.streakLabel}> {label}</Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.copper[50],
    borderColor: colors.copper[200],
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 30,
    gap: 5,
  },
  lottieContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flame: {
    width: 18,
    height: 18,
  },
  streakText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.copper[600],
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.copper[700],
    textTransform: 'uppercase',
  },
});

