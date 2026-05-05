import { Hono } from 'hono'
import { db } from '@/db/client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyWalletSignature, createSessionToken } from '@/lib/auth'
import { createDIDForUser } from '@/lib/identus'
import { walletAuthMiddleware, type AuthEnv } from '@/api/middleware/wallet-auth'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const registerSchema = z.object({
  walletAddress: z.string().min(10),
  signature: z.string().min(10),
  message: z.string().min(1),
})

export const usersRouter = new Hono<AuthEnv>()

usersRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const { walletAddress, signature, message } = c.req.valid('json')

  const isValid = await verifyWalletSignature(message, signature, walletAddress)
  if (!isValid) {
    return c.json({ error: 'Invalid signature' }, 400)
  }

  const existing = await db.select().from(users).where(eq(users.wallet_address, walletAddress))
  if (existing.length > 0) {
    const token = await createSessionToken(walletAddress, existing[0].did ?? '')
    return c.json({ user: existing[0], token }, 200)
  }

  const did = await createDIDForUser(walletAddress)

  const [newUser] = await db
    .insert(users)
    .values({
      wallet_address: walletAddress,
      did,
      onboarding_status: 'REGISTERED',
    })
    .returning()

  const token = await createSessionToken(walletAddress, did)
  return c.json({ user: newUser, token }, 201)
})

usersRouter.get('/me', walletAuthMiddleware, async (c) => {
  const walletAddress = c.get('walletAddress')
  const [user] = await db.select().from(users).where(eq(users.wallet_address, walletAddress))
  if (!user) return c.json({ error: 'User not found' }, 404)
  return c.json({ user })
})
