
import { GroundingLink } from "../types";

/**
 * Helper: Call backend API proxy endpoints.
 * All Gemini API calls are routed through the Vite dev server middleware,
 * so the API key is never exposed to the frontend.
 */
const apiCall = async (endpoint: string, body: Record<string, any>): Promise<any> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `请求失败 (${response.status})`);
  }

  return data;
};

/**
 * Generate an image using Gemini (via backend proxy)
 */
export const generateArtImage = async (prompt: string): Promise<string> => {
  try {
    const data = await apiCall('/api/generate-image', { prompt });
    return data.imageData;
  } catch (error: any) {
    console.error("Image generation error:", error);
    throw error;
  }
};

/**
 * Chat with Art Expert — Gemini + Search Grounding (via backend proxy)
 */
export const chatWithArtExpert = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  systemInstruction?: string
): Promise<{ text: string; links: GroundingLink[] }> => {
  try {
    const data = await apiCall('/api/chat', { message, history, systemInstruction });
    return { text: data.text, links: data.links || [] };
  } catch (error: any) {
    console.error("Chat error:", error);
    throw error;
  }
};

/**
 * Find museums — Gemini + Maps Grounding (via backend proxy)
 */
export const findMuseums = async (
  query: string,
  location?: { lat: number; lng: number }
): Promise<{ text: string; links: GroundingLink[] }> => {
  try {
    const data = await apiCall('/api/find-museums', { query, location });
    return { text: data.text, links: data.links || [] };
  } catch (error: any) {
    console.error("Museum search error:", error);
    throw error;
  }
};
