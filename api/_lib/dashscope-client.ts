const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
const DASHSCOPE_TASK_URL = 'https://dashscope.aliyuncs.com/api/v1/tasks';

function getApiKey(): string {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) throw new Error('DASHSCOPE_API_KEY not configured');
  return key;
}

export async function generateImage(
  prompt: string,
  model = 'wanx2.1-t2i-turbo',
  size: string = '1024*1024'
): Promise<string> {
  // 提交异步任务（该 key 不支持同步调用）
  const res = await fetch(DASHSCOPE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiKey()}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model,
      input: { prompt },
      parameters: { size, n: 1 },
    }),
  });

  if (!res.ok) {
    const err: any = await res.json().catch(() => ({}));
    throw new Error(err?.message || `DashScope error ${res.status}`);
  }

  const data: any = await res.json();
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error('未返回任务ID');

  return pollTaskResult(taskId);
}

async function pollTaskResult(taskId: string, maxAttempts = 40): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const res = await fetch(`${DASHSCOPE_TASK_URL}/${taskId}`, {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    });

    if (!res.ok) continue;

    const data: any = await res.json();
    if (data.output?.task_status === 'SUCCEEDED' && data.output?.results?.[0]?.url) {
      return data.output.results[0].url;
    }
    if (data.output?.task_status === 'FAILED') {
      throw new Error(data.output?.message || '图片生成失败');
    }
  }

  throw new Error('图片生成超时，请稍后重试');
}
