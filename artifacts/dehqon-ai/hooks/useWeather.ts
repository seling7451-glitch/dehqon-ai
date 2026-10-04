import { useCallback, useEffect, useState } from 'react';
import { fetchWeather, readWeatherCache, WeatherData } from '@/services/weather';

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (background = false) => {
    if (background) setIsRefreshing(true);
    try {
      const freshWeather = await fetchWeather();
      setWeather(freshWeather);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Ob-havo yangilanmadi.');
    } finally {
      setIsLoading(false);
      if (background) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const cachedWeather = await readWeatherCache();
      if (active && cachedWeather) {
        setWeather(cachedWeather);
        setIsLoading(false);
      }
      await refresh();
    };

    void load();
    const interval = setInterval(() => void refresh(true), REFRESH_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [refresh]);

  return {
    weather,
    isLoading,
    isRefreshing,
    error,
    isCached: Boolean(weather && error),
    refresh: () => refresh(true),
  };
}