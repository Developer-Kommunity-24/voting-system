import { Hono } from 'hono'
import { clerkMiddleware } from '@clerk/hono'
import type { AppEnv } from './types'

import voteRoutes from './routes/vote.route'
import healthRoutes from './routes/health.route'
import progressRoutes from './routes/progress.route'
import itemsRoutes from './routes/items.route'
import resultsRoutes from './routes/results.route'
import userRoutes from './routes/user.route'
import webhookRoutes from './routes/webhook.route'
import { cors } from 'hono/cors'
import adminRoutes from './routes/admin.route'

// Mount under /api/v1/admin
const app = new Hono<AppEnv>()

const port = 8000;

//using cors and clerk middleware
app.use('*', cors())
app.use('*', clerkMiddleware())

app.all('/__clerk/*', async (c) => {
  const url = new URL(c.req.url);

  // Target Clerk's real Frontend API
  const targetUrl = new URL(url.pathname.replace(/^\/__clerk/, '') + url.search, 
    'https://frontend-api.clerk.services');

  const headers = new Headers(c.req.raw.headers);

  // === Required headers by Clerk for proxy ===
  headers.set('Host', 'frontend-api.clerk.services');
  headers.set('Clerk-Proxy-Url', 'https://clerk.vote.dk24.org/__clerk');   // ← Change if you use different proxy URL
  headers.set('Clerk-Secret-Key', c.env.CLERK_SECRET_KEY);                 // Add this env variable in Worker

  // Optional but recommended: Forward real client IP
  if (c.req.raw.headers.get('cf-connecting-ip')) {
    headers.set('X-Forwarded-For', c.req.raw.headers.get('cf-connecting-ip')!);
  }

  // Handle CORS preflight (OPTIONS) requests
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://vote.dk24.org',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Clerk-Session, *',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Forward the request to Clerk
  const response = await fetch(targetUrl.toString(), {
    method: c.req.method,
    headers,
    body: c.req.raw.body,
    redirect: 'follow',
  });

  // Clone response and add CORS headers
  const newResponse = new Response(response.body, response);

  newResponse.headers.set('Access-Control-Allow-Origin', 'https://vote.dk24.org');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Clerk-Session, *');

  return newResponse;
});
  

// Webhook route must come before clerkMiddleware
app.route('/webhooks', webhookRoutes)

//protected api group
const api = app.basePath('/api/v1')

api.route('/vote', voteRoutes)
api.route('/health', healthRoutes)
api.route('/progress', progressRoutes)
api.route('/items', itemsRoutes)
api.route('/results', resultsRoutes)
api.route('/user', userRoutes)
api.route('/admin', adminRoutes)
app.get('/', (c) => c.json({ ok: true }))
export default {
  port,
  fetch: app.fetch,
}
