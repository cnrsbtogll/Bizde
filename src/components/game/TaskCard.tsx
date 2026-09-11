import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { type TaskTemplate, type TaskCategory } from '@/mock/catalog';
import { BouncyPressable, type ButtonVariant } from './BouncyPressable';

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
  ev: { emoji: '🏠', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  ilgi: { emoji: '💖', bg: '#fff1f2', border: '#fecdd3', text: '#be123c' },
  vakit: { emoji: '☕', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  plan: { emoji: '🗓️', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  xpBadgePressable: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f766e',
  },
  claimButton: {
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  claimText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
