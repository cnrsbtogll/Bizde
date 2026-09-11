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

interface StreakBadgeProps {
  streakDays: number;
  label?: string;
}

export function StreakBadge({ streakDays, label = 'Seri' }: StreakBadgeProps) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (streakDays > 0) {
      pulseScale.value = withSequence(
        withSpring(1.2, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
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
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    height: 28,
    gap: 4,
  },
  lottieContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flame: {
    width: 16,
    height: 16,
  },
  streakText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ea580c',
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#c2410c',
    textTransform: 'uppercase',
  },
});
