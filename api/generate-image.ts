import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';
import { generateImage } from './_lib/siliconflow-client.js';

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

    const enhancedPrompt = `${validation.sanitized}，oil painting style, masterpiece, fine brushwork, rich colors, high quality art`;

    const imageUrl = await generateImage(enhancedPrompt);
    return res.status(200).json({ imageUrl });

  } catch (error: any) {
    console.error('[generate-image error]', error?.message || error);
    const msg = error?.message || '';
    const isAuth = msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API key');
    const isBad = msg.includes('400') || msg.includes('invalid');
    return res.status(isAuth ? 403 : isBad ? 400 : 500).json({
      error: isAuth ? 'API 密钥已失效，请联系管理员更新密钥。'
           : isBad  ? '提示词不符合要求，请修改后重试'
           : '图片生成服务暂时不可用，请稍后重试',
    });
  }
}
