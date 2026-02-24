import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';
import { getClient, resetClient } from './_lib/hunyuan-client.js';

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

    const enhancedPrompt = `${validation.sanitized}，油画风格，大师级作品，精细笔触，丰富色彩，高质量艺术创作`;

    const client = getClient();
    const response = await client.TextToImageLite({
      Prompt: enhancedPrompt,
      NegativePrompt: 'low quality, blurry, distorted, ugly, watermark',
      Styles: ['201'],
      ResultConfig: { Resolution: '1024:1024' },
      LogoAdd: 0,
      RspImgType: 'base64',
    });

    if (!response?.ResultImage) {
      return res.status(500).json({ error: '图片生成失败，请重试' });
    }

    return res.status(200).json({
      imageUrl: `data:image/png;base64,${response.ResultImage}`,
    });

  } catch (error: any) {
    console.error('[generate-image error]', error?.message || error);
    const msg = error?.message || '';
    const isAuth = msg.includes('AuthFailure') || msg.includes('InvalidCredential');
    const isBad = msg.includes('InvalidParameter') || msg.includes('400');
    if (isAuth) resetClient();
    return res.status(isAuth ? 403 : isBad ? 400 : 500).json({
      error: isAuth ? 'API 密钥已失效，请联系管理员更新密钥。'
           : isBad  ? '提示词不符合要求，请修改后重试'
           : '图片生成服务暂时不可用，请稍后重试',
      _debug: msg,
    });
  }
}
