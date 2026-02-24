import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';
import { getClient } from './_lib/gemini-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);

  if (ensurePost(req, res)) return;

  try {
    const validation = validatePrompt(req.body?.prompt);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const client = getClient();

    // Generate detailed art description using Gemini
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `作为一位专业的艺术评论家，请为以下主题创作一段详细的油画作品描述。
描述应该包括：画面构图、色彩运用、光影效果、艺术风格、情感表达等方面。
让读者能够在脑海中清晰地想象出这幅画作。

主题：${validation.sanitized}

请用优美的中文描述这幅想象中的油画作品：`,
      config: {
        systemInstruction: '你是一位资深的艺术评论家和油画鉴赏专家，擅长用生动优美的语言描述艺术作品。',
      },
    });

    const description = response.text || '无法生成描述。';

    return res.status(200).json({
      text: description,
      message: '图片生成服务暂时不可用，以下是AI为您生成的画作描述：',
    });
  } catch (error: any) {
    console.error('[generate-image error]', error?.message || error);
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
