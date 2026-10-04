import { Platform } from 'react-native';

const configuredOrigin = process.env.EXPO_PUBLIC_MODEL_API_URL?.trim().replace(/\/+$/, '');

export function getAiServerOrigins(): string[] {
  const origins = new Set<string>();
  if (configuredOrigin) origins.add(configuredOrigin);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    origins.add(`${window.location.protocol}//${window.location.hostname}:8000`);
  } else if (Platform.OS === 'android') {
    origins.add('http://10.0.2.2:8000');
  }

  origins.add('http://localhost:8000');
  origins.add('http://127.0.0.1:8000');
  return [...origins];
}