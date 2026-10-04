import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, EmptyHistory, FeatureCard, HistoryRow, SectionTitle } from '@/components/DehqonUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 450);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 18), paddingBottom: insets.bottom + 30 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <BrandMark />
        <Pressable accessibilityLabel="Bildirishnomalar" style={[styles.bellButton, { backgroundColor: colors.card }]}>
          <Feather name="bell" size={19} color={colors.foreground} />
          <View style={[styles.notificationDot, { backgroundColor: colors.accent }]} />
        </Pressable>
      </View>

      <View style={styles.greeting}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>BUGUNGI YORDAMCHI</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Assalomu alaykum,{"\n"}dehqon.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Hosilingizni asrash uchun kerakli maslahatlar bir joyda.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        testID="start-scan"
        onPress={() => router.push('/scan')}
        style={({ pressed }) => [styles.scanHero, { backgroundColor: colors.primary, opacity: pressed ? 0.86 : 1 }]}
      >
        <View style={styles.heroCopy}>
          <View style={[styles.heroBadge, { backgroundColor: colors.accent }]}>
            <MaterialCommunityIcons name="auto-fix" size={14} color={colors.accentForeground} />
            <Text style={[styles.heroBadgeText, { color: colors.accentForeground }]}>AI TAHLIL</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>O‘simlikni{"\n"}tekshiring</Text>
          <Text style={[styles.heroSubtitle, { color: '#d9efd9' }]}>Rasm yuboring — 5 soniyada natija oling.</Text>
          <View style={styles.heroAction}>
            <Text style={[styles.heroActionText, { color: colors.primary }]}>Boshlash</Text>
            <Feather name="arrow-up-right" size={16} color={colors.primary} />
          </View>
        </View>
        <View style={styles.heroLeaf}>
          <MaterialCommunityIcons name="leaf" size={102} color={colors.accent} />
          <MaterialCommunityIcons name="leaf" size={58} color="#98c875" style={styles.heroSmallLeaf} />
        </View>
      </Pressable>

      <View style={styles.section}>
        <SectionTitle title="Kerakli bo‘limlar" />
        <View style={styles.featureGrid}>
          <FeatureCard icon="weather-partly-cloudy" title="Ob-havo" description="3 kunlik prognoz" tone="blue" onPress={() => router.push('/weather')} />
          <FeatureCard icon="water-outline" title="Sug‘orish" description="Aqlli jadval tuzing" tone="green" onPress={() => router.push('/irrigation')} />
          <FeatureCard icon="file-document-outline" title="Subsidiyalar" description="Imkoniyatlarni biling" tone="yellow" onPress={() => router.push('/subsidy')} />
          <FeatureCard icon="history" title="Tahlil tarixi" description={`${history.length} ta saqlangan`} tone="brown" onPress={() => router.push('/history')} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle title="So‘nggi tahlillar" action={history.length ? 'Barchasi' : undefined} onAction={() => router.push('/history')} />
        {history.length ? history.slice(0, 3).map((record) => <HistoryRow key={record.id} record={record} onPress={() => router.push('/history')} />) : <EmptyHistory />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bellButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { width: 7, height: 7, borderRadius: 4, position: 'absolute', top: 9, right: 10, borderWidth: 1, borderColor: '#fff' },
  greeting: { marginTop: 28, marginBottom: 20 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, marginBottom: 9 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 35, letterSpacing: -1.1 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 11, maxWidth: 300 },
  scanHero: { minHeight: 192, borderRadius: 24, padding: 19, overflow: 'hidden', flexDirection: 'row' },
  heroCopy: { flex: 1, zIndex: 2 },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5 },
  heroBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8 },
  heroTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.7, marginTop: 13 },
  heroSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 17, marginTop: 8, maxWidth: 180 },
  heroAction: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 9, marginTop: 13 },
  heroActionText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  heroLeaf: { position: 'absolute', right: -8, bottom: -8, transform: [{ rotate: '-28deg' }], opacity: 0.42 },
  heroSmallLeaf: { position: 'absolute', top: 27, left: 7, transform: [{ rotate: '65deg' }] },
  section: { marginTop: 27 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
});