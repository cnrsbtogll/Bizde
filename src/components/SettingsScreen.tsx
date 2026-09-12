import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useBizde } from '@/store';
import { BouncyPressable } from './game/BouncyPressable';
import { colors, radii, shadows } from '@/theme/tokens';

interface SettingsScreenProps {
  showIndividualGoals: boolean;
  onToggleIndividualGoals: (val: boolean) => void;
}

export function SettingsScreen({
  showIndividualGoals,
  onToggleIndividualGoals,
}: SettingsScreenProps) {
  const { pairingCode, coupleId, members, actor, reset } = useBizde();

  const [showCode, setShowCode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const effectiveCode = pairingCode || coupleId?.replace(/^couple-/, '') || '------';
  const partnerName =
    members.find((m) => m !== actor) ??
    (members[0] === actor ? members[1] ?? 'Partner' : members[0] ?? 'Partner');

  const handleCopyCode = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Eşleşme Kodu', `Eşleşme Kodunuz: ${effectiveCode}\n\nBu kodu eşinizle paylaşarak uygulamaya katılmasını sağlayabilirsiniz.`);
  };

  const handleLeave = () => {
    Alert.alert(
      'Eşleşmeden Çık',
      'Mevcut eşleşmeden çıkıp başlangıç ekranına dönmek istiyor musunuz? Verileriniz silinmez ancak tekrar bağlanmak için koda ihtiyacınız olur.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            reset();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile & Pairing Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🌿</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{actor || 'Sen'}</Text>
            <Text style={styles.profilePartner}>💖 {partnerName} ile eşleşildi</Text>
          </View>
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedDot}>●</Text>
            <Text style={styles.connectedText}>Bağlı</Text>
          </View>
        </View>

        {/* Pairing Code Section */}
        <View style={styles.codeBox}>
          <View style={styles.codeHeader}>
            <Text style={styles.codeBoxTitle}>🔑 Eşleşme Kodunuz</Text>
            <BouncyPressable
              variant="ghost"
              title={showCode ? '🙈 Gizle' : '👁️ Kodu Göster'}
              onPress={() => {
                void Haptics.selectionAsync();
                setShowCode(!showCode);
              }}
              style={styles.toggleCodeBtn}
              textStyle={styles.toggleCodeText}
            />
          </View>

          {showCode ? (
            <View style={styles.codeRevealRow}>
              <Text style={styles.codeDisplay}>{effectiveCode}</Text>
              <BouncyPressable
                variant="primary"
                title="📋 Paylaş / Göster"
                onPress={handleCopyCode}
                style={styles.copyBtn}
              />
            </View>
          ) : (
            <Text style={styles.codeHiddenText}>
              •••••• (Kodu görmek için "Kodu Göster"e dokunun)
            </Text>
          )}
        </View>
      </View>

      {/* Preferences Section */}
      <Text style={styles.sectionHeader}>Uygulama Tercihleri</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>Bireysel Hedefler</Text>
            <Text style={styles.settingSubtitle}>
              Erkek ve kadının bireysel ödül kartlarını ana sayfada gösterir.
            </Text>
          </View>
          <Switch
            value={showIndividualGoals}
            onValueChange={(val) => {
              if (hapticsEnabled) void Haptics.selectionAsync();
              onToggleIndividualGoals(val);
            }}
            trackColor={{ false: colors.neutral[300], true: colors.emerald[600] }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>Görev ve Onay Bildirimleri</Text>
            <Text style={styles.settingSubtitle}>
              Eşiniz bir görev yaptığında veya rica ettiğinde bildirim alın.
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={(val) => {
              if (hapticsEnabled) void Haptics.selectionAsync();
              setNotifications(val);
            }}
            trackColor={{ false: colors.neutral[300], true: colors.emerald[600] }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>Titreşim & Dokunsal Geri Bildirim</Text>
            <Text style={styles.settingSubtitle}>
              Buton ve XP kazanımlarında dokunsal his.
            </Text>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={(val) => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setHapticsEnabled(val);
            }}
            trackColor={{ false: colors.neutral[300], true: colors.emerald[600] }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* About & Philosophy */}
      <Text style={styles.sectionHeader}>Hakkında</Text>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Uygulama</Text>
          <Text style={styles.infoValue}>Bizdee</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Felsefe</Text>
          <Text style={styles.infoValue}>Tek ortak hedef, tek çubuk. Borç-alacak yok.</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sürüm</Text>
          <Text style={styles.infoValue}>1.0.0 (Expo v57)</Text>
        </View>
      </View>

      {/* Leave Couple Button */}
      <View style={styles.leaveSection}>
        <BouncyPressable
          variant="danger"
          title="🚪 Eşleşmeden Çıkış Yap"
          onPress={handleLeave}
          wrapperStyle={{ width: '100%' }}
          style={styles.leaveBtn}
          textStyle={styles.leaveBtnText}
        />
        <Text style={styles.leaveNote}>
          Çıkış yaptığınızda bu cihazdaki aktif oturum sonlanır.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginLeft: 4,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.card,
    gap: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: radii.full,
    backgroundColor: colors.emerald[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.emerald[200],
  },
  avatarEmoji: {
    fontSize: 22,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.neutral[900],
  },
  profilePartner: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.emerald[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.emerald[200],
  },
  connectedDot: {
    color: '#059669',
    fontSize: 10,
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  codeBox: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[200],
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    gap: 10,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.neutral[800],
  },
  toggleCodeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    minHeight: 26,
  },
  toggleCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emerald[700],
  },
  codeRevealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.emerald[200],
  },
  codeDisplay: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    color: colors.emerald[700],
  },
  copyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 34,
  },
  codeHiddenText: {
    fontSize: 12,
    color: colors.neutral[400],
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingTextCol: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neutral[900],
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    lineHeight: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[500],
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[800],
    flexShrink: 1,
    textAlign: 'right',
  },
  leaveSection: {
    marginTop: 10,
    gap: 8,
    alignItems: 'center',
  },
  leaveBtn: {
    width: '100%',
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveBtnText: {
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 14,
  },
  leaveNote: {
    fontSize: 11,
    color: colors.neutral[400],
    textAlign: 'center',
    fontWeight: '500',
  },
});
