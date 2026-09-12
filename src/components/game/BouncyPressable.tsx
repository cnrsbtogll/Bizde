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
import { colors, radii, spring, shadows } from '@/theme/tokens';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'copper'
  | 'success'
  | 'danger'
  | 'ghost'
  | 'amber'
  | 'love'
  | 'gold';

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
    scale.value = withSpring(0.96, spring.press);
    translateY.value = withSpring(1.5, spring.press);
    void Haptics.impactAsync(hapticStyle);
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, spring.press);
    translateY.value = withSpring(0, spring.press);
  };

  const variantStyle = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;

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
            backgroundColor: variantStyle.bg,
            borderColor: variantStyle.border,
          },
          variantStyle.shadow,
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
            style={[styles.title, { color: variantStyle.text }, textStyle]}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; border: string; text: string; shadow?: ViewStyle }
> = {
  primary: {
    bg: colors.emerald[600],
    border: colors.emerald[700],
    text: colors.white,
    shadow: shadows.emeraldGlow,
  },
  copper: {
    bg: colors.copper[500],
    border: colors.copper[600],
    text: colors.white,
    shadow: shadows.copperGlow,
  },
  secondary: {
    bg: colors.emerald[100],
    border: colors.emerald[200],
    text: colors.emerald[700],
    shadow: shadows.soft,
  },
  love: {
    bg: colors.rose[500],
    border: colors.rose[600],
    text: colors.white,
    shadow: {
      shadowColor: colors.rose[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
  },
  gold: {
    bg: colors.gold[500],
    border: colors.gold[600],
    text: colors.neutral[900],
    shadow: {
      shadowColor: colors.gold[500],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
  },
  success: {
    bg: colors.emerald[500],
    border: colors.emerald[600],
    text: colors.white,
    shadow: shadows.soft,
  },
  amber: {
    bg: colors.copper[400],
    border: colors.copper[500],
    text: colors.white,
    shadow: shadows.copperGlow,
  },
  danger: {
    bg: '#DC2626',
    border: '#B91C1C',
    text: colors.white,
    shadow: shadows.soft,
  },
  ghost: {
    bg: colors.neutral[100],
    border: colors.neutral[200],
    text: colors.emerald[700],
    shadow: undefined,
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
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

