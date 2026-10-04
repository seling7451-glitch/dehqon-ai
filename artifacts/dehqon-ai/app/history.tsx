import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyHistory, HistoryRow, ScreenHeader } from '@/components/DehqonUI';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history, clearHistory } = useApp();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 18), paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}><ScreenHeader title="Tahlil tarixi" subtitle={`${history.length} ta natija saqlangan`} back /><Pressable testID="clear-history" accessibilityLabel="Tarixni tozalash" onPress={clearHistory} disabled={!history.length} style={{ opacity: history.length ? 1 : 0.3 }}><Feather name="trash-2" size={19} color={colors.destructive} /></Pressable></View>
      {history.length ? history.map((record) => <HistoryRow key={record.id} record={record} />) : <EmptyHistory />}
      <Pressable onPress={() => router.push('/scan')} style={[styles.scanButton, { backgroundColor: colors.primary }]}><Feather name="camera" size={17} color={colors.primaryForeground} /><Text style={[styles.scanButtonText, { color: colors.primaryForeground }]}>Yangi tahlil</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scanButton: { borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, marginTop: 16 },
  scanButtonText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
});