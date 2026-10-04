import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/DehqonUI';
import { useColors } from '@/hooks/useColors';
import { useWeather } from '@/hooks/useWeather';
import { WeatherForecastDay } from '@/services/weather';

const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

function weatherIcon(code: number) {
  if (code === 0) return 'weather-sunny';
  if (code <= 3) return code === 1 ? 'weather-partly-cloudy' : 'weather-cloudy';
  if (code <= 48) return 'weather-fog';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'weather-rainy';
  if (code <= 77) return 'weather-snowy';
  return 'weather-lightning-rainy';
}

function weatherLabel(code: number) {
  if (code === 0) return 'Ochiq havo';
  if (code <= 2) return 'Biroz bulutli';
  if (code === 3) return 'Bulutli';
  if (code <= 48) return 'Tumanli';
  if (code <= 57) return 'Mayda yomg‘ir';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'Yomg‘irli';
  if (code <= 77) return 'Qorli';
  return 'Momaqaldiroq';
}

function formatForecastDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return `${parsed.getDate()} ${parsed.toLocaleDateString('uz-UZ', { month: 'short' })}`;
}

function forecastDay(day: WeatherForecastDay, index: number) {
  if (index === 0) return 'Bugun';
  if (index === 1) return 'Ertaga';
  return dayNames[new Date(`${day.date}T12:00:00`).getDay()];
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function WeatherScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { weather, isLoading, isRefreshing, error, isCached, refresh } = useWeather();

  const current = weather?.current;
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top, 18), paddingBottom: insets.bottom + 30 }]}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Ob-havo" subtitle="Navoiy viloyati, Karmana" />
      {isLoading && !weather ? (
        <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Jonli ob-havo yuklanmoqda...</Text>
        </View>
      ) : weather && current ? (
        <>
          <View style={[styles.currentCard, { backgroundColor: colors.primary }]}>
            <View>
              <Text style={styles.currentLabel}>HOZIR</Text>
              <Text style={styles.currentTemp}>{Math.round(current.temperature)}°</Text>
              <Text style={styles.currentDescription}>{weatherLabel(current.weatherCode)} · His qilinishi {Math.round(current.feelsLike)}°</Text>
            </View>
            <MaterialCommunityIcons name={weatherIcon(current.weatherCode) as 'weather-sunny'} size={74} color={colors.accent} />
          </View>
          <View style={[styles.metaRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.metaItem}><Feather name="wind" size={17} color={colors.primary} /><Text style={[styles.metaValue, { color: colors.foreground }]}>{Math.round(current.windSpeed)} km/soat</Text><Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Shamol</Text></View>
            <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metaItem}><Feather name="droplet" size={17} color={colors.primary} /><Text style={[styles.metaValue, { color: colors.foreground }]}>{Math.round(current.humidity)}%</Text><Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Namlik</Text></View>
            <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metaItem}><Feather name="cloud-rain" size={17} color={colors.primary} /><Text style={[styles.metaValue, { color: colors.foreground }]}>{current.precipitation.toFixed(1)} mm</Text><Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Yog‘in</Text></View>
          </View>
          <View style={[styles.sourceRow, { borderColor: colors.border }]}>
            <View style={[styles.statusDot, { backgroundColor: isCached ? colors.warning : colors.success }]} />
            <Text style={[styles.sourceText, { color: colors.mutedForeground }]}>{isCached ? 'Internet yo‘q · saqlangan ma’lumot' : `Manba: ${weather.source}`}</Text>
            <Text style={[styles.updatedText, { color: colors.mutedForeground }]}>{formatUpdatedAt(weather.updatedAt)}</Text>
          </View>
          {error && <Text style={[styles.errorText, { color: colors.warning }]}>{error}</Text>}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>3 kunlik prognoz</Text>
          {weather.forecast.map((item, index) => (
            <View key={item.date} style={[styles.forecastRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.dateCopy}><Text style={[styles.day, { color: colors.foreground }]}>{forecastDay(item, index)}</Text><Text style={[styles.date, { color: colors.mutedForeground }]}>{formatForecastDate(item.date)}</Text></View>
              <MaterialCommunityIcons name={weatherIcon(item.weatherCode) as 'weather-sunny'} size={27} color={index === 0 ? colors.warning : colors.primary} />
              <Text style={[styles.forecastLabel, { color: colors.mutedForeground }]}>{weatherLabel(item.weatherCode)}</Text>
              <View style={styles.tempCopy}><Text style={[styles.high, { color: colors.foreground }]}>{Math.round(item.high)}°</Text><Text style={[styles.low, { color: colors.mutedForeground }]}>{Math.round(item.low)}°</Text></View>
              <Text style={[styles.rain, { color: colors.primary }]}>{Math.round(item.rainProbability)}%</Text>
            </View>
          ))}
          <Pressable style={[styles.tipCard, { backgroundColor: colors.warningSoft }]}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color={colors.warning} />
            <View style={{ flex: 1 }}><Text style={[styles.tipTitle, { color: colors.foreground }]}>Bugungi maslahat</Text><Text style={[styles.tipText, { color: colors.secondaryForeground }]}>{current.precipitation > 0 || weather.forecast[0].rainProbability >= 60 ? 'Yomg‘ir ehtimoli yuqori. Sug‘orishni kamaytiring yoki keyinga qoldiring.' : current.temperature >= 32 ? 'Havo issiq. Sug‘orishni quyosh botgandan keyin amalga oshiring.' : 'Sug‘orishni quyosh botgandan keyin amalga oshiring.'}</Text></View>
          </Pressable>
        </>
      ) : (
        <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="cloud-alert-outline" size={28} color={colors.warning} />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>Ob-havo ma’lumoti olinmadi</Text>
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Internetni tekshirib, qayta urinib ko‘ring.</Text>
          <Pressable onPress={refresh} style={[styles.retryButton, { backgroundColor: colors.primary }]}><Text style={{ color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 12 }}>Qayta urinish</Text></Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  loadingCard: { minHeight: 150, borderWidth: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  currentCard: { borderRadius: 23, padding: 20, minHeight: 175, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  currentLabel: { color: '#d9efd9', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  currentTemp: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 55, lineHeight: 64, letterSpacing: -2 },
  currentDescription: { color: '#d9efd9', fontFamily: 'Inter_400Regular', fontSize: 11 },
  metaRow: { borderWidth: 1, borderRadius: 18, padding: 12, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: -1 },
  metaItem: { alignItems: 'center', gap: 5, flex: 1 },
  metaValue: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  metaLabel: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  metaDivider: { width: 1, height: 36 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, borderBottomWidth: 1, paddingBottom: 12 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  sourceText: { fontFamily: 'Inter_400Regular', fontSize: 10, flex: 1 },
  updatedText: { fontFamily: 'Inter_400Regular', fontSize: 10, textAlign: 'right' },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: 8 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 28, marginBottom: 12 },
  forecastRow: { borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  dateCopy: { width: 73 },
  day: { fontFamily: 'Inter_600SemiBold', fontSize: 12.5 },
  date: { fontFamily: 'Inter_400Regular', fontSize: 10.5, marginTop: 3 },
  forecastLabel: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11 },
  tempCopy: { flexDirection: 'row', gap: 3, alignItems: 'baseline' },
  high: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  low: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  rain: { fontFamily: 'Inter_600SemiBold', fontSize: 11, width: 30, textAlign: 'right' },
  tipCard: { marginTop: 15, padding: 15, borderRadius: 17, flexDirection: 'row', gap: 11, alignItems: 'center' },
  tipTitle: { fontFamily: 'Inter_700Bold', fontSize: 13, marginBottom: 4 },
  tipText: { fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 17 },
  errorCard: { borderWidth: 1, borderRadius: 20, padding: 22, alignItems: 'center', gap: 9 },
  errorTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  retryButton: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 13, marginTop: 5 },
});