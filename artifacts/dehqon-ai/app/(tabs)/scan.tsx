import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/DehqonUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { usePlantDiseaseInference } from '@/services/plant-disease-inference';

const PHOTO_TIPS = [
  { icon: 'leaf' as const, text: 'Faqat bitta barg — meva, gul yoki butun o‘simlik emas' },
  { icon: 'image-filter-center-focus' as const, text: 'Barg kadrni to‘ldirsin, yaqindan suratga oling' },
  { icon: 'palette-outline' as const, text: 'Tekis, bir xil fonda (stol, oq qog‘oz, qo‘l kafti)' },
  { icon: 'white-balance-sunny' as const, text: 'Yorug‘ joyda, soyasiz va tiniq (aniq fokusda)' },
];

export default function ScanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addScan } = useApp();
  const { predict, isModelLoading, modelError } = usePlantDiseaseInference();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ plant: string; disease: string; confidence: number; advice: string; warning?: string; isDemo: boolean } | null>(null);
  const [error, setError] = useState('');

  const chooseImage = async (source: 'camera' | 'library') => {
    setError('');
    const response = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] });
    if (!response.canceled && response.assets[0]?.uri) {
      setImageUri(response.assets[0].uri);
      setResult(null);
      await Haptics.selectionAsync();
    }
  };

  const analyze = async () => {
    if (!imageUri) return;
    setIsAnalyzing(true);
    setError('');
    let nextResult: NonNullable<typeof result>;
    try {
      nextResult = { ...(await predict(imageUri)), isDemo: false };
    } catch (analysisError) {
      nextResult = {
        plant: 'Aniqlanmadi',
        disease: 'AI tahlili bajarilmadi',
        confidence: 0,
        advice: `Internetdagi AI serverga ulanib bo‘lmadi. Internet aloqasi va server manzilini tekshiring. Sabab: ${analysisError instanceof Error ? analysisError.message : 'noma’lum xato'}.`,
        isDemo: true,
      };
    } finally {
      setIsAnalyzing(false);
    }

    setResult(nextResult);
    try {
      await addScan({ imageUri, ...nextResult });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Natija tayyor, lekin uni qurilmadagi tahlil tarixiga saqlab bo‘lmadi.');
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 18), paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="O‘simlik tahlili" subtitle="Rasm orqali kasallikni aniqlang" />
      <View style={[styles.guideCard, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
        <View style={styles.guideHeader}>
          <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
          <Text style={[styles.guideTitle, { color: colors.secondaryForeground }]}>Qanday rasm olish kerak?</Text>
        </View>
        {PHOTO_TIPS.map((tip) => (
          <View key={tip.text} style={styles.guideRow}>
            <MaterialCommunityIcons name={tip.icon} size={15} color={colors.primary} />
            <Text style={[styles.guideText, { color: colors.secondaryForeground }]}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {imageUri ? (
        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <Pressable accessibilityLabel="Rasmni almashtirish" onPress={() => setImageUri(null)} style={[styles.removeButton, { backgroundColor: colors.card }]}>
            <Feather name="x" size={18} color={colors.foreground} />
          </Pressable>
        </View>
      ) : (
        <View style={[styles.dropzone, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.cameraCircle, { backgroundColor: colors.primarySoft }]}>
            <MaterialCommunityIcons name="camera-plus-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.dropTitle, { color: colors.foreground }]}>O‘simlik rasmini tanlang</Text>
          <Text style={[styles.dropText, { color: colors.mutedForeground }]}>Kamera yoki galereyadan foydalaning</Text>
          <View style={styles.sourceRow}>
            <Pressable testID="open-camera" onPress={() => chooseImage('camera')} style={({ pressed }) => [styles.sourceButton, { backgroundColor: colors.primary, opacity: pressed ? 0.75 : 1 }]}>
              <Feather name="camera" size={17} color={colors.primaryForeground} />
              <Text style={[styles.sourceText, { color: colors.primaryForeground }]}>Kamera</Text>
            </Pressable>
            <Pressable testID="open-gallery" onPress={() => chooseImage('library')} style={({ pressed }) => [styles.sourceButton, { backgroundColor: colors.secondary, opacity: pressed ? 0.75 : 1 }]}>
              <Feather name="image" size={17} color={colors.secondaryForeground} />
              <Text style={[styles.sourceText, { color: colors.secondaryForeground }]}>Galereya</Text>
            </Pressable>
          </View>
        </View>
      )}

      {imageUri && !result && (
        <Pressable disabled={isAnalyzing || isModelLoading || (Platform.OS !== 'web' && !!modelError)} onPress={analyze} style={({ pressed }) => [styles.analyzeButton, { backgroundColor: colors.primary, opacity: isAnalyzing || isModelLoading || (Platform.OS !== 'web' && !!modelError) ? 0.55 : pressed ? 0.86 : 1 }]}>
          {isAnalyzing ? <ActivityIndicator color={colors.primaryForeground} /> : <MaterialCommunityIcons name="brain" size={20} color={colors.primaryForeground} />}
          <Text style={[styles.analyzeText, { color: colors.primaryForeground }]}>{isAnalyzing ? 'Tahlil qilinmoqda...' : 'AI bilan tahlil qilish'}</Text>
        </Pressable>
      )}

      {result && (
        <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultIcon, { backgroundColor: colors.successSoft }]}>
              <MaterialCommunityIcons name="check" size={22} color={colors.success} />
            </View>
            <View style={styles.resultTitleCopy}>
              <Text style={[styles.resultEyebrow, { color: result.isDemo || result.warning ? colors.warning : colors.success }]}>{result.isDemo ? 'DEMO/EKSPERIMENTAL NATIJA' : 'AI TASHXISI'}</Text>
              <Text style={[styles.resultTitle, { color: colors.foreground }]}>{result.plant}: {result.disease}</Text>
            </View>
            {result.confidence > 0 && <Text style={[styles.resultConfidence, { color: colors.success }]}>{result.confidence}%</Text>}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.adviceLabel, { color: colors.mutedForeground }]}>TAVSIYA</Text>
          {result.warning && <Text style={[styles.warningText, { color: colors.warning }]}>{result.warning}</Text>}
          <Text style={[styles.adviceText, { color: colors.foreground }]}>{result.advice}</Text>
          <Pressable onPress={() => router.push('/history')} style={[styles.historyButton, { backgroundColor: colors.secondary }]}>
            <Feather name="clock" size={16} color={colors.secondaryForeground} />
            <Text style={[styles.historyButtonText, { color: colors.secondaryForeground }]}>Tarixni ko‘rish</Text>
          </Pressable>
        </View>
      )}

      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
      {isModelLoading && <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>AI modeli tayyorlanmoqda...</Text>}
      {!isModelLoading && modelError && <Text style={[styles.disclaimer, { color: colors.warning }]}>{modelError}</Text>}
      <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>Rasm internet orqali AI serverida tahlil qilinadi.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  guideCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16, gap: 8 },
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  guideTitle: { fontFamily: 'Inter_700Bold', fontSize: 12.5 },
  guideRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guideText: { fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 16, flex: 1 },
  dropzone: { minHeight: 330, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 23, alignItems: 'center', justifyContent: 'center', padding: 24 },
  cameraCircle: { width: 80, height: 80, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  dropTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 6 },
  dropText: { fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 22 },
  sourceRow: { flexDirection: 'row', gap: 9 },
  sourceButton: { minWidth: 112, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingVertical: 12, paddingHorizontal: 15 },
  sourceText: { fontFamily: 'Inter_600SemiBold', fontSize: 12.5 },
  previewCard: { borderRadius: 23, borderWidth: 1, padding: 7, position: 'relative', marginBottom: 14 },
  previewImage: { width: '100%', aspectRatio: 1, borderRadius: 17 },
  removeButton: { position: 'absolute', right: 16, top: 16, width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  analyzeButton: { borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  analyzeText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  resultCard: { borderWidth: 1, borderRadius: 22, padding: 18, marginTop: 2 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  resultIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  resultTitleCopy: { flex: 1 },
  resultEyebrow: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, marginBottom: 4 },
  resultTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  resultConfidence: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  divider: { height: 1, marginVertical: 17 },
  adviceLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, marginBottom: 7 },
  warningText: { fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 18, marginBottom: 6 },
  adviceText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20 },
  historyButton: { marginTop: 16, borderRadius: 13, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  historyButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  error: { fontFamily: 'Inter_500Medium', fontSize: 12, textAlign: 'center', marginTop: 12 },
  disclaimer: { fontFamily: 'Inter_400Regular', fontSize: 10.5, lineHeight: 16, textAlign: 'center', marginTop: 20, paddingHorizontal: 12 },
});