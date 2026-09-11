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
  ilgi: { emoji: '💖', bg: '#ffe4e6', border: '#fbcfe8', text: '#db2777' },
  vakit: { emoji: '☕', bg: '#fef3c7', border: '#fde68a', text: '#d97706' },
  plan: { emoji: '🗓️', bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
  ev: { emoji: '🏠', bg: '#f0f9ff', border: '#bae6fd', text: '#0284c7' },
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
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 6,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 19,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.1,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fdf2f8',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#fbcfe8',
  },
  xpBadgePressable: {
    alignSelf: 'flex-start',
    backgroundColor: '#fdf2f8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#f472b6',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#db2777',
  },
  claimButton: {
    minWidth: 58,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  claimText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
