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

    // Try to use Gemini's image generation capability
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Create a high quality oil painting style artwork based on this description: ${validation.sanitized}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // Check if we got image data in the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          const inlineData = (part as any).inlineData;
          if (inlineData?.data) {
            const mimeType = inlineData.mimeType || 'image/png';
            return res.status(200).json({
              imageData: `data:${mimeType};base64,${inlineData.data}`,
            });
          }
        }
      }
    }

    // Fallback: generate a placeholder image with text
    // Create a simple SVG placeholder
    const svgPlaceholder = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
        <rect fill="#f5f5f4" width="1024" height="1024"/>
        <text x="512" y="480" font-family="serif" font-size="48" fill="#78716c" text-anchor="middle">🎨</text>
        <text x="512" y="560" font-family="serif" font-size="24" fill="#78716c" text-anchor="middle">图片生成服务暂时不可用</text>
        <text x="512" y="600" font-family="serif" font-size="16" fill="#a8a29e" text-anchor="middle">${validation.sanitized?.slice(0, 50) || ''}</text>
      </svg>
    `;
    const base64Svg = Buffer.from(svgPlaceholder).toString('base64');

    return res.status(200).json({
      imageData: `data:image/svg+xml;base64,${base64Svg}`,
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
