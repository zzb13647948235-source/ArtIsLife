import { GoogleGenAI } from '@google/genai';

let client: GoogleGenAI | null = null;

export function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured');
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export function resetClient(): void {
  client = null;
}
