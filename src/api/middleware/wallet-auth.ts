import { createMiddleware } from 'hono/factory'
import { verifySessionToken } from '@/lib/auth'

export type AuthEnv = {
  Variables: {
    walletAddress: string
    did: string
  }
}

export const walletAuthMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  const payload = await verifySessionToken(token)
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  c.set('walletAddress', payload.walletAddress)
  c.set('did', payload.did)
  await next()
})
