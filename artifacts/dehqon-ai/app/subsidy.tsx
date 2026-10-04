import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/DehqonUI';
import { useColors } from '@/hooks/useColors';

const subsidies = [
  { title: 'Paxtada tomchilatib sug‘orish', text: 'Paxta yetishtirishda tomchilatib sug‘orish texnologiyasiga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Suv xo‘jaligi vazirligi', icon: 'water-outline', color: 'green' },
  { title: 'Dukkakli ekinlarda suv tejash', text: 'Dukkakli ekinlarni yetishtirishda suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Qishloq xo‘jaligi vazirligi', icon: 'sprout', color: 'green' },
  { title: 'Paxtada diskret sug‘orish', text: 'Paxta yetishtirishda diskret sug‘orish tizimini joriy etish xarajatlarining bir qismini qoplash.', responsible: 'Suv xo‘jaligi vazirligi', icon: 'water-sync', color: 'green' },
  { title: 'Texnik ekinlarda suv tejash', text: 'Texnik ekinlarni yetishtirish uchun suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Qishloq xo‘jaligi vazirligi', icon: 'leaf', color: 'green' },
  { title: 'Moyli ekinlarda suv tejash', text: 'Moyli ekinlarni yetishtirish uchun suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Qishloq xo‘jaligi vazirligi', icon: 'seed-outline', color: 'green' },
  { title: 'Poliz ekinlarida suv tejash', text: 'Poliz ekinlarini yetishtirish uchun suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Qishloq xo‘jaligi vazirligi', icon: 'fruit-watermelon', color: 'green' },
  { title: 'Sabzavot, ko‘kat va karam', text: 'Sabzavot, ko‘katlar va karam yetishtirishda suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Qishloq xo‘jaligi vazirligi', icon: 'carrot', color: 'green' },
  { title: 'Kartoshkada suv tejash', text: 'Kartoshka yetishtirish uchun suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Qishloq xo‘jaligi vazirligi', icon: 'food-variant', color: 'green' },
  { title: 'Ozuqabop ekinlarda suv tejash', text: 'Ozuqabop ekinlarni yetishtirish uchun suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Qishloq xo‘jaligi vazirligi', icon: 'grass', color: 'green' },
  { title: 'Dorivor ekinlarda suv tejash', text: 'Dorivor ekinlarni yetishtirish uchun suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Qishloq xo‘jaligi vazirligi', icon: 'flower-outline', color: 'green' },
  { title: 'Donli ekinlarda suv tejash', text: 'G‘alla va yormabop ekinlarni yetishtirish uchun suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Qishloq xo‘jaligi vazirligi', icon: 'barley', color: 'green' },
  { title: 'Katta hajmdagi quduqlar', text: 'Katta hajmdagi quduqlarni burg‘ilash uchun sarflangan xarajatlarning bir qismini qoplash.', responsible: 'O‘zbekiston fermerlari kengashi', icon: 'arrow-down-bold-circle-outline', color: 'blue' },
  { title: 'Kichik hajmdagi quduqlar', text: 'Kichik hajmdagi quduqlarni burg‘ilash uchun sarflangan xarajatlarning bir qismini qoplash.', responsible: 'O‘zbekiston fermerlari kengashi', icon: 'arrow-down-bold-circle-outline', color: 'blue' },
  { title: 'Yaroqsiz yerlarni foydalanishga kiritish', text: 'Yaroqsiz yerlarni foydalanishga kiritish uchun sarflangan xarajatlarning bir qismini qoplash.', responsible: 'O‘zbekiston fermerlari kengashi', icon: 'terrain', color: 'brown' },
  { title: 'Danakli mevalar', text: 'Danakli mevalar yetishtirishda suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Agrosanoatni rivojlantirish agentligi', icon: 'fruit-cherries', color: 'yellow' },
  { title: 'Urug‘li mevalar', text: 'Urug‘li mevalar yetishtirishda suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Agrosanoatni rivojlantirish agentligi', icon: 'apple', color: 'yellow' },
  { title: 'Yong‘oqli mevalar', text: 'Yong‘oqli mevalar yetishtirishda suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Agrosanoatni rivojlantirish agentligi', icon: 'peanut', color: 'yellow' },
  { title: 'Subtropik mevalar', text: 'Subtropik mevalar yetishtirishda suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Agrosanoatni rivojlantirish agentligi', icon: 'fruit-citrus', color: 'yellow' },
  { title: 'Uzum yetishtirish', text: 'Uzum yetishtirishda suvni tejovchi texnologiyalarga sarflangan xarajatlarning bir qismini qoplash.', responsible: 'Agrosanoatni rivojlantirish agentligi', icon: 'fruit-grapes', color: 'yellow' },
  { title: 'Sovitkichli sig‘im qurish va jihozlash', text: 'Qoraqalpog‘iston Respublikasi sovitkichli sig‘imlar uyushmasiga a’zo subyektlar uchun ishga tushirilgan sovitkichli sig‘imlarni qurish va jihozlash xarajatlarining bir qismini qoplash.', responsible: 'Agrosanoatni rivojlantirish agentligi', icon: 'warehouse', color: 'blue' },
  { title: 'Sovitkich elektr energiyasi xarajatlari', text: 'Qoraqalpog‘iston Respublikasi sovitkichli sig‘imlar uyushmasiga a’zo subyektlarning qish va bahor oylaridagi elektr energiyasi xarajatlarining bir qismini qoplash.', responsible: 'Agrosanoatni rivojlantirish agentligi', icon: 'flash-outline', color: 'blue' },
  { title: 'Nasldor qoramol, qo‘y va echki', text: 'Xorijiy davlatlardan import qilingan nasldor qoramol, qo‘y va echkilar uchun subsidiya.', responsible: 'Veterinariya va chorvachilikni rivojlantirish qo‘mitasi', icon: 'cow', color: 'brown' },
];

const commonDocuments = [
  'Elektron ariza va arizachining JShShIR yoki STIR ma’lumoti.',
  'Bank hisob raqami va aloqa ma’lumotlari.',
  'Yer yoki ishlab chiqarish faoliyatini tasdiqlovchi hujjat.',
  'Xarajatlarni tasdiqlovchi shartnoma, hisob-faktura yoki to‘lov hujjati.',
];

function getRequiredDocuments(title: string): string[] {
  if (title.includes('quduq')) {
    return [...commonDocuments, 'Quduq burg‘ilash loyihasi, texnik xulosa va bajarilgan ish dalolatnomasi.'];
  }
  if (title.includes('Sovitkich')) {
    return [...commonDocuments, 'Sovitkich sig‘imi yoki elektr energiyasi xarajatlarini tasdiqlovchi texnik va to‘lov hujjatlari.'];
  }
  if (title.includes('Nasldor')) {
    return [...commonDocuments, 'Hayvonning veterinariya hujjati, kelib chiqish va import hujjatlari.'];
  }
  if (title.includes('Yaroqsiz yer')) {
    return [...commonDocuments, 'Yerni foydalanishga kiritish bo‘yicha loyiha va tegishli yer hujjatlari.'];
  }
  return [...commonDocuments, 'Suv tejovchi texnologiya yoki ekin turi bo‘yicha texnik loyiha va bajarilgan ish hujjati.'];
}

// Har bir mas'ul tashkilot uchun qisqa chip nomi — filtr qatorida ishlatiladi.
const categories = [
  { label: 'Barchasi', match: null },
  { label: 'Suv xo‘jaligi', match: 'Suv xo‘jaligi vazirligi' },
  { label: 'Qishloq xo‘jaligi', match: 'Qishloq xo‘jaligi vazirligi' },
  { label: 'Fermerlar kengashi', match: 'O‘zbekiston fermerlari kengashi' },
  { label: 'Agrosanoat', match: 'Agrosanoatni rivojlantirish agentligi' },
  { label: 'Chorvachilik', match: 'Veterinariya va chorvachilikni rivojlantirish qo‘mitasi' },
] as const;

export default function SubsidyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [expandedTitle, setExpandedTitle] = React.useState<string | null>(null);
  const [showPlatforms, setShowPlatforms] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<string | null>(null);

  const filtered = subsidies.filter((item) => {
    const matchesCategory = !category || item.responsible === category;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 18), paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Subsidiya qo‘llanmasi" subtitle="711-son qarordagi yo‘nalishlar" back />
      <View style={[styles.intro, { backgroundColor: colors.primarySoft }]}><MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} /><Text style={[styles.introText, { color: colors.secondaryForeground }]}>Oddiy qishloq fermerlari, kichik xo‘jaliklar va yirik fermer xo‘jaliklari uchun subsidiya bor. Bu yordam kichik xarajatlarni kamaytiradi va suv, texnika, urug‘ va ishlov berishga yordam beradi.</Text></View>

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          testID="subsidy-search"
          value={query}
          onChangeText={setQuery}
          placeholder="Subsidiya turini qidirish…"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
        {query.length > 0 && <Pressable onPress={() => setQuery('')} hitSlop={8}><Feather name="x" size={16} color={colors.mutedForeground} /></Pressable>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {categories.map((item) => {
          const active = category === item.match;
          return (
            <Pressable key={item.label} testID={`subsidy-filter-${item.label}`} onPress={() => setCategory(item.match)} style={[styles.categoryChip, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}>
              <Text style={[styles.categoryText, { color: active ? colors.primaryForeground : colors.foreground }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="file-search-outline" size={22} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Hech narsa topilmadi. Boshqa kalit so‘z yoki kategoriya bilan qidirib ko‘ring.</Text>
        </View>
      )}

      {filtered.map((item) => {
        const tone = item.color === 'green' ? colors.primary : item.color === 'yellow' ? colors.warning : item.color === 'brown' ? colors.earth : '#5286a8';
        const expanded = expandedTitle === item.title;
        return <Pressable testID={`subsidy-${item.title}`} key={item.title} onPress={() => setExpandedTitle(expanded ? null : item.title)} style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.cardPressed]}>
          <View style={styles.cardTop}><View style={[styles.icon, { backgroundColor: `${tone}20` }]}><MaterialCommunityIcons name={item.icon as 'sprout'} size={22} color={tone} /></View><View style={styles.cardTitleCopy}><Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.cardAmount, { color: tone }]}>{item.responsible}</Text></View><Feather name={expanded ? 'chevron-up' : 'bookmark'} size={18} color={colors.mutedForeground} /></View>
          <Text style={[styles.cardText, { color: colors.mutedForeground }]}>{item.text}</Text>
          <View style={[styles.cardBottom, { borderTopColor: colors.border }]}><Text style={[styles.cardBottomText, { color: colors.foreground }]}>{expanded ? 'Batafsil ma’lumotni yopish' : 'Batafsil ma’lumotni ko‘rish'}</Text><Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={colors.mutedForeground} /></View>
          {expanded && <View style={[styles.detail, { backgroundColor: colors.primarySoft }]}><Text style={[styles.question, { color: colors.foreground }]}>Subsidiya nima uchun beriladi?</Text><Text style={[styles.detailText, { color: colors.secondaryForeground }]}>{item.text}</Text><Text style={[styles.question, { color: colors.foreground }]}>Qayerdan olish mumkin?</Text><Text style={[styles.detailText, { color: colors.secondaryForeground }]}>Ariza YIDXP, Agroportal yoki Agrosubsidiya axborot tizimi orqali topshiriladi. Mas’ul tashkilot: {item.responsible}.</Text><Text style={[styles.question, { color: colors.foreground }]}>Qanday hujjatlar kerak?</Text>{getRequiredDocuments(item.title).map((document) => <Text key={document} style={[styles.detailText, { color: colors.secondaryForeground }]}>• {document}</Text>)}<Text style={[styles.question, { color: colors.foreground }]}>Qanday tartibda beriladi?</Text><Text style={[styles.detailText, { color: colors.secondaryForeground }]}>Elektron ariza yuboriladi, hujjatlar o‘rganiladi va tasdiqlangach mablag‘ arizada ko‘rsatilgan bank hisob raqamiga o‘tkaziladi.</Text><Text style={[styles.detailNote, { color: colors.mutedForeground }]}>Muhim: hujjatlar, summa va muddat subsidiya turiga qarab o‘zgaradi. Ariza yuborishdan oldin Agrosubsidiya yoki tegishli rasmiy platformadagi yakuniy ro‘yxatni tekshiring.</Text></View>}
        </Pressable>;
      })}
      <View style={[styles.processCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.processHeader}><MaterialCommunityIcons name="timeline-check-outline" size={21} color={colors.primary} /><Text style={[styles.processTitle, { color: colors.foreground }]}>Ariza berish tartibi</Text></View><Text style={[styles.processText, { color: colors.mutedForeground }]}>1. Subsidiya turini tanlang va “Batafsil ma’lumot”ni oching.</Text><Text style={[styles.processText, { color: colors.mutedForeground }]}>2. Ko‘rsatilgan hujjatlarni tayyorlang.</Text><Text style={[styles.processText, { color: colors.mutedForeground }]}>3. YIDXP, Agroportal yoki Agrosubsidiya orqali elektron ariza yuboring.</Text><Text style={[styles.processText, { color: colors.mutedForeground }]}>4. Hujjatlar tekshiriladi va tasdiqlansa, mablag‘ bank hisob raqamiga o‘tkaziladi.</Text><Text style={[styles.processNote, { color: colors.secondaryForeground }]}>Ariza yuborishdan oldin aynan tanlangan subsidiya uchun rasmiy hujjatlar ro‘yxatini tekshiring.</Text></View>
      <Pressable testID="subsidy-platforms" onPress={() => setShowPlatforms((visible) => !visible)} style={({ pressed }) => [styles.contact, { backgroundColor: colors.secondary }, pressed && styles.cardPressed]}><MaterialCommunityIcons name="web" size={20} color={colors.primary} /><View style={styles.contactCopy}><Text style={[styles.contactText, { color: colors.secondaryForeground }]}>Ariza platformalari</Text>{showPlatforms && <Text style={[styles.platformDetail, { color: colors.mutedForeground }]}>YIDXP, Agroportal yoki Agrosubsidiya axborot tizimi orqali yuboriladi.</Text>}</View><Feather name={showPlatforms ? 'chevron-up' : 'chevron-down'} size={17} color={colors.mutedForeground} /></Pressable>
      <Text style={[styles.source, { color: colors.mutedForeground }]}>Manba: Vazirlar Mahkamasining 2022-yil 16-dekabrdagi 711-son qarori va hujjatdagi keyingi tahrir qaydlari.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  intro: { borderRadius: 15, padding: 13, flexDirection: 'row', gap: 9, alignItems: 'center', marginBottom: 14 },
  introText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17, flex: 1 },
  searchBox: { borderWidth: 1, borderRadius: 15, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 12.5, paddingVertical: 2 },
  categoryRow: { gap: 8, paddingBottom: 4, marginBottom: 12 },
  categoryChip: { borderWidth: 1, borderRadius: 13, paddingVertical: 8, paddingHorizontal: 13 },
  categoryText: { fontFamily: 'Inter_600SemiBold', fontSize: 11.5 },
  emptyState: { borderWidth: 1, borderRadius: 17, padding: 20, alignItems: 'center', gap: 8, marginBottom: 6 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 19, padding: 15, marginBottom: 10 },
  cardPressed: { opacity: 0.86 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cardTitleCopy: { flex: 1 },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, marginBottom: 4 },
  cardAmount: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  cardText: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 13 },
  cardBottom: { borderTopWidth: 1, marginTop: 13, paddingTop: 11, flexDirection: 'row', gap: 8, alignItems: 'center' },
  cardBottomText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 10.5 },
  detail: { borderRadius: 13, padding: 12, marginTop: 12, gap: 5 },
  question: { fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  detailText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 16 },
  detailNote: { fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  contact: { marginTop: 5, borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  contactCopy: { flex: 1 },
  contactText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 11.5, lineHeight: 17 },
  platformDetail: { fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  processCard: { borderWidth: 1, borderRadius: 19, padding: 15, marginTop: 5 },
  processHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  processTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  processText: { fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 18, marginBottom: 5 },
  processNote: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 17, marginTop: 8 },
  source: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 14, paddingHorizontal: 8 },
});
