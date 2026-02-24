import { GroundingLink } from '../types';

interface ChatHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatResponse {
  text: string;
  links: GroundingLink[];
}

interface MuseumResponse {
  text: string;
  links: GroundingLink[];
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `图片生成失败 (${response.status})`);
  }

  const data = await response.json();
  if (!data.imageUrl) {
    throw new Error('未返回有效的图片数据');
  }
  return data.imageUrl;
}

export async function chatWithArtExpert(
  message: string,
  history: ChatHistory[],
  systemInstruction: string
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, systemInstruction }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `对话请求失败 (${response.status})`);
  }

  return response.json();
}

export async function findMuseums(
  query: string,
  location?: { lat: number; lng: number }
): Promise<MuseumResponse> {
  const response = await fetch('/api/find-museums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, location }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `博物馆查询失败 (${response.status})`);
  }

  return response.json();
}
