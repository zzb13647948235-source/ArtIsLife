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
    const response = await client.models.generateImages({
      model: 'imagen-3.0-fast-generate-001',
      prompt: `High quality oil painting style artwork: ${validation.sanitized}`,
      config: {
        numberOfImages: 1,
      },
    });

    const images = response.generatedImages;
    if (images && images.length > 0 && images[0].image?.imageBytes) {
      return res.status(200).json({
        imageData: `data:image/png;base64,${images[0].image.imageBytes}`,
      });
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
