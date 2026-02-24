import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';
import { getClient, resetClient } from './_lib/hunyuan-client.js';

async function fetchNearbyMuseums(lat: number, lng: number): Promise<string> {
  const mapKey = process.env.TENCENT_MAP_KEY;
  if (!mapKey) return '';
  try {
    const url = `https://apis.map.qq.com/ws/place/v1/search?keyword=艺术博物馆&boundary=nearby(${lat},${lng},5000)&count=5&key=${mapKey}`;
    const r = await fetch(url);
    const data: any = await r.json();
    if (data.status !== 0 || !data.data?.length) return '';
    const list = data.data.map((p: any) => `- ${p.title}（${p.address}）`).join('\n');
    return `\n\n附近真实博物馆（来自腾讯地图）：\n${list}`;
  } catch {
    return '';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applySecurityHeaders(res);

  if (ensurePost(req, res)) return;

  try {
    const { query, location } = req.body || {};

    const validation = validatePrompt(query);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    let locationContext = '';
    let nearbyInfo = '';
    if (location && typeof location === 'object') {
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lng);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        locationContext = ` 用户当前位置坐标为 (${lat}, ${lng})，请优先推荐附近的博物馆。`;
        nearbyInfo = await fetchNearbyMuseums(lat, lng);
      }
    }

    const client = getClient();
    const response = await client.ChatCompletions({
      Model: 'hunyuan-turbo',
      Messages: [
        {
          Role: 'system',
          Content: '你是一个专业的艺术博物馆顾问。请提供详细、准确的博物馆推荐信息，包括博物馆名称、地址、特色馆藏、开放时间等。回答要有条理，使用中文。',
        },
        {
          Role: 'user',
          Content: `推荐与"${validation.sanitized}"相关的艺术博物馆。${locationContext}${nearbyInfo}`,
        },
      ],
      Stream: false,
    });

    const text = response?.Choices?.[0]?.Message?.Content || '未找到相关博物馆信息。';
    return res.status(200).json({ text, links: [] });

  } catch (error: any) {
    console.error('[find-museums error]', error?.message || error);
    const msg = error?.message || '';
    const isAuth = msg.includes('AuthFailure') || msg.includes('InvalidCredential');
    const isBad = msg.includes('InvalidParameter') || msg.includes('400');
    if (isAuth) resetClient();
    return res.status(isAuth ? 403 : isBad ? 400 : 500).json({
      error: isAuth ? 'API 密钥已失效，请联系管理员更新密钥。'
           : isBad  ? '请求被拒绝：查询可能违反了安全策略，请调整后重试。'
           : '服务器内部错误，请稍后重试。',
    });
  }
}
