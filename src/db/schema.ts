import { pgTable, text, timestamp, uuid, jsonb, pgEnum } from 'drizzle-orm/pg-core'

export const onboardingStatusEnum = pgEnum('onboarding_status', [
  'REGISTERED',
  'KYC_PENDING',
  'KYC_PASSED',
  'EDD_PENDING',
  'EDD_PASSED',
  'INTERVIEW_PENDING',
  'VERIFIED_MEMBER',
  'REJECTED',
])

export const onboardingLayerEnum = pgEnum('onboarding_layer', [
  'KYC',
  'EDD',
  'INTERVIEW',
])

export const onboardingLayerStatusEnum = pgEnum('onboarding_layer_status', [
  'PENDING',
  'IN_PROGRESS',
  'PASSED',
  'FAILED',
])

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'STARTER',
  'TRADER',
  'PRO',
])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  wallet_address: text('wallet_address').notNull().unique(),
  did: text('did').unique(),
  onboarding_status: onboardingStatusEnum('onboarding_status').notNull().default('REGISTERED'),
  subscription_tier: subscriptionTierEnum('subscription_tier'),
  subscription_expires_at: timestamp('subscription_expires_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export const onboarding_records = pgTable('onboarding_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  layer: onboardingLayerEnum('layer').notNull(),
  status: onboardingLayerStatusEnum('status').notNull().default('PENDING'),
  result: jsonb('result'),
  rejection_reason: text('rejection_reason'),
  vc_credential_id: text('vc_credential_id'),
  reapply_after: timestamp('reapply_after'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type OnboardingRecord = typeof onboarding_records.$inferSelect
export type NewOnboardingRecord = typeof onboarding_records.$inferInsert
