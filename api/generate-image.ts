import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';
import { getGenAI } from './_lib/gemini-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);

  if (ensurePost(req, res)) return;

  try {
    const validation = validatePrompt(req.body?.prompt);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `Generate a high quality oil painting style artwork: ${validation.sanitized}` }],
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    } as any);

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
      for (const part of parts) {
        if ((part as any).inlineData?.data) {
          const inlineData = (part as any).inlineData;
          const mimeType = inlineData.mimeType || 'image/png';
          if (!['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
            return res.status(500).json({ error: '不支持的图片格式' });
          }
          return res.status(200).json({
            imageData: `data:${mimeType};base64,${inlineData.data}`,
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
