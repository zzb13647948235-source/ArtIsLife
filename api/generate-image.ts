import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';
import { getClient } from './_lib/gemini-client.js';

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
      model: 'gemini-2.0-flash-exp',
      contents: enhancedPrompt,
      config: { responseModalities: ['IMAGE'] } as any,
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
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[generate-image error]', msg);
    const is400 = msg.includes('400') || msg.includes('INVALID_ARGUMENT');
    return res.status(is400 ? 400 : 500).json({
      error: is400 ? '提示词不符合要求，请修改后重试' : '图片生成服务暂时不可用，请稍后重试',
    });
  }
}
