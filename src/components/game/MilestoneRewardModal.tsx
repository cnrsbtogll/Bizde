import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { BouncyPressable } from './BouncyPressable';
import confettiSource from '../../../assets/animations/confetti.json';

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

          <Text style={styles.badgeLabel}>✨ %{milestonePct} ARA HEDEF AÇILDI!</Text>
          <Text style={styles.rewardTitle}>{rewardTitle}</Text>
          <Text style={styles.description}>
            Tebrikler! Birlikte harika bir uyum yakaladınız. Şimdi işleri kısa bir süre kenara bırakıp {partnerName} ile birlikte bu ödülün tadını çıkarma ve mola verme vakti!
          </Text>

          <View style={styles.actions}>
            <BouncyPressable
              variant="love"
              title={`${emoji} Molayı Başlat & Kutla`}
              onPress={onClaimBreak}
              style={styles.button}
              textStyle={styles.btnText}
            />
            <BouncyPressable
              variant="ghost"
              title="Harika, Devam Edelim"
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#ff3366',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#fed7aa',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#fed7aa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconEmoji: {
    fontSize: 40,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ea580c',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  rewardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
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
    minHeight: 46,
    borderRadius: 14,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    width: '100%',
    minHeight: 40,
  },
});
