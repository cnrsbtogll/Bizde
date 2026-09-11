import { type PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'amber';

interface BouncyPressableProps extends PropsWithChildren {
  onPress: () => void;
  title?: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  disabled?: boolean;
}

const SPRING_CONFIG = {
  damping: 14,
  stiffness: 280,
  mass: 0.8,
};

export function BouncyPressable({
  onPress,
  title,
  variant = 'primary',
  style,
  wrapperStyle,
  textStyle,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  disabled = false,
  children,
}: BouncyPressableProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.95, SPRING_CONFIG);
    translateY.value = withSpring(3, SPRING_CONFIG);
    void Haptics.impactAsync(hapticStyle);
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
  };

  const colors = VARIANT_COLORS[variant];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.wrapper, wrapperStyle, disabled && styles.disabledWrapper]}
    >
      <Animated.View
        style={[
          styles.buttonBase,
          {
            backgroundColor: colors.bg,
            borderBottomColor: colors.shadow,
          },
          animatedStyle,
          style,
        ]}
      >
        {children ? (
          children
        ) : (
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[styles.title, { color: colors.text }, textStyle]}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const VARIANT_COLORS: Record<
  ButtonVariant,
  { bg: string; shadow: string; text: string }
> = {
  primary: {
    bg: '#2563eb',
    shadow: '#1d4ed8',
    text: '#ffffff',
  },
  secondary: {
    bg: '#0f766e',
    shadow: '#115e59',
    text: '#ffffff',
  },
  success: {
    bg: '#16a34a',
    shadow: '#15803d',
    text: '#ffffff',
  },
  amber: {
    bg: '#f59e0b',
    shadow: '#d97706',
    text: '#ffffff',
  },
  danger: {
    bg: '#dc2626',
    shadow: '#b91c1c',
    text: '#ffffff',
  },
  ghost: {
    bg: '#f3f4f6',
    shadow: '#e5e7eb',
    text: '#374151',
  },
};

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
  },
  disabledWrapper: {
    opacity: 0.5,
  },
  buttonBase: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
