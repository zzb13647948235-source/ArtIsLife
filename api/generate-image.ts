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
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: `请生成一幅高品质油画风格的艺术作品：${validation.sanitized}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          if (!['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
            return res.status(500).json({ error: '不支持的图片格式' });
          }
          return res.status(200).json({
            imageData: `data:${mimeType};base64,${part.inlineData.data}`,
          });
        }
      }
    }

    return res.status(500).json({
      error: '生成失败：未接收到图片数据。请尝试修改提示词或稍后重试。',
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
