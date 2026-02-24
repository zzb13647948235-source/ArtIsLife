const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1';

function getApiKey(): string {
  const key = process.env.SILICONFLOW_API_KEY;
  if (!key) throw new Error('SILICONFLOW_API_KEY not configured');
  return key;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletions(messages: Message[], model = 'Qwen/Qwen3-8B'): Promise<string> {
  const res = await fetch(`${SILICONFLOW_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!res.ok) {
    const err: any = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || `SiliconFlow error ${res.status}`);
  }

  const data: any = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

export async function generateImage(prompt: string, model = 'black-forest-labs/FLUX.1-schnell'): Promise<string> {
  const res = await fetch(`${SILICONFLOW_API_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      image_size: '1024x1024',
      num_inference_steps: 20,
    }),
  });

  if (!res.ok) {
    const err: any = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || `图片生成失败 ${res.status}`);
  }

  const data: any = await res.json();
  const url = data?.images?.[0]?.url;
  if (!url) throw new Error('未返回有效图片');
  return url;
}
