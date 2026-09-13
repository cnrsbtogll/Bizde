import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useBizde } from '@/store';
import { BouncyPressable } from './game/BouncyPressable';
import { colors, radii, shadows } from '@/theme/tokens';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE_OPTION, t, type Lang } from '@/i18n/strings';

interface SettingsScreenProps {
  showIndividualGoals: boolean;
  onToggleIndividualGoals: (val: boolean) => void;
}

export function SettingsScreen({
  showIndividualGoals,
  onToggleIndividualGoals,
}: SettingsScreenProps) {
  const { pairingCode, coupleId, members, actor, reset, language, setLanguage } = useBizde();

  const [showCode, setShowCode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const lang: Lang = language || 'tr';
  const currentLangOption =
    SUPPORTED_LANGUAGES.find((item) => item.code === lang) ?? DEFAULT_LANGUAGE_OPTION;

  const effectiveCode = pairingCode || coupleId?.replace(/^couple-/, '') || '------';
  const partnerName =
    members.find((m) => m !== actor) ??
    (members[0] === actor ? members[1] ?? 'Partner' : members[0] ?? 'Partner');

  const handleCopyCode = () => {
    if (hapticsEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      t(lang, 'settings.codeAlertTitle'),
      `${t(lang, 'settings.codeAlertMsg')}${effectiveCode}${t(lang, 'settings.codeAlertShare')}`
    );
  };

  const handleLeave = () => {
    Alert.alert(
      t(lang, 'settings.leaveAlertTitle'),
      t(lang, 'settings.leaveAlertMsg'),
      [
        { text: t(lang, 'settings.leaveCancel'), style: 'cancel' },
        {
          text: t(lang, 'settings.leaveLogout'),
          style: 'destructive',
          onPress: () => {
            if (hapticsEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            reset();
          },
        },
      ]
    );
  };

  const handleSelectLanguage = (newLang: Lang) => {
    if (hapticsEnabled) void Haptics.selectionAsync();
    setLanguage(newLang);
    setLangModalVisible(false);
  };

  return (
    <>
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
              <Text style={styles.profileName}>{actor || t(lang, 'settings.you')}</Text>
              <Text style={styles.profilePartner}>
                💖 {partnerName} {t(lang, 'settings.partnerWith')}
              </Text>
            </View>
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedDot}>●</Text>
              <Text style={styles.connectedText}>{t(lang, 'settings.connected')}</Text>
            </View>
          </View>

          {/* Pairing Code Section */}
          <View style={styles.codeBox}>
            <View style={styles.codeHeader}>
              <Text style={styles.codeBoxTitle}>🔑 {t(lang, 'settings.codeTitle')}</Text>
              <BouncyPressable
                variant="ghost"
                title={showCode ? `🙈 ${t(lang, 'settings.hideCode')}` : `👁️ ${t(lang, 'settings.showCode')}`}
                onPress={() => {
                  if (hapticsEnabled) void Haptics.selectionAsync();
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
                  title={`📋 ${t(lang, 'settings.copyCode')}`}
                  onPress={handleCopyCode}
                  style={styles.copyBtn}
                />
              </View>
            ) : (
              <Text style={styles.codeHiddenText}>
                {t(lang, 'settings.codeHidden')}
              </Text>
            )}
          </View>
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionHeader}>{t(lang, 'settings.preferences')}</Text>
        <View style={styles.card}>
          {/* Language Selector Row */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              if (hapticsEnabled) void Haptics.selectionAsync();
              setLangModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>🌐 {t(lang, 'settings.language')}</Text>
              <Text style={styles.settingSubtitle}>{t(lang, 'settings.languageSub')}</Text>
            </View>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeFlag}>{currentLangOption.flag}</Text>
              <Text style={styles.langBadgeText}>{currentLangOption.nativeName}</Text>
              <Text style={styles.langBadgeChevron}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Individual Goals */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>{t(lang, 'settings.individualGoals')}</Text>
              <Text style={styles.settingSubtitle}>
                {t(lang, 'settings.individualGoalsSub')}
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

          {/* Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>{t(lang, 'settings.notifications')}</Text>
              <Text style={styles.settingSubtitle}>
                {t(lang, 'settings.notificationsSub')}
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

          {/* Haptics */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>{t(lang, 'settings.haptics')}</Text>
              <Text style={styles.settingSubtitle}>
                {t(lang, 'settings.hapticsSub')}
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
        <Text style={styles.sectionHeader}>{t(lang, 'settings.about')}</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(lang, 'settings.appName')}</Text>
            <Text style={styles.infoValue}>Bizdee</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(lang, 'settings.philosophy')}</Text>
            <Text style={styles.infoValue}>{t(lang, 'settings.philosophyText')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t(lang, 'settings.version')}</Text>
            <Text style={styles.infoValue}>1.0.0 (Expo v57)</Text>
          </View>
        </View>

        {/* Leave Couple Button */}
        <View style={styles.leaveSection}>
          <BouncyPressable
            variant="danger"
            title={`🚪 ${t(lang, 'settings.leaveCouple')}`}
            onPress={handleLeave}
            wrapperStyle={{ width: '100%' }}
            style={styles.leaveBtn}
            textStyle={styles.leaveBtnText}
          />
          <Text style={styles.leaveNote}>
            {t(lang, 'settings.leaveCoupleSub')}
          </Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal (Option A) */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLangModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🌐 {t(lang, 'settings.selectLanguage')}</Text>
              <TouchableOpacity
                onPress={() => setLangModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.langList}>
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.langOptionRow, isSelected && styles.langOptionRowSelected]}
                    onPress={() => handleSelectLanguage(item.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.langOptionFlag}>{item.flag}</Text>
                    <View style={styles.langOptionTextCol}>
                      <Text
                        style={[
                          styles.langOptionNative,
                          isSelected && styles.langOptionNativeSelected,
                        ]}
                      >
                        {item.nativeName}
                      </Text>
                      <Text style={styles.langOptionLabel}>{item.label}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.langCheckCircle}>
                        <Text style={styles.langCheckmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <BouncyPressable
              variant="secondary"
              title={t(lang, 'settings.close')}
              onPress={() => setLangModalVisible(false)}
              style={styles.modalDismissBtn}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  langBadgeFlag: {
    fontSize: 16,
  },
  langBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  langBadgeChevron: {
    fontSize: 16,
    color: colors.neutral[400],
    fontWeight: '700',
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

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    ...shadows.card,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.neutral[900],
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.neutral[600],
  },
  langList: {
    gap: 8,
  },
  langOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    gap: 12,
  },
  langOptionRowSelected: {
    borderColor: colors.emerald[500],
    backgroundColor: colors.emerald[50],
  },
  langOptionFlag: {
    fontSize: 26,
  },
  langOptionTextCol: {
    flex: 1,
    gap: 2,
  },
  langOptionNative: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.neutral[800],
  },
  langOptionNativeSelected: {
    color: colors.emerald[800],
  },
  langOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[400],
  },
  langCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.emerald[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  langCheckmark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  modalDismissBtn: {
    marginTop: 4,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
