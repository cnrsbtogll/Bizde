import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { BouncyPressable } from './BouncyPressable';
import confettiSource from '../../../assets/animations/confetti.json';
import { colors, radii, shadows } from '@/theme/tokens';
import { useBizde } from '@/store';
import { t, localizeDefaultGoalText, type Lang } from '@/i18n/strings';

interface MilestoneRewardModalProps {
  visible: boolean;
  milestonePct: number;
  rewardTitle: string;
  partnerName: string;
  onClaimBreak: () => void;
  onClose: () => void;
}

export function MilestoneRewardModal({
  visible,
  milestonePct,
  rewardTitle,
  partnerName,
  onClaimBreak,
  onClose,
}: MilestoneRewardModalProps) {
  const lang: Lang = useBizde((s) => s.language) || 'tr';

  useEffect(() => {
    if (visible) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const t = setTimeout(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  const emoji = milestonePct <= 30 ? '☕' : '🎬';

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

        {/* Milestone Dialog Card */}
        <View style={styles.dialogCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>{emoji}</Text>
          </View>

          <Text style={styles.badgeLabel}>
            ✨ {lang === 'tr' ? `%${milestonePct}` : `${milestonePct}%`} {t(lang, 'milestones.unlocked')}
          </Text>
          <Text style={styles.rewardTitle}>{localizeDefaultGoalText(rewardTitle, lang)}</Text>
          <Text style={styles.description}>
            {t(lang, 'milestones.desc').replace('{partner}', partnerName)}
          </Text>

          <View style={styles.actions}>
            <BouncyPressable
              variant="copper"
              title={`${emoji} ${t(lang, 'milestones.claimBreak')}`}
              onPress={onClaimBreak}
              style={styles.button}
              textStyle={styles.btnText}
            />
            <BouncyPressable
              variant="ghost"
              title={t(lang, 'milestones.continue')}
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
    borderColor: colors.copper[200],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.copper[50],
    borderWidth: 2,
    borderColor: colors.copper[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.copperGlow,
  },
  iconEmoji: {
    fontSize: 40,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.copper[600],
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  rewardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
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
