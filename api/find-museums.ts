import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applySecurityHeaders, ensurePost, validatePrompt } from './_lib/security.js';
import { chatCompletions, Message } from './_lib/siliconflow-client.js';

async function fetchNearbyMuseums(lat: number, lng: number): Promise<string> {
  const mapKey = process.env.AMAP_KEY;
  if (!mapKey) return '';
  try {
    const url = `https://restapi.amap.com/v5/place/around?key=${mapKey}&location=${lng},${lat}&keywords=博物馆|美术馆&radius=5000&limit=5`;
    const r = await fetch(url);
    const data: any = await r.json();
    if (data.status !== '1' || !data.pois?.length) return '';
    const list = data.pois.map((p: any) => `- ${p.name}（${p.address}）`).join('\n');
    return `\n\n附近真实博物馆（来自高德地图）：\n${list}`;
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

    const messages: Message[] = [
      {
        role: 'system',
        content: '你是一个专业的艺术博物馆顾问。请提供详细、准确的博物馆推荐信息，包括博物馆名称、地址、特色馆藏、开放时间等。回答要有条理，使用中文。',
      },
      {
        role: 'user',
        content: `推荐与"${validation.sanitized}"相关的艺术博物馆。${locationContext}${nearbyInfo}`,
      },
    ];

    const text = await chatCompletions(messages);
    return res.status(200).json({ text: text || '未找到相关博物馆信息。', links: [] });

  } catch (error: any) {
    console.error('[find-museums error]', error?.message || error);
    const msg = error?.message || '';
    const isAuth = msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API key');
    const isBad = msg.includes('400') || msg.includes('invalid');
    return res.status(isAuth ? 403 : isBad ? 400 : 500).json({
      error: isAuth ? 'API 密钥已失效，请联系管理员更新密钥。'
           : isBad  ? '请求被拒绝：查询可能违反了安全策略，请调整后重试。'
           : '服务器内部错误，请稍后重试。',
    });
  }
}
