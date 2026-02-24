import Anthropic from '@anthropic-ai/sdk';

// 1. 获取前端环境变量中的 API Key (适配 Vite 环境变量)
const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLAUDE_API_KEY) {
    return import.meta.env.VITE_CLAUDE_API_KEY;
  }
  return '';
};

const API_KEY = getApiKey();

// 2. 初始化 Anthropic SDK
const anthropic = new Anthropic({
  apiKey: API_KEY || 'dummy_key_to_prevent_crash',
});

/**
 * 与 Claude 模型进行文本对话
 * @param message - The user's message.
 * @param systemInstruction - The system instruction for the model.
 * @returns The model's response.
 */
export const chatWithClaude = async (
  message: string,
  systemInstruction: string
) => {
  if (!API_KEY) {
    console.error('API Key is missing!');
    throw new Error('未检测到 Claude API Key，请检查前端环境变量配置。');
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{ role: "user", content: message }],
      system: systemInstruction,
    });

    const block = response.content[0];
    return { text: block.type === 'text' ? block.text : '' };
  } catch (error) {
    console.error('chatWithClaude 调用失败:', error);
    throw error;
  }
};
