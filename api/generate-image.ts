import type { VercelRequest, VercelResponse } from '@vercel/node'; 
  
 export default async function handler(req: VercelRequest, res: VercelResponse) { 
   // 基础 CORS 头设置 
   res.setHeader('Access-Control-Allow-Credentials', 'true'); 
   res.setHeader('Access-Control-Allow-Origin', '*'); 
   res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT'); 
   res.setHeader( 
     'Access-Control-Allow-Headers', 
     'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' 
   ); 
  
   // 处理预检请求 
   if (req.method === 'OPTIONS') { 
     res.status(200).end(); 
     return; 
   } 
  
   // 仅允许 POST 请求 
   if (req.method !== 'POST') { 
     return res.status(405).json({ error: 'Method not allowed' }); 
   } 
  
   try { 
     const { prompt } = req.body; 
  
     if (!prompt) { 
       return res.status(400).json({ error: 'Prompt is required (必须提供提示词)' }); 
     } 
  
     const apiKey = process.env.GEMINI_API_KEY; 
     if (!apiKey) { 
       return res.status(500).json({ error: 'Server configuration error: API key is missing' }); 
     } 
  
     // 已修复：使用最新受支持的 imagen-4.0-generate-001 模型 
     const response = await fetch( 
       `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, 
       { 
         method: 'POST', 
         headers: { 
           'Content-Type': 'application/json', 
         }, 
         body: JSON.stringify({ 
           instances: [ 
             { 
               prompt: prompt, 
             } 
           ], 
           parameters: { 
             sampleCount: 1, 
           } 
         }), 
       } 
     ); 
  
     if (!response.ok) { 
       const errorText = await response.text(); 
       console.error('Gemini API Error:', errorText); 
       return res.status(response.status).json({ error: `API Error: ${response.statusText}` }); 
     } 
  
     const data = await response.json(); 
      
     // 提取 Base64 图片 
     if (!data.predictions || data.predictions.length === 0) { 
       return res.status(500).json({ error: 'No image returned from API' }); 
     } 
  
     const base64Image = data.predictions[0].bytesBase64Encoded; 
      
     // 将其以标准的 base64 Data URL 格式返回给前端 
     return res.status(200).json({  
       imageUrl: `data:image/png;base64,${base64Image}`  
     }); 
      
   } catch (error: any) { 
     console.error('Server execution error:', error); 
     return res.status(500).json({ error: error.message || 'Internal server error' }); 
   } 
 }