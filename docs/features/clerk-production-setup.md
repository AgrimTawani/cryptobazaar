# Clerk Production Setup

## Steps

1. Create new production instance in Clerk dashboard
2. Copy `pk_live_...` and `sk_live_...` keys → add to Vercel env vars → redeploy
3. Google OAuth → turn off "Use custom credentials"
4. Add 5 CNAME records in Vercel DNS (Domains → cryptobazaar.co.in → DNS Records):

| Name | Value |
|---|---|
| `accounts` | `accounts.clerk.services` |
| `clerk` | `frontend-api.clerk.services` |
| `clk._domainkey` | `dkim1.3odnyi22rq58.clerk.services` |
| `clk2._domainkey` | `dkim2.3odnyi22rq58.clerk.services` |
| `clkmail` | `mail.3odnyi22rq58.clerk.services` |

5. Clerk dashboard → Domains → Verify configuration
6. Wait 5–15 min for SSL certificates to show Active
