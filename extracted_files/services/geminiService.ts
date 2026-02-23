
import { GoogleGenAI } from "@google/genai";
import { ImageSize, ChatMessage, GroundingLink } from "../types";

// Helper to initialize the client safely following the direct environment variable usage rule
const getAiClient = () => {
  // Check if process and process.env are defined to avoid ReferenceError in various environments
  // Some bundlers/browsers define process but not process.env
  let apiKey: string | undefined;
  
  try {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }
  
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  // Strictly using the initialization pattern defined in the GenAI guidelines
  return new GoogleGenAI({ apiKey });
};

/**
 * Generate an image using gemini-2.5-flash-image
 * Note: gemini-2.5-flash-image does not support imageSize config, it defaults to 1K (1024x1024)
 */
export const generateArtImage = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  
  try {
    // Generate content using gemini-2.5-flash-image with parts structure as per nano banana examples
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Extract image from response parts as per Gemini API rules
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("生成失败：未接收到图片数据。请尝试修改提示词或稍后重试。");
  } catch (error: any) {
    console.error("Image generation error:", error);
    if (error.message?.includes('400')) {
       throw new Error("请求被拒绝：提示词可能违反了安全策略，请调整后重试。");
    }
    throw error;
  }
};

/**
 * Chat with Search Grounding using gemini-3-pro-preview for complex reasoning and expert consultation
 */
export const chatWithArtExpert = async (message: string, history: {role: string, parts: {text: string}[]}[], systemInstruction?: string): Promise<{ text: string, links: GroundingLink[] }> => {
  const ai = getAiClient();

  try {
    // Upgraded model to 'gemini-3-pro-preview' as it provides better reasoning for professional advisory tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemInstruction || "你是一个专业的艺术顾问和油画鉴赏专家。请用优美、专业的中文回答用户关于艺术的问题。如果涉及事实性信息，请利用搜索工具获取最新资讯。"
      }
    });

    // Access text property directly from GenerateContentResponse (not a method)
    const text = response.text || "抱歉，我无法回答这个问题。";
    
    // Extract website URLs from groundingChunks as per grounding requirements
    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({
            title: chunk.web.title,
            url: chunk.web.uri,
            source: 'Google Search'
          });
        }
      });
    }

    return { text, links };
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

/**
 * Find museums using Google Maps Grounding
 */
export const findMuseums = async (query: string, location?: {lat: number, lng: number}): Promise<{ text: string, links: GroundingLink[] }> => {
  const ai = getAiClient();

  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };
    
    // Pass user location in toolConfig for Maps grounding as per best practices
    if (location) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: location.lat,
                    longitude: location.lng
                }
            }
        };
    }

    // Use gemini-2.5-flash for Maps grounding tasks as seen in guidelines examples
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: `Recommend art museums related to: ${query}. Provide a list with brief descriptions.` }] },
      config: config
    });

    // Access text property directly from response
    const text = response.text || "No results found.";
    
    // Extract grounding URLs and place info from groundingChunks
    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          links.push({
            title: chunk.web.title,
            url: chunk.web.uri,
            source: 'Web'
          });
        }
        if (chunk.maps?.uri && chunk.maps?.title) {
            links.push({
               title: chunk.maps.title,
               url: chunk.maps.uri,
               source: 'Google Maps'
             });
        }
      });
    }

    return { text, links };
  } catch (error) {
    console.error("Museum search error:", error);
    throw error;
  }
};
