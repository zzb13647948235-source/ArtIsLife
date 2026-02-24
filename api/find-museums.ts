import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, sanitizeInput, validatePrompt } from './_lib/security.js';
import { getClient } from './_lib/gemini-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);

  if (ensurePost(req, res)) return;

  try {
    const { query, location } = req.body || {};

    const validation = validatePrompt(query);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Validate location if provided
    let validLocation: { latitude: number; longitude: number } | null = null;
    if (location && typeof location === 'object') {
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lng);
      if (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        validLocation = { latitude: lat, longitude: lng };
      }
    }

    const config: any = { tools: [{ googleMaps: {} }] };
    if (validLocation) {
      config.toolConfig = {
        retrievalConfig: { latLng: validLocation },
      };
    }

    const client = getClient();
    const response = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Recommend art museums related to: ${validation.sanitized}. Provide a list with brief descriptions.`,
      config,
    });

    const text = response.text || 'No results found.';
    const links: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({
            title: sanitizeInput(chunk.web.title),
            url: chunk.web.uri,
            source: 'Web',
          });
        }
        if (chunk.maps?.uri && chunk.maps?.title) {
          links.push({
            title: sanitizeInput(chunk.maps.title),
            url: chunk.maps.uri,
            source: 'Google Maps',
          });
        }
      }
    }

    return res.status(200).json({ text, links: links.slice(0, 15) });
  } catch (error: any) {
    console.error('[find-museums error]', error?.message || error);
    const is400 =
      error.message?.includes('400') ||
      error.message?.includes('INVALID_ARGUMENT');
    return res.status(is400 ? 400 : 500).json({
      error: is400
        ? '请求被拒绝：查询可能违反了安全策略，请调整后重试。'
        : '服务器内部错误，请稍后重试。',
    });
  }
}
