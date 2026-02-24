import { GoogleGenerativeAI } from '@google/generative-ai'; 
  
 // 获取前端环境变量中的 API Key (适配 Vite 环境变量) 
 const getApiKey = () => { 
   if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) { 
     return import.meta.env.VITE_GEMINI_API_KEY; 
   } 
   return '';  
 }; 
  
 const API_KEY = getApiKey(); 
  
 // 导出 genAI 实例供其他文本/对话功能使用 
 export const genAI = new GoogleGenerativeAI(API_KEY); 
  
 /** 
  * 调用 Gemini API 生成图片 
  * 已修复：将模型从 imagen-3.0 升级为 imagen-4.0-generate-001 
  */ 
 export const generateImage = async (prompt: string): Promise<string> => { 
   if (!API_KEY) { 
     console.error('API Key is missing!'); 
     throw new Error('未检测到 API Key，请检查环境变量配置。'); 
   } 
  
   try { 
     // 优化提示词，确保出图质量 
     const enhancedPrompt = `${prompt}, masterpiece, best quality, highly detailed`; 
  
     const response = await fetch( 
       `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`, 
       { 
         method: 'POST', 
         headers: { 
           'Content-Type': 'application/json', 
         }, 
         body: JSON.stringify({ 
           instances: [ 
             { 
               prompt: enhancedPrompt, 
             } 
           ], 
           parameters: { 
             sampleCount: 1, 
             // aspect_ratio: "1:1" // 如果需要特定比例可以在此添加 
           } 
         }), 
       } 
     ); 
  
     if (!response.ok) { 
       const errorText = await response.text(); 
       console.error('生图 API 响应错误 (Image generation failed):', errorText); 
       throw new Error(`Failed to generate image: HTTP ${response.status}`); 
     } 
  
     const data = await response.json(); 
      
     // 解析 Imagen 4.0 返回的 Base64 图像数据 
     if (data.predictions && data.predictions.length > 0) { 
       const base64Image = data.predictions[0].bytesBase64Encoded; 
       return `data:image/png;base64,${base64Image}`; 
     } else { 
       throw new Error('API 成功响应，但未返回任何图片数据'); 
     } 
   } catch (error) { 
     console.error('generateImage 调用失败:', error); 
     throw error; 
   } 
 };