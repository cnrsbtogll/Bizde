import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

export interface BurstData {
  id: string;
  text: string;
  subText?: string;
  emoji?: string;
}

interface XPBurstOverlayProps {
  burst: BurstData | null;
  onComplete: () => void;
}

export function XPBurstOverlay({ burst, onComplete }: XPBurstOverlayProps) {
  const scale = useSharedValue(0.2);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const heartScale1 = useSharedValue(0);
  const heartScale2 = useSharedValue(0);

  useEffect(() => {
    if (burst) {
      // Main burst animation
      scale.value = withSequence(
        withSpring(1.25, { damping: 7, stiffness: 220 }),
        withDelay(450, withTiming(0.9, { duration: 300 })),
        withTiming(0.7, { duration: 250 })
      );

      translateY.value = withSequence(
        withSpring(-20, { damping: 8, stiffness: 180 }),
        withTiming(-80, { duration: 550, easing: Easing.out(Easing.cubic) })
      );

      opacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withDelay(600, withTiming(0, { duration: 300 }, (finished) => {
          if (finished) {
            runOnJS(onComplete)();
          }
        }))
      );

      // Mini floating hearts
      heartScale1.value = withSequence(
        withDelay(100, withSpring(1.3, { damping: 6, stiffness: 200 })),
        withTiming(0, { duration: 400 })
      );
      heartScale2.value = withSequence(
        withDelay(200, withSpring(1.4, { damping: 6, stiffness: 200 })),
        withTiming(0, { duration: 400 })
      );
    } else {
      scale.value = 0.2;
      opacity.value = 0;
      translateY.value = 40;
      heartScale1.value = 0;
      heartScale2.value = 0;
    }
  }, [burst, scale, opacity, translateY, heartScale1, heartScale2, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const heartStyle1 = useAnimatedStyle(() => ({
    transform: [
      { scale: heartScale1.value },
      { translateX: -45 },
      { translateY: -25 },
    ],
  }));

  const heartStyle2 = useAnimatedStyle(() => ({
    transform: [
      { scale: heartScale2.value },
      { translateX: 45 },
      { translateY: -35 },
    ],
  }));

  if (!burst) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[styles.burstBadge, animatedStyle]}>
        {burst.emoji && <Text style={styles.burstEmoji}>{burst.emoji}</Text>}
        <Text style={styles.burstText}>{burst.text}</Text>
        {burst.subText && <Text style={styles.burstSubText}>{burst.subText}</Text>}
      </Animated.View>

      <Animated.Text style={[styles.floatingHeart, heartStyle1]}>💖</Animated.Text>
      <Animated.Text style={[styles.floatingHeart, heartStyle2]}>✨</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  burstBadge: {
    backgroundColor: '#ff3b69',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff3b69',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  burstEmoji: {
    fontSize: 32,
    marginBottom: 2,
  },
  burstText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  burstSubText: {
    color: '#ffe4e9',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  floatingHeart: {
    position: 'absolute',
    fontSize: 26,
  },
});
