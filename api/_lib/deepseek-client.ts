const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY not configured');
  return key;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletions(
  messages: Message[],
  model = 'deepseek-chat'
): Promise<string> {
  const res = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err: any = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || `DeepSeek error ${res.status}`);
  }

  const data: any = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}
