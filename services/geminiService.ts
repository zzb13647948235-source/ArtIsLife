import { GoogleGenerativeAI } from '@google/generative-ai'; 
  
 // 获取前端环境变量中的 API Key (适配 Vite 环境变量) 
 const getApiKey = () => { 
   if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) { 
     return import.meta.env.VITE_GEMINI_API_KEY; 
   } 
   return '';  
 };
 
 /**
  * 与艺术专家进行文本对话
  * @param message - The user's message.
  * @param history - The chat history.
  * @param systemInstruction - The system instruction for the model.
  * @returns The model's response.
  */
 export const chatWithArtExpert = async (
   message: string,
   history: any[],
   systemInstruction: string
 ) => {
   if (!API_KEY) {
     console.error('API Key is missing!');
     throw new Error('未检测到 API Key，请检查环境变量配置。');
   }
 
   try {
     const model = genAI.getGenerativeModel({
       model: "gemini-1.5-flash",
       systemInstruction: systemInstruction,
     });
 
     const chat = model.startChat({
       history: history,
       generationConfig: {
         maxOutputTokens: 1000,
       },
     });
 
     const result = await chat.sendMessage(message);
     const response = await result.response;
     const text = response.text();
 
     // A simple check for grounding links, you might need a more robust implementation
     const groundingLinks = text.match(/\[source: (.*?)\]/g) || [];
 
     return { text, links: groundingLinks };
   } catch (error) {
     console.error('chatWithArtExpert 调用失败:', error);
     throw error;
   }
 }; 
  
 const API_KEY = getApiKey(); 
  
 // 导出 genAI 实例供其他文本/对话功能使用 
 export const genAI = new GoogleGenerativeAI(API_KEY); 
  
 /**
 * 调用后端 /api/generate-image 接口生成图片
 * @param prompt - The user's prompt.
 * @param aspectRatio - The desired aspect ratio for the image.
 * @returns The base64 encoded image data URL.
 */
export const generateImage = async (prompt: string): Promise<string> => { 
   try { 
     // 请求我们自己的 Vercel 后端接口，避免前端直接请求 Google 暴露 API Key 及触发 IP 限制 
     const response = await fetch('/api/generate-image', { 
       method: 'POST', 
       headers: { 
         'Content-Type': 'application/json', 
       }, 
       body: JSON.stringify({ prompt }) 
     }); 
 
     if (!response.ok) { 
       const errorData = await response.json().catch(() => ({})); 
       throw new Error(errorData.error || `Failed to generate image: HTTP ${response.status}`); 
     } 
 
     const data = await response.json(); 
     return data.imageUrl; // 获取后端返回的 Base64 图片 
   } catch (error) { 
     console.error('生图请求失败:', error); 
     throw error; 
   } 
 };