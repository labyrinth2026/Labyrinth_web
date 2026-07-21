const encoder = new TextEncoder();

function arrayBufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

const JWT_SECRET = (process.env.JWT_SECRET || 'labyrinth-secret-key-32-chars-long-or-more').trim();

async function getSigningKey() {
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signJWT(payload: any, expiryInSeconds = 86400): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerStr = arrayBufferToBase64Url(encoder.encode(JSON.stringify(header)));
  
  const exp = Math.floor(Date.now() / 1000) + expiryInSeconds;
  const payloadWithExp = { ...payload, exp };
  const payloadStr = arrayBufferToBase64Url(encoder.encode(JSON.stringify(payloadWithExp)));
  
  const tokenInput = `${headerStr}.${payloadStr}`;
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(tokenInput)
  );
  const signatureStr = arrayBufferToBase64Url(signature);
  return `${tokenInput}.${signatureStr}`;
}

export async function verifyJWT(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerStr, payloadStr, signatureStr] = parts;
    
    const key = await getSigningKey();
    const tokenInput = `${headerStr}.${payloadStr}`;
    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToArrayBuffer(signatureStr),
      encoder.encode(tokenInput)
    );
    if (!verified) return null;
    
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToArrayBuffer(payloadStr)));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Session expired
    }
    return payload;
  } catch (error) {
    console.error('[JWT] verification error', error);
    return null;
  }
}
