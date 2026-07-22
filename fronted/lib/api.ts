import { Platform } from 'react-native';

/**
 * 백엔드 서버 주소.
 *
 * - 웹(브라우저)에서 테스트할 때는 localhost로 자동 연결됩니다.
 * - 휴대폰 Expo Go에서 테스트할 때는 컴퓨터의 LAN IP로 직접 바꿔줘야 해요.
 *   (PowerShell에서 `ipconfig` 실행 → IPv4 주소 확인 후 아래 값 교체)
 */
export const API_BASE_URL =
  Platform.OS === 'web' ? 'http://localhost:8000' : 'http://192.168.35.41:8000';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25초 타임아웃 (영양성분표 이미지 분석은 시간이 더 걸릴 수 있음)

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new ApiError(0, '서버 응답이 너무 오래 걸려요. 백엔드가 켜져 있는지, IP가 맞는지 확인해주세요.');
    }
    throw new ApiError(0, '서버에 연결할 수 없어요. 백엔드가 켜져 있는지, IP가 맞는지 확인해주세요.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.detail ?? `요청이 실패했어요 (${res.status})`);
  }
  return res.json();
}

// ---- 스캔 ----

export type RiskLevel = 'safe' | 'caution' | 'danger';
export type NutrientTone = 'safe' | 'caution' | 'alert';

export type NutrientItem = { label: string; value: string; tone: NutrientTone; statusLabel: string };
export type AlternativeItem = { id: string; name: string; reason: string; level: RiskLevel };

export type ScanResult = {
  productName: string;
  barcode: string;
  scannedAt: string;
  level: RiskLevel;
  message: string;
  nutrients: NutrientItem[];
  alternatives: AlternativeItem[];
};

export function analyzeScan(barcode: string, pregnancyWeek?: number): Promise<ScanResult> {
  return request<ScanResult>('/scan/analyze', {
    method: 'POST',
    body: JSON.stringify({ barcode, pregnancyWeek }),
  });
}

// ---- 챗봇 ----

export function sendChatMessage(
  message: string,
  pregnancyWeek?: number,
  context?: string
): Promise<{ reply: string }> {
  return request<{ reply: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, pregnancyWeek, context }),
  });
}

// ---- 영양성분표 OCR ----

export type NutritionOcrResult = {
  productName: string;
  totalContent: number;
  kcal: number;
  carbG: number;
  sugarG: number;
  sodiumMg: number;
  fatG: number;
  proteinG: number;
};

export function analyzeNutritionLabel(imageBase64: string, mimeType = 'image/jpeg'): Promise<NutritionOcrResult> {
  return request<NutritionOcrResult>('/nutrition/ocr', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, mimeType }),
  });
}

// ---- 오늘의 카페인 (카페 메뉴 검색) ----

export type CafeMenuItem = {
  id: string;
  brand: string | null;
  name: string;
  isGeneric: boolean;
  caffeineMg: number;
  sugarG: number;
  carbG: number;
  kcal: number;
};

export function searchCafeMenu(query: string): Promise<{ query: string; results: CafeMenuItem[] }> {
  return request(`/nutrition/cafe-search?q=${encodeURIComponent(query)}`);
}