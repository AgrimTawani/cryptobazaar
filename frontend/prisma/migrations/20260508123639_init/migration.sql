-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('LOGIN_DONE', 'ONBOARDING_PENDING', 'WALLET_PENDING', 'VERIFICATION_PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OnboardingLayer" AS ENUM ('KYC', 'EDD', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "OnboardingLayerStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('STARTER', 'TRADER', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Asset" AS ENUM ('USDT', 'USDC');

-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('POLYGON', 'SOLANA', 'TRON');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'IMPS', 'NEFT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('LISTED', 'MATCHED', 'ESCROW_PENDING', 'ESCROW_FUNDED', 'BUYER_PAID', 'COMPLETED', 'DISPUTED', 'DISPUTE_RESOLVED_BUYER', 'DISPUTE_RESOLVED_SELLER', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER');

-- CreateEnum
CREATE TYPE "ClaimTier" AS ENUM ('EMERGENCY', 'STANDARD', 'FULL');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'BLOCKED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'LOGIN_DONE',
    "email" TEXT,
    "name" TEXT,
    "avatar_url" TEXT,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "aadhaar_last4" TEXT,
    "pan_masked" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "kyc_session_id" TEXT,
    "kyc_provider" TEXT DEFAULT 'didit',
    "kyc_verified_at" TIMESTAMP(3),
    "kyc_expires_at" TIMESTAMP(3),
    "did" TEXT,
    "kyc_credential_id" TEXT,
    "edd_credential_id" TEXT,
    "interview_cred_id" TEXT,
    "wallet_address" TEXT,
    "wallet_chain" TEXT,
    "wallet_verified_at" TIMESTAMP(3),
    "subscription_tier" "SubscriptionTier",
    "subscription_expires_at" TIMESTAMP(3),
    "monthly_trade_volume_inr" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "total_trade_volume_inr" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "trade_count" INTEGER NOT NULL DEFAULT 0,
    "volume_reset_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "layer" "OnboardingLayer" NOT NULL,
    "status" "OnboardingLayerStatus" NOT NULL DEFAULT 'PENDING',
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "score" DOUBLE PRECISION,
    "result" JSONB,
    "rejection_reason" TEXT,
    "vc_credential_id" TEXT,
    "reapply_after" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_screens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'nominis',
    "risk_score" DOUBLE PRECISION,
    "risk_level" "RiskLevel" NOT NULL,
    "flags" JSONB,
    "is_passed" BOOLEAN NOT NULL,
    "raw_response" JSONB,
    "screened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_screens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "utr" TEXT,
    "paid_at" TIMESTAMP(3),
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "buyer_id" TEXT,
    "asset" "Asset" NOT NULL,
    "chain" "Chain" NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "price_per_unit" DECIMAL(20,2) NOT NULL,
    "total_value_inr" DECIMAL(20,2) NOT NULL,
    "min_trade_size" DECIMAL(20,2),
    "max_trade_size" DECIMAL(20,2),
    "accepted_payment_methods" "PaymentMethod"[],
    "seller_upi_id" TEXT,
    "seller_bank_account" TEXT,
    "seller_ifsc" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'LISTED',
    "escrow_contract_address" TEXT,
    "escrow_tx_hash" TEXT,
    "release_tx_hash" TEXT,
    "levy_tx_hash" TEXT,
    "utr" TEXT,
    "payment_method" "PaymentMethod",
    "payment_screenshot_ipfs" TEXT,
    "payment_window_expires_at" TIMESTAMP(3),
    "payment_submitted_at" TIMESTAMP(3),
    "confirmation_window_expires_at" TIMESTAMP(3),
    "seller_confirmed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "raised_by_id" TEXT NOT NULL,
    "raised_by_role" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "evidence_deadline" TIMESTAMP(3),
    "buyer_bank_statement_ipfs" TEXT,
    "buyer_statement" TEXT,
    "buyer_evidence_submitted_at" TIMESTAMP(3),
    "buyer_statement_tampered" BOOLEAN,
    "seller_bank_statement_ipfs" TEXT,
    "seller_statement" TEXT,
    "seller_evidence_submitted_at" TIMESTAMP(3),
    "seller_statement_tampered" BOOLEAN,
    "resolution" TEXT,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protection_fund_claims" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "tier" "ClaimTier" NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'SUBMITTED',
    "bank_freeze_notice_ipfs" TEXT,
    "fir_or_complaint_ipfs" TEXT,
    "legal_representation_ipfs" TEXT,
    "noc_ipfs" TEXT,
    "requested_amount" DECIMAL(12,2) NOT NULL,
    "approved_amount" DECIMAL(12,2),
    "disbursed_amount" DECIMAL(12,2),
    "review_notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "disbursed_at" TIMESTAMP(3),
    "disbursement_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protection_fund_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_did_key" ON "users"("did");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "onboarding_records_user_id_idx" ON "onboarding_records"("user_id");

-- CreateIndex
CREATE INDEX "wallet_screens_user_id_idx" ON "wallet_screens"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_id_key" ON "orders"("order_id");

-- CreateIndex
CREATE INDEX "orders_seller_id_idx" ON "orders"("seller_id");

-- CreateIndex
CREATE INDEX "orders_buyer_id_idx" ON "orders"("buyer_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_order_id_key" ON "disputes"("order_id");

-- CreateIndex
CREATE INDEX "protection_fund_claims_user_id_idx" ON "protection_fund_claims"("user_id");

-- AddForeignKey
ALTER TABLE "onboarding_records" ADD CONSTRAINT "onboarding_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_screens" ADD CONSTRAINT "wallet_screens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_id_fkey" FOREIGN KEY ("raised_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protection_fund_claims" ADD CONSTRAINT "protection_fund_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protection_fund_claims" ADD CONSTRAINT "protection_fund_claims_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
