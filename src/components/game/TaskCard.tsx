import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { type TaskTemplate, type TaskCategory } from '@/mock/catalog';
import { BouncyPressable, type ButtonVariant } from './BouncyPressable';
import { colors, radii, shadows } from '@/theme/tokens';

interface TaskCardProps {
  template: TaskTemplate;
  title: string;
  onClaim: (tpl: TaskTemplate) => void;
  onEditPoints?: (tpl: TaskTemplate) => void;
  claimButtonText?: string;
  variant?: ButtonVariant;
}

const CATEGORY_META: Record<
  TaskCategory,
  { emoji: string; bg: string; border: string; text: string }
> = {
  ilgi: { emoji: '💖', bg: colors.rose[50], border: colors.rose[200], text: colors.rose[600] },
  vakit: { emoji: '☕', bg: colors.copper[50], border: colors.copper[200], text: colors.copper[600] },
  plan: { emoji: '🗓️', bg: colors.emerald[50], border: colors.emerald[200], text: colors.emerald[700] },
  ev: { emoji: '🏠', bg: colors.neutral[100], border: colors.neutral[200], text: colors.neutral[700] },
};

export function TaskCard({
  template,
  title,
  onClaim,
  onEditPoints,
  claimButtonText = 'Al',
  variant = 'primary',
}: TaskCardProps) {
  const meta = CATEGORY_META[template.category] ?? CATEGORY_META.ev;

  return (
    <View style={[styles.card, { borderColor: meta.border }]}>
      <View style={styles.leftCol}>
        <View style={[styles.iconContainer, { backgroundColor: meta.bg }]}>
          <Text style={styles.emoji}>{meta.emoji}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.xpRow}>
            {onEditPoints ? (
              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  onEditPoints(template);
                }}
                style={styles.xpBadgePressable}
                accessibilityRole="button"
                accessibilityLabel="Puanı Düzenle"
              >
                <Text style={styles.xpText}>+{template.defaultPoints} XP ✏️</Text>
              </Pressable>
            ) : (
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>+{template.defaultPoints} XP</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <BouncyPressable
        variant={variant}
        title={claimButtonText}
        onPress={() => onClaim(template)}
        style={styles.claimButton}
        textStyle={styles.claimText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    ...shadows.soft,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
    letterSpacing: -0.1,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold[50],
    borderRadius: radii.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.gold[200],
  },
  xpBadgePressable: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold[50],
    borderRadius: radii.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.copper[300],
  },
  xpText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.copper[700],
  },
  claimButton: {
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
  },
  claimText: {
    fontSize: 13,
    fontWeight: '800',
  },
});

