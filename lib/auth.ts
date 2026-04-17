import { jwtVerify, SignJWT } from 'jose';
import { NextRequest } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret);
}

export async function verifyAdminToken(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get('leads_token')?.value;
  if (!cookie) return false;
  try {
    await jwtVerify(cookie, secret);
    return true;
  } catch {
    return false;
  }
}
