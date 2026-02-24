import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, sanitizeInput, validatePrompt } from './_lib/security.js';
import { getClient, resetClient } from './_lib/hunyuan-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);

  if (ensurePost(req, res)) return;

  try {
    const { message, history, systemInstruction } = req.body || {};

    const validation = validatePrompt(message);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Build messages array
    const messages: { Role: string; Content: string }[] = [];

    // System instruction
    const sysPrompt = systemInstruction ||
      '你是一个专业的艺术顾问和油画鉴赏专家。请用优美、专业的中文回答用户关于艺术的问题。';
    messages.push({ Role: 'system', Content: sysPrompt });

    // Sanitized history (last 20 turns)
    if (Array.isArray(history)) {
      history.slice(-20).forEach((h: any) => {
        const role = h.role === 'model' ? 'assistant' : (h.role === 'user' ? 'user' : null);
        if (!role) return;
        const content = Array.isArray(h.parts)
          ? h.parts.map((p: any) => (typeof p.text === 'string' ? sanitizeInput(p.text) : '')).join('')
          : '';
        if (content) messages.push({ Role: role, Content: content });
      });
    }

    // Ensure history starts with user message
    const historyStart = messages.findIndex(m => m.Role !== 'system');
    while (historyStart !== -1 && messages[historyStart]?.Role !== 'user') {
      messages.splice(historyStart, 1);
    }

    messages.push({ Role: 'user', Content: validation.sanitized });

    const client = getClient();
    const response = await client.ChatCompletions({
      Model: 'hunyuan-turbo',
      Messages: messages,
      Stream: false,
    });

    const text = response?.Choices?.[0]?.Message?.Content || '抱歉，我无法回答这个问题。';
    return res.status(200).json({ text, links: [] });

  } catch (error: any) {
    console.error('[chat error]', error?.message || error);
    const msg = error?.message || '';
    const isAuth = msg.includes('AuthFailure') || msg.includes('InvalidCredential');
    const isBad = msg.includes('InvalidParameter') || msg.includes('400');
    if (isAuth) resetClient();
    return res.status(isAuth ? 403 : isBad ? 400 : 500).json({
      error: isAuth ? 'API 密钥已失效，请联系管理员更新密钥。'
           : isBad  ? '请求被拒绝：提示词可能违反了安全策略，请调整后重试。'
           : '服务器内部错误，请稍后重试。',
    });
  }
}
