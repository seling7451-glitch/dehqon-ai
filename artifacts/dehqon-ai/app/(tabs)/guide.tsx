import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/DehqonUI';
import { useColors } from '@/hooks/useColors';

export default function GuideScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 18), paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Qo‘llanmalar" subtitle="Fermer uchun amaliy ma'lumotlar" />
      <Pressable onPress={() => router.push('/irrigation')} style={({ pressed }) => [styles.guideCard, { backgroundColor: colors.primary, opacity: pressed ? 0.86 : 1 }]}>
        <View style={styles.guideCopy}><View style={styles.guidePill}><MaterialCommunityIcons name="water" size={13} color={colors.primary} /><Text style={[styles.guidePillText, { color: colors.primary }]}>SUVNI TEJANG</Text></View><Text style={styles.guideTitle}>Aqlli sug‘orish{"\n"}jadvalini tuzing</Text><Text style={styles.guideText}>O‘simlik va ob-havoga mos hisob-kitob.</Text></View>
        <MaterialCommunityIcons name="water-opacity" size={92} color={colors.accent} style={styles.waterIcon} />
      </Pressable>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Foydali ma’lumotlar</Text>
      <Pressable onPress={() => router.push('/subsidy')} style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.listIcon, { backgroundColor: colors.warningSoft }]}><MaterialCommunityIcons name="file-document-outline" size={22} color={colors.warning} /></View>
        <View style={styles.listCopy}><Text style={[styles.listTitle, { color: colors.foreground }]}>Subsidiya qo‘llanmasi</Text><Text style={[styles.listText, { color: colors.mutedForeground }]}>Mavjud dasturlar, hujjatlar va murojaat joylari</Text></View><Feather name="chevron-right" size={19} color={colors.mutedForeground} />
      </Pressable>
      <Pressable onPress={() => router.push('/history')} style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.listIcon, { backgroundColor: colors.primarySoft }]}><MaterialCommunityIcons name="history" size={22} color={colors.primary} /></View>
        <View style={styles.listCopy}><Text style={[styles.listTitle, { color: colors.foreground }]}>Kasallik tarixi</Text><Text style={[styles.listText, { color: colors.mutedForeground }]}>Oldingi o‘simlik tahlillarini ko‘ring</Text></View><Feather name="chevron-right" size={19} color={colors.mutedForeground} />
      </Pressable>
      <View style={[styles.factCard, { backgroundColor: colors.secondary }]}><MaterialCommunityIcons name="chart-line" size={22} color={colors.primary} /><Text style={[styles.fact, { color: colors.secondaryForeground }]}>To‘g‘ri sug‘orish suv sarfini 30% gacha kamaytirishi mumkin.</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  guideCard: { minHeight: 178, borderRadius: 23, padding: 19, overflow: 'hidden', flexDirection: 'row' },
  guideCopy: { zIndex: 2, flex: 1 },
  guidePill: { backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, alignSelf: 'flex-start' },
  guidePillText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.7 },
  guideTitle: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 27, letterSpacing: -0.6, marginTop: 14 },
  guideText: { color: '#d9efd9', fontFamily: 'Inter_400Regular', fontSize: 11.5, marginTop: 9 },
  waterIcon: { position: 'absolute', right: -6, bottom: -8, opacity: 0.42 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 28, marginBottom: 12 },
  listCard: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 9 },
  listIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  listCopy: { flex: 1 },
  listTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, marginBottom: 4 },
  listText: { fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 17 },
  factCard: { borderRadius: 17, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  fact: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18 },
});