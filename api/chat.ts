import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, sanitizeInput, validatePrompt } from './_lib/security.js';
import { getClient, resetClient } from './_lib/gemini-client.js';

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
    let sanitizedHistory = Array.isArray(history)
      ? history.slice(-20).map((h: any) => ({
          role: h.role === 'user' || h.role === 'model' ? h.role : 'user',
          parts: Array.isArray(h.parts)
            ? h.parts.map((p: any) => ({
                text: typeof p.text === 'string' ? sanitizeInput(p.text) : '',
              }))
            : [],
        }))
      : [];

    // Ensure first message is from 'user' role
    while (sanitizedHistory.length > 0 && sanitizedHistory[0].role !== 'user') {
      sanitizedHistory.shift();
    }

    const client = getClient();
    const chatContents =
      sanitizedHistory.length > 0
        ? [...sanitizedHistory, { role: 'user', parts: [{ text: validation.sanitized }] }]
        : validation.sanitized;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatContents,
      config: {
        systemInstruction:
          systemInstruction ||
          '你是一个专业的艺术顾问和油画鉴赏专家。请用优美、专业的中文回答用户关于艺术的问题。',
      },
    });

    const text = response.text || '抱歉，我无法回答这个问题。';

    return res.status(200).json({ text, links: [] });
  } catch (error: any) {
    console.error('[chat error]', error?.message || error);
    const msg = error?.message || '';
    const is403 = msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('leaked');
    const is400 = msg.includes('400') || msg.includes('INVALID_ARGUMENT');
    if (is403) resetClient();
    return res.status(is403 ? 403 : is400 ? 400 : 500).json({
      error: is403 ? 'API 密钥已失效，请联系管理员更新密钥。'
           : is400 ? '请求被拒绝：提示词可能违反了安全策略，请调整后重试。'
           : '服务器内部错误，请稍后重试。',
    });
  }
}
