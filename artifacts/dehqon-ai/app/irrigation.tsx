import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/DehqonUI';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useWeather } from '@/hooks/useWeather';

// Manba: "Qishloq xo'jalik ekinlarining sug'orish rejimi" ma'ruzasi (Isayev S.X.,
// Irrigatsiya va melioratsiya kafedrasi) — ekinlarning o'rtacha mavsumiy suv
// iste'moli (m3/ga), litrga o'tkazilgan (1 m3 = 1000 L). Bog' va makkajo'xori
// uchun aniq son ko'rsatilmagani sababli, yaqin ekin guruhlariga tayanib
// taxminiy oraliq olindi — bu haqda ekran ichida ham eslatma bor.
const crops = [
  { name: 'G‘o‘za', icon: 'sprout', seasonalMinL: 6_000_000, seasonalMaxL: 9_000_000, sourced: true },
  { name: 'G‘alla', icon: 'barley', seasonalMinL: 3_000_000, seasonalMaxL: 4_000_000, sourced: true },
  { name: 'Ko‘p yillik o‘tlar', icon: 'grass', seasonalMinL: 8_000_000, seasonalMaxL: 12_000_000, sourced: true },
  { name: 'Poliz ekinlari', icon: 'fruit-watermelon', seasonalMinL: 3_000_000, seasonalMaxL: 10_000_000, sourced: true },
  { name: 'Makkajo‘xori', icon: 'corn', seasonalMinL: 4_500_000, seasonalMaxL: 6_500_000, sourced: false },
  { name: 'Bog‘ va uzum', icon: 'fruit-grapes', seasonalMinL: 6_000_000, seasonalMaxL: 9_000_000, sourced: false },
] as const;

// Sug'orish usulining suv sarfiga ta'siri (yer ustidan usuliga nisbatan koeffitsient).
// Tomchilatib usul odatda 40-50%, yomg'irlatib esa ~15-20% suv tejaydi.
const irrigationMethods = [
  { name: 'Tomchilatib', icon: 'water-outline', efficiency: 0.55, savingNote: 'Yer ustidan usuliga nisbatan ~45% suv tejaydi' },
  { name: 'Yomg‘irlatib', icon: 'weather-pouring', efficiency: 0.8, savingNote: 'Yer ustidan usuliga nisbatan ~20% suv tejaydi' },
  { name: 'Yer ustidan', icon: 'waves', efficiency: 1, savingNote: 'An’anaviy usul — eng ko‘p suv sarflaydi' },
] as const;

// Ekin bir mavsumda taxminan necha marta sug‘oriladi — bitta sug‘orishga
// to‘g‘ri keladigan suv hajmini taxminiy hisoblash uchun ishlatiladi.
const seasonalIrrigationCount: Record<string, number> = {
  'G‘o‘za': 7,
  'G‘alla': 4,
  'Ko‘p yillik o‘tlar': 8,
  'Poliz ekinlari': 6,
  'Makkajo‘xori': 6,
  'Bog‘ va uzum': 10,
};

function formatLiters(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} mln L`;
  return `${Math.round(value).toLocaleString('ru-RU')} L`;
}

function formatCubicMeters(value: number): string {
  return `${(value / 1_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} m³`;
}

export default function IrrigationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { weather, isCached, error } = useWeather();
  const [selected, setSelected] = useState('G‘o‘za');
  const [method, setMethod] = useState('Tomchilatib');
  const [soil, setSoil] = useState('O‘rtacha');
  const [fieldArea, setFieldArea] = useState('1');
  const selectedCrop = crops.find((crop) => crop.name === selected) ?? crops[0];
  const selectedMethod = irrigationMethods.find((item) => item.name === method) ?? irrigationMethods[0];
  const dripMethod = irrigationMethods.find((item) => item.name === 'Tomchilatib')!;
  const areaInHectares = Number(fieldArea.replace(',', '.'));
  const validArea = Number.isFinite(areaInHectares) && areaInHectares > 0;
  const savedWaterMinL = validArea ? selectedCrop.seasonalMinL * (1 - dripMethod.efficiency) * areaInHectares : 0;
  const savedWaterMaxL = validArea ? selectedCrop.seasonalMaxL * (1 - dripMethod.efficiency) * areaInHectares : 0;

  const seasonalMinL = selectedCrop.seasonalMinL * selectedMethod.efficiency;
  const seasonalMaxL = selectedCrop.seasonalMaxL * selectedMethod.efficiency;
  const seasonalAvgL = (seasonalMinL + seasonalMaxL) / 2;
  const irrigationCount = seasonalIrrigationCount[selectedCrop.name] ?? 6;
  const perEventL = seasonalAvgL / irrigationCount;

  const smartSuggestion = useMemo(() => {
    const hotDry = (weather?.current.temperature ?? 28) >= 30 && (weather?.current.humidity ?? 50) < 50;
    const rainy = (weather?.current.precipitation ?? 0) > 0 || (weather?.forecast[0]?.rainProbability ?? 0) >= 50 || (weather?.forecast[0]?.precipitation ?? 0) >= 3;
    const veryDrySoil = soil === 'Quruq';
    const moderateSoil = soil === 'O‘rtacha';

    if (rainy) {
      return {
        title: 'Yomg‘ir yaqin — suvni tez to‘xtating',
        detail: 'Yomg‘ir belgisi kuchli bo‘lsa, suv berishni qisqartiring. Agar kerak bo‘lsa, faqat ildiz zonasini namlash uchun sekin, kichik dozada sug‘oring.',
        method: 'Yomg‘irlatib',
        savedWater: 18,
      };
    }

    if (soil === 'Nam') {
      return {
        title: 'Nam tuproq — ortiqcha sug‘orishni oldini oling',
        detail: 'Tuproq yetarlicha nam bo‘lsa, suv miqdorini kamaytiring. Yomg‘irlatib yoki an’anaviy usul bilan yumshoq ishlash maqsadga muvofiq.',
        method: 'Yomg‘irlatib',
        savedWater: 22,
      };
    }

    if (hotDry || veryDrySoil) {
      return {
        title: 'Quruq va issiq sharoit — tomchilatib usul foydali',
        detail: 'Harorat yuqori va tuproq quruq bo‘lsa, tomchilatib sug‘orish ildiz zonasiga to‘g‘ri yetib, suvni me’yordan oshirmasdan namlash imkonini beradi.',
        method: 'Tomchilatib',
        savedWater: 40,
      };
    }

    if (moderateSoil) {
      return {
        title: 'O‘rtacha sharoit — usulni ekinga qarab tanlang',
        detail: 'Tuproq va iqlim o‘rtacha bo‘lsa, tomchilatib yoki yomg‘irlatib usulni ekinning ehtiyoji va maydon hajmiga qarab tanlash yaxshiroq.',
        method: 'Tomchilatib',
        savedWater: 28,
      };
    }

    return {
      title: 'Suv tejash uchun maqsadli reja',
      detail: 'Yangi usulni tanlashdan avval suvga bo‘lgan talabni ekin turi, tuproq namligi va ob-havo bilan solishtiring. Tomchilatib usul foydali bo‘lishi mumkin, lekin doimo yagona yechim emas.',
      method: 'Tomchilatib',
      savedWater: 25,
    };
  }, [soil, weather]);

  const recommendation = useMemo(() => {
    if (!weather) return { advice: 'Ob-havo ma’lumoti yuklanmoqda. Hujjatdagi diapazon umumiy ko‘rsatkichdir.', time: 'Mahalliy sharoitga qarab' };
    const rainy = weather.current.precipitation > 0 || weather.forecast[0].rainProbability >= 60 || weather.forecast[0].precipitation >= 4;
    const hot = weather.current.temperature >= 32;
    const humid = weather.current.humidity >= 70;
    if (rainy) return { advice: 'Yomg‘ir kutilmoqda. Sug‘orish vaqtini va miqdorini mahalliy sharoitga moslang.', time: 'Yomg‘irdan keyin tekshiring' };
    if (hot) return { advice: 'Havo issiq. Bug‘lanishni kamaytirish uchun kechqurun sug‘oring.', time: '19:00 – 21:00' };
    if (humid) return { advice: 'Namlik yuqori. Ortiqcha suv berishdan saqlaning.', time: '19:00 – 21:00' };
    if (soil === 'Nam') return { advice: 'Tuproq nam. Ortiqcha sug‘ormang, ildiz qatlamidagi namlikni kuzating.', time: 'Namlik kamaygach' };
    if (soil === 'Quruq') return { advice: 'Tuproq quruq. Namlikni tekshirib, sug‘orish vaqtini sharoitga moslang.', time: '19:00 – 21:00' };
    return { advice: 'Ob-havo me’yorida. Sug‘orish rejimi ekin, tuproq va usulga qarab belgilanadi.', time: '19:00 – 21:00' };
  }, [soil, weather]);

  return (
    <KeyboardAwareScrollViewCompat
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 18), paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bottomOffset={40}
    >
      <ScreenHeader title="Sug‘orish jadvali" subtitle="Hujjatdagi umumiy me’yorlar" back />
      <View style={[styles.sourceIntro, { backgroundColor: colors.primarySoft }]}><MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} /><Text style={[styles.sourceIntroText, { color: colors.secondaryForeground }]}>Bu bo‘lim yuklangan ma’ruzadagi mavsumiy suv iste’moli me’yorlari asosida hisoblanadi. Aniq jadval dala sharoitida belgilanadi.</Text></View>
      <Text style={[styles.label, { color: colors.foreground }]}>Ekin turini tanlang</Text>
      <View style={styles.plantRow}>{crops.map((crop) => <Pressable testID={`crop-${crop.name}`} key={crop.name} onPress={() => setSelected(crop.name)} style={[styles.plantChip, { backgroundColor: selected === crop.name ? colors.primary : colors.card, borderColor: selected === crop.name ? colors.primary : colors.border }]}><MaterialCommunityIcons name={crop.icon as 'leaf'} size={18} color={selected === crop.name ? colors.primaryForeground : colors.primary} /><Text style={[styles.plantName, { color: selected === crop.name ? colors.primaryForeground : colors.foreground }]}>{crop.name}</Text></Pressable>)}</View>
      <Text style={[styles.label, { color: colors.foreground, marginTop: 24 }]}>Tuproq holati</Text>
      <View style={[styles.segment, { backgroundColor: colors.secondary }]}>{['Nam', 'O‘rtacha', 'Quruq'].map((item) => <Pressable key={item} onPress={() => setSoil(item)} style={[styles.segmentItem, soil === item && { backgroundColor: colors.card }]}><Text style={[styles.segmentText, { color: soil === item ? colors.primary : colors.mutedForeground }]}>{item}</Text></Pressable>)}</View>
      <Text style={[styles.soilNote, { color: colors.mutedForeground }]}>Tizim tanlangan ekin, tuproq holati, sug‘orish usuli va ob-havoga qarab umumiy tavsiya beradi.</Text>
      <Text style={[styles.label, { color: colors.foreground, marginTop: 24 }]}>Sug‘orish usuli</Text>
      <View style={styles.methodList}>{irrigationMethods.map((item) => <Pressable testID={`method-${item.name}`} key={item.name} onPress={() => setMethod(item.name)} style={[styles.methodItem, { backgroundColor: method === item.name ? colors.primarySoft : colors.card, borderColor: method === item.name ? colors.primary : colors.border }]}><MaterialCommunityIcons name={item.icon as 'water-outline'} size={18} color={colors.primary} /><View style={styles.methodCopy}><Text style={[styles.methodName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.methodRange, { color: colors.mutedForeground }]}>{item.savingNote}</Text></View>{method === item.name && <Feather name="check" size={17} color={colors.primary} />}</Pressable>)}</View>
      <View style={[styles.resultCard, { backgroundColor: colors.primary }]}>
        <View style={styles.resultTop}><View><Text style={styles.resultLabel}>AQLLI TAVSIYA</Text><Text style={styles.amount}>{smartSuggestion.method}</Text><Text style={styles.resultSub}>{smartSuggestion.savedWater}% suv tejash imkoniyati</Text></View><View style={[styles.dropIcon, { backgroundColor: colors.accent }]}><MaterialCommunityIcons name="water" size={27} color={colors.accentForeground} /></View></View>
         <View style={styles.resultLine}><Feather name="trending-up" size={16} color="#d9efd9" /><Text style={styles.resultAdvice}>{smartSuggestion.title}</Text></View>
         <View style={[styles.resultLine, styles.secondResultLine]}><Feather name="clock" size={16} color="#d9efd9" /><Text style={styles.resultAdvice}>Mos vaqt: {recommendation.time}</Text></View>
      </View>
      <View style={[styles.note, { backgroundColor: colors.warningSoft }]}><MaterialCommunityIcons name="water-pump" size={22} color={colors.warning} /><View style={{ flex: 1 }}><Text style={[styles.noteText, { color: colors.secondaryForeground }]}>{smartSuggestion.detail}</Text><Text style={[styles.weatherMeta, { color: colors.mutedForeground }]}>{recommendation.advice}</Text>{weather && <Text style={[styles.weatherMeta, { color: colors.mutedForeground }]}>{isCached ? 'Saqlangan ob-havo asosida' : 'Jonli ob-havo asosida'} · {Math.round(weather.current.temperature)}° · namlik {Math.round(weather.current.humidity)}%</Text>}{!weather && error && <Text style={[styles.weatherMeta, { color: colors.mutedForeground }]}>Ob-havo ulanmagan — umumiy me’yor ko‘rsatildi.</Text>}</View></View>
      <View style={[styles.resultCardSmall, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.resultLabelSmall, { color: colors.foreground }]}>1 GEKTAR UCHUN, BITTA SUG‘ORISH</Text>
        <Text style={[styles.amountSmall, { color: colors.foreground }]}>{formatLiters(perEventL)}</Text>
        <Text style={[styles.resultSubSmall, { color: colors.mutedForeground }]}>{selectedCrop.name} · {selectedMethod.name}</Text>
        <Text style={[styles.secondaryLine, { color: colors.mutedForeground }]}>Mavsum davomida: {formatLiters(seasonalMinL)} – {formatLiters(seasonalMaxL)} (≈{irrigationCount} marta sug‘orish)</Text>
      </View>
      <View style={[styles.savingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.resultLabelSmall, { color: colors.foreground }]}>MAYDON BO‘YICHA SUV TEJAMKORLIGI</Text>
        <View style={styles.areaInputRow}>
          <TextInput
            accessibilityLabel="Maydon gektarda"
            keyboardType="decimal-pad"
            onChangeText={(value) => setFieldArea(value.replace(/[^\d.,]/g, ''))}
            placeholder="Masalan, 2.5"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.areaInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            value={fieldArea}
          />
          <Text style={[styles.areaUnit, { color: colors.mutedForeground }]}>gektar</Text>
        </View>
        {validArea ? (
          <>
            <Text style={[styles.savingsAmount, { color: colors.primary }]}>{formatCubicMeters(savedWaterMinL)} – {formatCubicMeters(savedWaterMaxL)}</Text>
            <Text style={[styles.resultSubSmall, { color: colors.mutedForeground }]}>{selectedCrop.name} · bir mavsumda · yer ustidan usulga nisbatan</Text>
          </>
        ) : (
          <Text style={[styles.resultSubSmall, { color: colors.warning }]}>Maydonni gektarda kiriting (0 dan katta).</Text>
        )}
        <Text style={[styles.secondaryLine, { color: colors.mutedForeground }]}>Taxminiy hisob: tomchilatib usulda ~45% kam suv sarflanishi asosida. Haqiqiy tejam tuproq va ob-havoga bog‘liq.</Text>
      </View>
       {!selectedCrop.sourced && <View style={[styles.note, { backgroundColor: colors.secondary }]}><MaterialCommunityIcons name="information-outline" size={20} color={colors.mutedForeground} /><Text style={[styles.noteText, { color: colors.mutedForeground, fontSize: 11 }]}>Bu ekin uchun ma’ruzada aniq raqam ko‘rsatilmagan — yaqin ekin guruhlari asosida taxminiy hisoblangan. Aniq me’yorni mahalliy agronom bilan tekshiring.</Text></View>}
       <View style={[styles.sourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.sourceHeader}><MaterialCommunityIcons name="book-open-page-variant-outline" size={19} color={colors.primary} /><Text style={[styles.sourceTitle, { color: colors.foreground }]}>Manba va cheklov</Text></View><Text style={[styles.sourceText, { color: colors.mutedForeground }]}>“Qishloq xo‘jalik ekinlarining sug‘orish rejimi” ma’ruzasi, Irrigatsiya va melioratsiya fani, Isayev Sabirjan Xusanbayevich.</Text><Text style={[styles.sourceText, { color: colors.mutedForeground }]}>Me’yorlar umumiy diapazon bo‘lib, iqlim, tuproq, sizot suvi, ekin turi va sug‘orish texnikasiga qarab o‘zgaradi.</Text></View>
       <Pressable onPress={() => router.back()} style={[styles.doneButton, { backgroundColor: colors.secondary }]}><Text style={[styles.doneText, { color: colors.secondaryForeground }]}>Yopish</Text></Pressable>
     </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  sourceIntro: { borderRadius: 15, padding: 13, flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 18 },
  sourceIntroText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 17 },
  label: { fontFamily: 'Inter_700Bold', fontSize: 14, marginBottom: 11 },
  plantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  plantChip: { borderWidth: 1, borderRadius: 15, paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  plantName: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  segment: { padding: 4, borderRadius: 15, flexDirection: 'row', gap: 3 },
  segmentItem: { flex: 1, alignItems: 'center', borderRadius: 12, paddingVertical: 11 },
  segmentText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  soilNote: { fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 15, marginTop: 8 },
  methodList: { gap: 8 },
  methodItem: { borderWidth: 1, borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  methodCopy: { flex: 1 },
  methodName: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  methodRange: { fontFamily: 'Inter_400Regular', fontSize: 10.5, marginTop: 3 },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  formTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  resultCard: { borderRadius: 22, padding: 19, marginTop: 25 },
  resultTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultLabel: { color: '#d9efd9', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1 },
  amount: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 34, letterSpacing: -1, marginTop: 6 },
  resultSub: { color: '#d9efd9', fontFamily: 'Inter_400Regular', fontSize: 11 },
  dropIcon: { width: 55, height: 55, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  resultLine: { borderTopWidth: 1, borderTopColor: '#ffffff35', marginTop: 19, paddingTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  secondResultLine: { marginTop: 11, paddingTop: 11 },
  resultAdvice: { color: '#d9efd9', fontFamily: 'Inter_500Medium', fontSize: 12, flex: 1 },
  resultCardSmall: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 14 },
  resultLabelSmall: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1 },
  amountSmall: { fontFamily: 'Inter_700Bold', fontSize: 26, letterSpacing: -0.8, marginTop: 5 },
  resultSubSmall: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  secondaryLine: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 10 },
  savingsCard: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 14 },
  areaInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  areaInput: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontFamily: 'Inter_500Medium', fontSize: 14 },
  areaUnit: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  savingsAmount: { fontFamily: 'Inter_700Bold', fontSize: 23, marginTop: 13 },
  note: { marginTop: 14, borderRadius: 17, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noteText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  weatherMeta: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 5 },
  sourceCard: { borderWidth: 1, borderRadius: 17, padding: 14, marginTop: 14, gap: 7 },
  sourceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sourceTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  sourceText: { fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 16 },
  doneButton: { borderRadius: 15, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  doneText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
});
