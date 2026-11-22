export interface JwtPayload {
  user_id?: string;
  sub?: string;
  name?: string;
  email?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function base64UrlToBase64(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad === 2) base64 += '==';
  else if (pad === 3) base64 += '=';
  return base64;
}

function decodeBase64ToUtf8(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  // Fallback for environments without TextDecoder
  let percentEncoded = '';
  for (let i = 0; i < bytes.length; i++) {
    percentEncoded += '%' + bytes[i].toString(16).padStart(2, '0');
  }
  return decodeURIComponent(percentEncoded);
}

/**
 * Safely decodes the payload of a JWT token handling Base64URL and UTF-8 characters.
 */
export function decodeJwtPayload(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) {
    throw new Error('Formato de token inválido');
  }

  const base64 = base64UrlToBase64(parts[1]);
  const jsonString = decodeBase64ToUtf8(base64);
  const parsed: unknown = JSON.parse(jsonString);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Payload do token inválido');
  }

  return parsed as JwtPayload;
}
