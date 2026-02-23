import type { VercelRequest, VercelResponse } from '@vercel/node';

// Input sanitization - removes potentially dangerous characters
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove < > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim()
    .slice(0, 2000); // Limit input length
}

// Validate prompt input
export function validatePrompt(prompt: any): { valid: boolean; error?: string; sanitized?: string } {
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

// Security headers configuration
export const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), microphone=()',
};

// Apply security headers to response
export function applySecurityHeaders(res: VercelResponse): void {
  for (const [header, value] of Object.entries(securityHeaders)) {
    res.setHeader(header, value);
  }
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
}

// Check request method is POST, return true if invalid (already handled)
export function ensurePost(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return true;
  }
  return false;
}
