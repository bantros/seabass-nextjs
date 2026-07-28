import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const config = {
  matcher: ['/api/create-invoice', '/api/share-invoice']
};

const isDev = process.env.NODE_ENV === 'development';

const ratelimit =
  isDev && process.env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.fixedWindow(5, '1 d'),
        prefix: 'invoice:create',
        analytics: false
      })
    : null;

async function hashIdentifier(ip: string, ua: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${ua}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  if (!ratelimit) return NextResponse.next();

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'anon';
  const ua = request.headers.get('user-agent') ?? '';
  const key = await hashIdentifier(ip, ua);

  const { success, limit, reset } = await ratelimit.limit(key);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: "You've reached your daily limit of 5 invoices.",
        retryAfter: retryAfter
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': retryAfter.toString()
        }
      }
    );
  }

  return NextResponse.next();
}
