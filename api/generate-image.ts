import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);

  if (ensurePost(req, res)) return;

  try {
    const validation = validatePrompt(req.body?.prompt);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Use Imagen 3 REST API directly
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: `High quality oil painting style artwork: ${validation.sanitized}`,
          },
        ],
        parameters: {
          sampleCount: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-image API error]', response.status, errorText);
      
      if (response.status === 400) {
        return res.status(400).json({
          error: '请求被拒绝：提示词可能违反了安全策略，请调整后重试。',
        });
      }
      return res.status(500).json({
        error: '图片生成服务暂时不可用，请稍后重试。',
      });
    }

    const data = await response.json();
    
    // Extract base64 image from response
    const predictions = data.predictions;
    if (predictions && predictions.length > 0) {
      const imageData = predictions[0].bytesBase64Encoded;
      if (imageData) {
        return res.status(200).json({
          imageData: `data:image/png;base64,${imageData}`,
        });
      }
    }

    return res.status(500).json({
      error: '生成失败：未接收到图片数据。请尝试修改提示词或稍后重试。',
    });
  } catch (error: any) {
    console.error('[generate-image error]', error?.message || error);
    return res.status(500).json({
      error: '服务器内部错误，请稍后重试。',
    });
  }
}
