import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';
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

    // Build location context if provided
    let locationContext = '';
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
        locationContext = ` near coordinates (${lat}, ${lng})`;
      }
    }

    const client = getClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `推荐与"${validation.sanitized}"相关的艺术博物馆${locationContext}。请提供博物馆列表，包含简要介绍。`,
      config: {
        systemInstruction: '你是一个专业的艺术博物馆顾问。请提供详细、准确的博物馆推荐信息，包括博物馆名称、地址、特色馆藏等。',
      },
    });

    const text = response.text || '未找到相关博物馆信息。';

    return res.status(200).json({ text, links: [] });
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
