import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { v4 as uuidv4 } from 'uuid';

export function generateRequestId(): string {
  return uuidv4();
}

export function generateNonce(): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const randomStr = Array.from(randomBytes, (byte) => 
    (byte % 36).toString(36)
  ).join('').substring(0, 16);
  return `${timestamp}${randomStr}`;
}

export async function hmacSha256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

let fpPromise: Promise<any> | null = null;

async function getFingerprint(): Promise<string> {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}

export async function getDeviceId(): Promise<string> {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = await getFingerprint();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}
