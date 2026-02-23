import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';

// =============================================
// Security Utilities
// =============================================

// Input sanitization - removes potentially dangerous characters
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove < > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim()
    .slice(0, 2000); // Limit input length
}

// Validate prompt input
function validatePrompt(prompt: any): { valid: boolean; error?: string; sanitized?: string } {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: '请输入有效的提示词' };
  }
  const sanitized = sanitizeInput(prompt);
  if (sanitized.length < 2) {
    return { valid: false, error: '提示词至少需要2个字符' };
  }
  if (sanitized.length > 1000) {
    return { valid: false, error: '提示词不能超过1000个字符' };
  }
  return { valid: true, sanitized };
}

// Helper: Parse JSON request body with size limit
function parseBody(req: IncomingMessage, maxSize = 50000): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > maxSize) {
        reject(new Error('Request body too large'));
        return;
      }
      body += chunk.toString();
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

// Enhanced rate limiter with IP-based tracking
const rateLimiter = {
  requests: new Map<string, number[]>(),
  blocked: new Set<string>(),
  
  check(ip: string, limit = 30, windowMs = 60000): boolean {
    // Check if IP is blocked
    if (this.blocked.has(ip)) return false;
    
    const now = Date.now();
    const timestamps = this.requests.get(ip) || [];
    const recent = timestamps.filter(t => now - t < windowMs);
    
    if (recent.length >= limit) {
      // Temporarily block IP if exceeding limit repeatedly
      if (recent.length >= limit * 2) {
        this.blocked.add(ip);
        setTimeout(() => this.blocked.delete(ip), 300000); // Block for 5 minutes
      }
      return false;
    }
    
    recent.push(now);
    this.requests.set(ip, recent);
    return true;
  },
  
  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [ip, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => now - t < 60000);
      if (recent.length === 0) {
        this.requests.delete(ip);
      } else {
        this.requests.set(ip, recent);
      }
    }
  }
};

// Run cleanup every 5 minutes
// 仅在非生产环境下运行定时器，防止打包时进程卡死
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => rateLimiter.cleanup(), 300000);
}


// Security headers configuration
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), microphone=()',
};

/**
 * Vite plugin: Security Headers
 * Adds security headers to all responses
 */
function securityHeadersPlugin() {
  return {
    name: 'security-headers',
    configureServer(server: any) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: Function) => {
        // Add security headers to all responses
        for (const [header, value] of Object.entries(securityHeaders)) {
          res.setHeader(header, value);
        }
        next();
      });
    }
  };
}

/**
 * Vite plugin: Gemini API Proxy
 * Handles /api/* requests server-side so the API key is never sent to the browser.
 */
function geminiApiProxy(apiKey: string) {
  return {
    name: 'gemini-api-proxy',
    configureServer(server: any) {
      let ai: any = null;

      const getClient = async () => {
        if (!ai) {
          const { GoogleGenAI } = await import('@google/genai');
          ai = new GoogleGenAI({ apiKey });
        }
        return ai;
      };

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Function) => {
        if (!req.url?.startsWith('/api/')) return next();

        // Get client IP (considering proxy headers)
        const forwardedFor = req.headers['x-forwarded-for'];
        const ip = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : req.socket.remoteAddress) || 'unknown';
        
        // Rate limiting check
        if (!rateLimiter.check(ip)) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '请求过于频繁，请稍后再试。' }));
          return;
        }

        // Verify request method
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // Set response headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

        try {
          // ── POST /api/generate-image ──
          if (req.url === '/api/generate-image') {
            const body = await parseBody(req);
            const validation = validatePrompt(body.prompt);
            
            if (!validation.valid) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: validation.error }));
              return;
            }

            const client = await getClient();
            const response = await client.models.generateContent({
              model: 'gemini-2.0-flash-preview-image-generation',
              contents: `请生成一幅高品质油画风格的艺术作品：${validation.sanitized}`,
              config: {
                responseModalities: ['TEXT', 'IMAGE'],
              }
            });

            const parts = response.candidates?.[0]?.content?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  const mimeType = part.inlineData.mimeType || 'image/png';
                  // Validate mime type
                  if (!['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: '不支持的图片格式' }));
                    return;
                  }
                  res.writeHead(200);
                  res.end(JSON.stringify({ imageData: `data:${mimeType};base64,${part.inlineData.data}` }));
                  return;
                }
              }
            }

            res.writeHead(500);
            res.end(JSON.stringify({ error: '生成失败：未接收到图片数据。请尝试修改提示词或稍后重试。' }));

          // ── POST /api/chat ──
          } else if (req.url === '/api/chat') {
            const { message, history, systemInstruction } = await parseBody(req);
            
            // Validate message
            const validation = validatePrompt(message);
            if (!validation.valid) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: validation.error }));
              return;
            }

            // Sanitize history
            const sanitizedHistory = Array.isArray(history) 
              ? history.slice(-20).map((h: any) => ({
                  role: h.role === 'user' || h.role === 'model' ? h.role : 'user',
                  parts: Array.isArray(h.parts) ? h.parts.map((p: any) => ({
                    text: typeof p.text === 'string' ? sanitizeInput(p.text) : ''
                  })) : []
                }))
              : [];

            const client = await getClient();
            const chatContents = sanitizedHistory.length > 0
              ? [...sanitizedHistory, { role: 'user', parts: [{ text: validation.sanitized }] }]
              : validation.sanitized;
              
            const response = await client.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: chatContents,
              config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: systemInstruction ||
                  '你是一个专业的艺术顾问和油画鉴赏专家。请用优美、专业的中文回答用户关于艺术的问题。如果涉及事实性信息，请利用搜索工具获取最新资讯。'
              }
            });

            const text = response.text || '抱歉，我无法回答这个问题。';
            const links: any[] = [];
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
              for (const chunk of chunks) {
                if (chunk.web?.uri && chunk.web?.title) {
                  // Validate URLs
                  try {
                    const url = new URL(chunk.web.uri);
                    if (url.protocol === 'https:' || url.protocol === 'http:') {
                      links.push({ title: sanitizeInput(chunk.web.title), url: chunk.web.uri, source: 'Google Search' });
                    }
                  } catch {}
                }
              }
            }

            res.writeHead(200);
            res.end(JSON.stringify({ text, links: links.slice(0, 10) }));

          // ── POST /api/find-museums ──
          } else if (req.url === '/api/find-museums') {
            const { query, location } = await parseBody(req);
            
            const validation = validatePrompt(query);
            if (!validation.valid) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: validation.error }));
              return;
            }

            // Validate location if provided
            let validLocation = null;
            if (location && typeof location === 'object') {
              const lat = parseFloat(location.lat);
              const lng = parseFloat(location.lng);
              if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                validLocation = { latitude: lat, longitude: lng };
              }
            }

            const config: any = { tools: [{ googleMaps: {} }] };
            if (validLocation) {
              config.toolConfig = {
                retrievalConfig: { latLng: validLocation }
              };
            }

            const client = await getClient();
            const response = await client.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Recommend art museums related to: ${validation.sanitized}. Provide a list with brief descriptions.`,
              config
            });

            const text = response.text || 'No results found.';
            const links: any[] = [];
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
              for (const chunk of chunks) {
                if (chunk.web?.uri && chunk.web?.title) {
                  links.push({ title: sanitizeInput(chunk.web.title), url: chunk.web.uri, source: 'Web' });
                }
                if (chunk.maps?.uri && chunk.maps?.title) {
                  links.push({ title: sanitizeInput(chunk.maps.title), url: chunk.maps.uri, source: 'Google Maps' });
                }
              }
            }

            res.writeHead(200);
            res.end(JSON.stringify({ text, links: links.slice(0, 15) }));

          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
          }
        } catch (error: any) {
          console.error('[Gemini API Proxy Error]', error?.message || error);
          const is400 = error.message?.includes('400') || error.message?.includes('INVALID_ARGUMENT');
          const statusCode = is400 ? 400 : 500;
          const errorMessage = is400
            ? '请求被拒绝：提示词可能违反了安全策略，请调整后重试。'
            : '服务器内部错误，请稍后重试。';
          res.writeHead(statusCode);
          res.end(JSON.stringify({ error: errorMessage }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: mode === 'production' ? '/ArtIsLife/' : '/',
    server: {
      port: 3000,
      host: '0.0.0.0', // Allow LAN access
      strictPort: false, // Try next port if 3000 is in use
      cors: {
        origin: false, // Disable CORS for security (same-origin only)
      },
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
    },
    build: {
      sourcemap: false, // Don't expose source maps in production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.log in production
        },
      },
    },
    plugins: [
      react(),
      securityHeadersPlugin(),
      geminiApiProxy(env.GEMINI_API_KEY),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
