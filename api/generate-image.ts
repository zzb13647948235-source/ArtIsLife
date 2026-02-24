import type { VercelRequest, VercelResponse } from '@vercel/node'; 
  
 // 1. 定义请求体的类型接口，提高代码可读性和类型安全 
 interface GenerateImageRequest { 
   prompt: string; 
   aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'; 
 } 
  
 export default async function handler(req: VercelRequest, res: VercelResponse) { 
   // 2. 优化 CORS 头部设置代码 (更加简洁) 
   const corsHeaders = { 
     'Access-Control-Allow-Credentials': 'true', 
     'Access-Control-Allow-Origin': '*', 
     'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',  
     'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' 
   }; 
  
   Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value)); 
  
   if (req.method === 'OPTIONS') { 
     return res.status(200).end(); 
   } 
  
   if (req.method !== 'POST') { 
     return res.status(405).json({ error: 'Method not allowed (仅支持 POST 请求)' }); 
   } 
  
   try { 
     const { prompt, aspectRatio = '1:1' } = req.body as GenerateImageRequest; 
  
     // 3. 更严格的参数校验 
     if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') { 
       return res.status(400).json({ error: 'Prompt is required and must be a valid string (必须提供有效的提示词)' }); 
     } 
  
     const apiKey = process.env.GEMINI_API_KEY; 
     if (!apiKey) { 
       console.error('[Generate-Image] API Key is missing in environment variables'); 
       return res.status(500).json({ error: 'Server configuration error: API key is missing' }); 
     } 
  
     // 4. 在后端层面统一进行提示词增强，保障出图下限质量 
     const enhancedPrompt = `${prompt.trim()}, masterpiece, best quality, highly detailed`; 
  
     const response = await fetch( 
       `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`, 
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
             aspectRatio: aspectRatio, // 5. 增加了对图片比例的参数支持 
           } 
         }), 
       } 
     ); 
  
     // 6. 更详尽的外部 API 错误反馈 
     if (!response.ok) { 
       const errorText = await response.text(); 
       console.error(`[Generate-Image] Gemini API Error (${response.status}):`, errorText); 
       return res.status(response.status).json({  
         error: `API Request Failed: ${response.statusText}`, 
         details: errorText // 方便前端排查具体报错 
       }); 
     } 
  
     const data = await response.json(); 
      
     // 7. 使用可选链 (Optional Chaining) 防止因 API 返回结构异常导致的崩溃 
     if (!data?.predictions?.[0]?.bytesBase64Encoded) { 
       console.error('[Generate-Image] Unexpected API response format:', JSON.stringify(data)); 
       return res.status(500).json({ error: 'API returned an unexpected response format (未返回有效的图片数据)' }); 
     } 
  
     const base64Image = data.predictions[0].bytesBase64Encoded; 
      
     return res.status(200).json({  
       imageUrl: `data:image/png;base64,${base64Image}`  
     }); 
      
   } catch (error: unknown) {  
     // 8. 修复 TypeScript 中的 any 类型警告 
     const errorMessage = error instanceof Error ? error.message : 'Unknown internal error'; 
     console.error('[Generate-Image] Server execution error:', errorMessage); 
      
     return res.status(500).json({  
       error: 'Internal server error (服务器内部错误)',  
       details: errorMessage  
     }); 
   } 
 }