import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { ScanRecord } from '@/context/AppContext';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandIcon, { backgroundColor: colors.primary }]}>
        <MaterialCommunityIcons name="sprout" size={compact ? 18 : 22} color={colors.primaryForeground} />
      </View>
      <View>
        <Text style={[styles.brandName, { color: colors.foreground, fontSize: compact ? 16 : 19 }]}>Dehqon</Text>
        {!compact && <Text style={[styles.brandSub, { color: colors.mutedForeground }]}>AI yordamchi</Text>}
      </View>
    </View>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  label: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityLabel={label}
      testID={`icon-button-${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, opacity: pressed ? 0.65 : 1 }]}
    >
      <Feather name={icon} size={20} color={colors.foreground} />
    </Pressable>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function FeatureCard({
  icon,
  title,
  description,
  tone,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
  tone: 'green' | 'yellow' | 'blue' | 'brown';
  onPress: () => void;
}) {
  const colors = useColors();
  const toneColor = {
    green: colors.primary,
    yellow: colors.warning,
    blue: '#5286a8',
    brown: colors.earth,
  }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.featureCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.featureIcon, { backgroundColor: `${toneColor}20` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={toneColor} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.mutedForeground }]}>{description}</Text>
      <Ionicons name="arrow-forward" size={16} color={toneColor} style={styles.cardArrow} />
    </Pressable>
  );
}

export function HistoryRow({ record, onPress }: { record: ScanRecord; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={styles.historyRow}>
      <Image source={{ uri: record.imageUri }} style={styles.historyImage} />
      <View style={styles.historyCopy}>
        <Text numberOfLines={1} style={[styles.historyDisease, { color: colors.foreground }]}>{record.disease}</Text>
        <Text style={[styles.historyMeta, { color: colors.mutedForeground }]}>{record.plant} · {formatDate(record.createdAt)}</Text>
      </View>
      <View style={[styles.confidencePill, { backgroundColor: colors.successSoft }]}>
        <Text style={[styles.confidenceText, { color: colors.success }]}>{record.confidence}%</Text>
      </View>
    </Pressable>
  );
}

export function EmptyHistory() {
  const colors = useColors();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
        <MaterialCommunityIcons name="leaf-off" size={26} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Hali tahlil yo‘q</Text>
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Birinchi o‘simlik rasmini yuboring. Natija shu yerda saqlanadi.</Text>
    </View>
  );
}

export function ScreenHeader({ title, subtitle, back = false }: { title: string; subtitle?: string; back?: boolean }) {
  const colors = useColors();
  const router = useRouter();
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };
  return (
    <View style={styles.screenHeader}>
      {back ? <IconButton icon="arrow-left" onPress={goBack} label="Orqaga" /> : <BrandMark compact />}
      <View style={styles.headerCopy}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle && <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      {!back && <View style={{ width: 42 }} />}
    </View>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('uz-UZ', { day: '2-digit', month: 'short' }).format(new Date(date));
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  brandSub: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: -1 },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: -0.3 },
  sectionAction: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  featureCard: { width: '48.5%', minHeight: 152, borderWidth: 1, borderRadius: 19, padding: 15, position: 'relative' },
  featureIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  featureTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, marginBottom: 4 },
  featureDescription: { fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 17, paddingRight: 4 },
  cardArrow: { position: 'absolute', right: 14, bottom: 15 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 11 },
  historyImage: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#dfe9da' },
  historyCopy: { flex: 1 },
  historyDisease: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 4 },
  historyMeta: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  confidencePill: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  confidenceText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  emptyState: { borderWidth: 1, borderRadius: 19, alignItems: 'center', padding: 24 },
  emptyIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, marginBottom: 5 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 260 },
  screenHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14 },
  headerCopy: { flex: 1 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 23, letterSpacing: -0.5 },
  headerSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 3 },
});