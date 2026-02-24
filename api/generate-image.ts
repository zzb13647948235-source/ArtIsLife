import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';
import { getClient, resetClient } from './_lib/gemini-client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (ensurePost(req, res)) return;

  try {
    const { prompt } = req.body || {};
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const enhancedPrompt = `${validation.sanitized}, masterpiece, best quality, highly detailed artwork, fine art painting`;
    const client = getClient();

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: enhancedPrompt,
      config: { responseModalities: ['TEXT', 'IMAGE'] } as any,
    });

    const parts: any[] = (response as any).candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);

    if (!imagePart?.inlineData) {
      return res.status(500).json({ error: '图片生成失败，请重试' });
    }

    return res.status(200).json({
      imageUrl: `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[generate-image error]', JSON.stringify(error));
    const is403 = msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('leaked');
    const is400 = msg.includes('400') || msg.includes('INVALID_ARGUMENT');
    const is404 = msg.includes('404') || msg.includes('NOT_FOUND');
    if (is403) resetClient();
    return res.status(is403 ? 403 : is400 ? 400 : 500).json({
      error: is403 ? 'API 密钥已失效，请联系管理员更新密钥。'
           : is400 ? '提示词不符合要求，请修改后重试'
           : is404 ? '图像生成模型暂时不可用，请稍后重试'
           : '图片生成服务暂时不可用，请稍后重试',
      _debug: msg,
    });
  }
}
