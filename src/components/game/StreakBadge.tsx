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
      <View style={styles.textCol}>
        <Text style={styles.streakNumber}>{streakDays}</Text>
        <Text style={styles.streakLabel}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderColor: '#ffedd5',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 2,
  },
  lottieContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flame: {
    width: 36,
    height: 36,
  },
  textCol: {
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ea580c',
    lineHeight: 18,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#c2410c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
