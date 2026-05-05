import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { usersRouter } from './routes/users'
import { onboardingRouter } from './routes/onboarding'

export const app = new Hono().basePath('/api')

app.use(
  '*',
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
)

app.get('/health', (c) => c.json({ ok: true }))

app.route('/users', usersRouter)
app.route('/onboarding', onboardingRouter)

export default app
