import { Hono } from 'hono'
import { walletAuthMiddleware, type AuthEnv } from '@/api/middleware/wallet-auth'
import { db } from '@/db/client'

export const onboardingRouter = new Hono<AuthEnv>()

onboardingRouter.get('/status', walletAuthMiddleware, async (c) => {
  const walletAddress = c.get('walletAddress')
  const user = await db.user.findUnique({
    where: { walletAddress },
    include: { onboardingRecords: true },
  })
  if (!user) return c.json({ error: 'User not found' }, 404)

  return c.json({
    status: user.onboardingStatus,
    layers: user.onboardingRecords,
  })
})
