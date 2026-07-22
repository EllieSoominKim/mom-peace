import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'web' ? 'http://localhost:8000' : 'http://172.30.1.85:8000';
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    throw new ApiError(0, '서버에 연결할 수 없어요. 백엔드가 켜져 있는지, IP가 맞는지 확인해주세요.');
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