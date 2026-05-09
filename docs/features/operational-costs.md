# CryptoBazaar — Operational Costs

_Last updated: May 2026_

---

## Current Monthly Cost: ~$0

Every service is on a free tier. The only real cost is Didit KYC credits ($0.33/user, pre-paid).

---

## Service-by-Service Breakdown

### 1. Vercel (Hosting + Serverless)
| Tier | Cost | Limits |
|---|---|---|
| **Hobby (current)** | **$0/month** | 100 GB bandwidth, 100 GB-hrs serverless, 60s function timeout |
| Pro | $20/month/member | 1 TB bandwidth, 1,000 GB-hrs serverless, 800s timeout |

**When you'll hit the limit:** ~50,000 page views/month or heavy PDF analysis traffic (each analysis can run 10-30s).

**When to upgrade:** When you start seeing `FUNCTION_INVOCATION_TIMEOUT` errors or bandwidth warnings in Vercel dashboard.

---

### 2. NeonDB (PostgreSQL)
| Tier | Cost | Limits |
|---|---|---|
| **Free (current)** | **$0/month** | 0.5 GB storage, 0.25 vCPU, 100 compute-hrs/month |
| Pro | $19/month | 10 GB storage, 1 CU compute, autoscaling |

**When you'll hit the limit:** ~5,000–10,000 users (each user row + onboarding records + trade history adds up fast once trading starts).

**When to upgrade:** Storage warning in Neon console, or slow queries under load.

---

### 3. Clerk (Authentication)
| Tier | Cost | Limits |
|---|---|---|
| **Free (current)** | **$0/month** | 10,000 Monthly Active Users (MAU) |
| Pro | $25/month | 10,000 MAU included, then $0.02/MAU |

**When you'll hit the limit:** 10,000 users who log in within any calendar month.

**Cost at scale:**
- 15,000 MAU → $25 + (5,000 × $0.02) = **$125/month**
- 50,000 MAU → $25 + (40,000 × $0.02) = **$825/month**

**Note:** Since CryptoBazaar is gated (KYC required), MAU will always be ≤ total verified users. Growth is slow and predictable.

---

### 4. Didit KYC (Identity Verification)
| | Cost |
|---|---|
| **Per verification** | **$0.33** |
| Current balance | $10.00 (~30 verifications) |
| Model | Pre-paid credits, no monthly fee |

**What triggers a charge:** Every time a user clicks "Verify with Didit" and completes the session (Approved or Declined — both cost credits).

**Cost at scale:**
- 100 new users/month → **$33/month**
- 500 new users/month → **$165/month**
- 1,000 new users/month → **$330/month**

**Cost reduction options:**
- Negotiate volume pricing with Didit at 1,000+ verifications/month
- Add a re-attempt limit (already configured: max 3 attempts per user in 7 days) to prevent credit abuse

---

### 5. Google Gemini API (Bank Statement Analysis)
| Tier | Cost | Limits |
|---|---|---|
| **Free (current)** | **$0/month** | 1,500 requests/day with Gemini 1.5 Flash |
| Pay-as-you-go | ~$0.0003/analysis | $0.075/1M input tokens, $0.30/1M output tokens |

**When you'll hit the limit:** 1,500 bank statement uploads per day — essentially never during early growth.

**Cost at scale:** Even at 10,000 analyses/month, cost is **~$3/month**. Negligible forever.

---

### 6. GitHub (Code Hosting)
| Tier | Cost |
|---|---|
| **Free (current)** | **$0/month** |

No foreseeable reason to upgrade for this project.

---

### 7. Domain (cryptobazaar.co.in)
| | Cost |
|---|---|
| Annual renewal | ~₹800–1,200/year (~$10–15/year) |

---

## Projected Costs at Scale

| Users (total verified) | Monthly Cost | Main drivers |
|---|---|---|
| 0–500 | **$0** | All free tiers |
| 500–1,000 | **~$33–$100** | Didit KYC credits only |
| 1,000–5,000 | **~$100–$200** | Didit + possibly Vercel Pro |
| 5,000–10,000 | **~$200–$500** | Didit + Vercel Pro + NeonDB Pro |
| 10,000–50,000 | **~$500–$1,500** | Didit + Vercel Pro + NeonDB Pro + Clerk Pro |

---

## Services Not Yet Active (Future Cost)

| Service | Purpose | Cost when added |
|---|---|---|
| Cloudflare R2 | Bank statement PDF storage (if enabled) | Free up to 10 GB, then $0.015/GB |
| Inngest | Background job queue (if needed for long tasks) | Free up to 50,000 runs/month |
| Nominis | Wallet AML screening | Pay-per-check, pricing on request |
| Hyperledger Identus | Verifiable credentials (DID/VC) | Self-hosted or cloud, TBD |
| Razorpay / payment gateway | Subscription payments | 2% per transaction |

---

## Cost Optimisation Notes

1. **Didit is the only meaningful cost** at early scale. Everything else is effectively free until 10,000+ users.
2. **KYC re-attempts waste credits** — the 3-attempt limit in the workflow prevents abuse.
3. **Gemini bank statement analysis** costs ~$3/month even at high volume — never worth optimising.
4. **NeonDB** — consider archiving old `onboarding_records` for rejected/expired users to stay under 0.5 GB.
5. **Vercel** — PDF analysis routes have `maxDuration = 60`. Heavy concurrent usage can burn GB-hours fast. Monitor in Vercel dashboard.
