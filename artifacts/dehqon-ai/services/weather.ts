import AsyncStorage from '@react-native-async-storage/async-storage';

export const WEATHER_LOCATION = 'Navoiy viloyati, Karmana';
export const WEATHER_SOURCE = 'Open-Meteo';

const LATITUDE = 40.1289;
const LONGITUDE = 65.3547;
const WEATHER_CACHE_KEY = '@dehqon-ai/weather';
const API_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
  '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max' +
  '&timezone=Asia%2FTashkent&forecast_days=3';

export type WeatherForecastDay = {
  date: string;
  weatherCode: number;
  high: number;
  low: number;
  rainProbability: number;
  precipitation: number;
  windSpeed: number;
};

export type WeatherData = {
  location: string;
  source: string;
  updatedAt: string;
  current: {
    temperature: number;
    feelsLike: number;
    windSpeed: number;
    humidity: number;
    precipitation: number;
    weatherCode: number;
  };
  forecast: WeatherForecastDay[];
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isWeatherData(value: unknown): value is WeatherData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<WeatherData>;
  return (
    data.location === WEATHER_LOCATION &&
    data.source === WEATHER_SOURCE &&
    typeof data.updatedAt === 'string' &&
    Boolean(data.current) &&
    isFiniteNumber(data.current?.temperature) &&
    isFiniteNumber(data.current?.feelsLike) &&
    isFiniteNumber(data.current?.windSpeed) &&
    isFiniteNumber(data.current?.humidity) &&
    isFiniteNumber(data.current?.precipitation) &&
    isFiniteNumber(data.current?.weatherCode) &&
    Array.isArray(data.forecast) &&
    data.forecast.length === 3 &&
    data.forecast.every(
      (day) =>
        Boolean(day) &&
        typeof day.date === 'string' &&
        isFiniteNumber(day.weatherCode) &&
        isFiniteNumber(day.high) &&
        isFiniteNumber(day.low) &&
        isFiniteNumber(day.rainProbability) &&
        isFiniteNumber(day.precipitation) &&
        isFiniteNumber(day.windSpeed),
    )
  );
}

function numberAt(values: unknown, index: number, name: string) {
  if (!Array.isArray(values) || !isFiniteNumber(values[index])) {
    throw new Error(`Ob-havo API javobida ${name} ma'lumoti topilmadi.`);
  }
  return values[index];
}

function numberValue(value: unknown, name: string) {
  if (!isFiniteNumber(value)) {
    throw new Error(`Ob-havo API javobida ${name} ma'lumoti topilmadi.`);
  }
  return value;
}

function toWeatherData(payload: unknown): WeatherData {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Ob-havo API noto‘g‘ri javob qaytardi.');
  }

  const response = payload as {
    current?: Record<string, unknown>;
    daily?: Record<string, unknown>;
  };
  const current = response.current;
  const daily = response.daily;
  if (!current || !daily) {
    throw new Error('Ob-havo API javobida kunlik ma’lumot yo‘q.');
  }

  const dates = daily.time;
  if (!Array.isArray(dates) || dates.length < 3) {
    throw new Error('3 kunlik prognoz ma’lumoti topilmadi.');
  }

  return {
    location: WEATHER_LOCATION,
    source: WEATHER_SOURCE,
    updatedAt: new Date().toISOString(),
    current: {
      temperature: numberValue(current.temperature_2m, 'harorat'),
      feelsLike: numberValue(current.apparent_temperature, 'his qilinadigan harorat'),
      windSpeed: numberValue(current.wind_speed_10m, 'shamol'),
      humidity: numberValue(current.relative_humidity_2m, 'namlik'),
      precipitation: numberValue(current.precipitation, 'yog‘ingarchilik'),
      weatherCode: numberValue(current.weather_code, 'ob-havo kodi'),
    },
    forecast: dates.slice(0, 3).map((date, index) => ({
      date: typeof date === 'string' ? date : '',
      weatherCode: numberAt(daily.weather_code, index, 'ob-havo kodi'),
      high: numberAt(daily.temperature_2m_max, index, 'yuqori harorat'),
      low: numberAt(daily.temperature_2m_min, index, 'past harorat'),
      rainProbability: numberAt(daily.precipitation_probability_max, index, 'yomg‘ir ehtimoli'),
      precipitation: numberAt(daily.precipitation_sum, index, 'yog‘ingarchilik miqdori'),
      windSpeed: numberAt(daily.wind_speed_10m_max, index, 'shamol'),
    })),
  };
}

export async function readWeatherCache() {
  try {
    const stored = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return isWeatherData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function fetchWeather(): Promise<WeatherData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(API_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Ob-havo xizmati ${response.status} xatolik qaytardi.`);
    }
    const data = toWeatherData(await response.json());
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Ob-havo xizmatiga ulanish vaqti tugadi.');
    }
    throw error instanceof Error ? error : new Error('Ob-havo ma’lumotini olish imkoni bo‘lmadi.');
  } finally {
    clearTimeout(timeout);
  }
}