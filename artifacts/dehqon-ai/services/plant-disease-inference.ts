import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { getAiServerOrigins } from './ai-server';

export type OfflineDiagnosis = {
  plant: string;
  disease: string;
  confidence: number;
  advice: string;
  warning?: string;
};

type ModelServerResponse = {
  plant?: string;
  disease?: string;
  confidence?: number;
  advice?: string;
  reliable?: boolean;
  error?: string;
  top_predictions?: Array<{ label?: string; confidence?: number }>;
};

function getModelServerUrls(): string[] {
  return getAiServerOrigins().map((origin) => `${origin}/predict`);
}

const REQUEST_TIMEOUT_MS = 60000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server javob bermadi (vaqt tugadi)')), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

async function postImage(url: string, imageUri: string): Promise<{ status: number; body: string }> {
  if (Platform.OS === 'web') {
    const imageResponse = await fetch(imageUri);
    const bytes = new Uint8Array(await imageResponse.arrayBuffer());
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: bytes,
    });
    return { status: response.status, body: await response.text() };
  }
  // Android/iOS: faylni to'g'ridan-to'g'ri binary sifatida yuboradi (Blob/ArrayBuffer muammosiz).
  const result = await FileSystem.uploadAsync(url, imageUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
  return { status: result.status, body: result.body };
}

async function predictViaModelServer(imageUri: string): Promise<OfflineDiagnosis> {
  const urls = getModelServerUrls();
  const errors: string[] = [];

  for (const url of urls) {
    try {
      const { status, body } = await withTimeout(postImage(url, imageUri), REQUEST_TIMEOUT_MS);
      if (status < 200 || status >= 300) {
        errors.push(`${url}: ${status} ${body || 'unknown error'}`);
        continue;
      }

      const data = JSON.parse(body) as ModelServerResponse;
      if (data.error) {
        errors.push(`${url}: ${data.error}`);
        continue;
      }

      const plant = data.plant || 'Aniqlanmadi';
      const disease = data.disease || 'Ishonchsiz natija';
      const confidence = Number(data.confidence ?? 0);
      const advice = data.advice || 'Rasmni qayta tekshiring.';
      const warning = data.reliable === false ? 'AI natijasi ishonchsiz, rasmdagi belgilarni yana tekshiring.' : undefined;

      return { plant, disease, confidence, advice, warning };
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : 'noma’lum xato'}`);
    }
  }

  throw new Error(
    `AI serverga ulanib bo‘lmadi. Ishga tushirilgan Python model serverini tekshiring. ${errors.join(' | ')}`,
  );
}

export function usePlantDiseaseInference() {
  const predict = async (imageUri: string): Promise<OfflineDiagnosis> => {
    try {
      return await predictViaModelServer(imageUri);
    } catch (serverError) {
      const message = serverError instanceof Error ? serverError.message : 'AI server ishlamayapti.';
      throw new Error(`Internetdagi AI server orqali tahlil bajarilmadi. ${message}`);
    }
  };

  return { predict, isModelLoading: false, modelError: null };
}