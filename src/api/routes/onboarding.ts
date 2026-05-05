import { Hono } from 'hono'
import { walletAuthMiddleware, type AuthEnv } from '@/api/middleware/wallet-auth'
import { db } from '@/db/client'
import { users, onboarding_records } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const onboardingRouter = new Hono<AuthEnv>()

onboardingRouter.get('/status', walletAuthMiddleware, async (c) => {
  const walletAddress = c.get('walletAddress')
  const [user] = await db.select().from(users).where(eq(users.wallet_address, walletAddress))
  if (!user) return c.json({ error: 'User not found' }, 404)

  const records = await db
    .select()
    .from(onboarding_records)
    .where(eq(onboarding_records.user_id, user.id))

  return c.json({
    status: user.onboarding_status,
    layers: records,
  })
})
