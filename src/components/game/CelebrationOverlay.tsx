import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { BouncyPressable } from './BouncyPressable';
import confettiSource from '../../../assets/animations/confetti.json';
import trophySource from '../../../assets/animations/trophy.json';
import { colors, radii, shadows } from '@/theme/tokens';

interface CelebrationOverlayProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onNewGoal: () => void;
  onClose: () => void;
  newGoalButtonText?: string;
}

export function CelebrationOverlay({
  visible,
  title,
  subtitle = 'Hedef Puan Barajını Aştınız!',
  onNewGoal,
  onClose,
  newGoalButtonText = 'Yeni Hedef Seç',
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (visible) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Double tap haptic for celebration fanfare feel
      const t = setTimeout(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti Rain Background */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <LottieView
            source={confettiSource}
            autoPlay
            loop
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Celebration Dialog Card */}
        <View style={styles.dialogCard}>
          <View style={styles.trophyWrapper}>
            <LottieView
              source={trophySource}
              autoPlay
              loop
              style={styles.trophy}
            />
          </View>

          <Text style={styles.badgeLabel}>ZAFER ANI!</Text>
          <Text style={styles.goalTitle}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.actions}>
            <BouncyPressable
              variant="copper"
              title={newGoalButtonText}
              onPress={onNewGoal}
              style={styles.button}
              textStyle={styles.btnText}
            />
            <BouncyPressable
              variant="ghost"
              title="Kapat"
              onPress={onClose}
              style={styles.secondaryBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 29, 33, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...shadows.floating,
    borderWidth: 1.5,
    borderColor: colors.gold[300],
  },
  trophyWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  trophy: {
    width: 140,
    height: 140,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.copper[600],
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  button: {
    width: '100%',
    minHeight: 48,
    borderRadius: radii.md,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    width: '100%',
    minHeight: 42,
  },
});

