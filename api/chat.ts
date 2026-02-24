import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, sanitizeInput, validatePrompt } from './_lib/security.js';
import { getClient } from './_lib/gemini-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);

  if (ensurePost(req, res)) return;

  try {
    const { message, history, systemInstruction } = req.body || {};

    // Validate message
    const validation = validatePrompt(message);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Sanitize history
    const sanitizedHistory = Array.isArray(history)
      ? history.slice(-20).map((h: any) => ({
          role: h.role === 'user' || h.role === 'model' ? h.role : 'user',
          parts: Array.isArray(h.parts)
            ? h.parts.map((p: any) => ({
                text: typeof p.text === 'string' ? sanitizeInput(p.text) : '',
              }))
            : [],
        }))
      : [];

    const client = getClient();
    const chatContents =
      sanitizedHistory.length > 0
        ? [...sanitizedHistory, { role: 'user', parts: [{ text: validation.sanitized }] }]
        : validation.sanitized;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatContents,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction:
          systemInstruction ||
          '你是一个专业的艺术顾问和油画鉴赏专家。请用优美、专业的中文回答用户关于艺术的问题。如果涉及事实性信息，请利用搜索工具获取最新资讯。',
      },
    });

    const text = response.text || '抱歉，我无法回答这个问题。';
    const links: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          try {
            const url = new URL(chunk.web.uri);
            if (url.protocol === 'https:' || url.protocol === 'http:') {
              links.push({
                title: sanitizeInput(chunk.web.title),
                url: chunk.web.uri,
                source: 'Google Search',
              });
            }
          } catch {}
        }
      }
    }

    return res.status(200).json({ text, links: links.slice(0, 10) });
  } catch (error: any) {
    console.error('[chat error]', error?.message || error);
    const is400 =
      error.message?.includes('400') ||
      error.message?.includes('INVALID_ARGUMENT');
    return res.status(is400 ? 400 : 500).json({
      error: is400
        ? '请求被拒绝：提示词可能违反了安全策略，请调整后重试。'
        : '服务器内部错误，请稍后重试。',
    });
  }
}
