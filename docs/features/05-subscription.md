# Subscription

## What it does
Gates access to trading behind a monthly subscription. Controls how much a user can trade per month. Subscription revenue covers platform operating costs.

---

## How it works

### Tiers

| Tier | Price | Monthly Trade Cap |
|---|---|---|
| Starter | ₹200/month | ₹5,00,000 |
| Trader | ₹500/month | ₹20,00,000 |
| Pro | ₹1,000/month | Unlimited |

### When it's required
A user must have an active subscription to:
- Post a sell listing
- Initiate a buy

A user without an active subscription can browse listings but cannot trade.

### Trade cap enforcement
The platform tracks cumulative INR trade volume for each user within the current billing month. When a user approaches their cap, they are notified. When they hit it, new trades are blocked until the next billing cycle or they upgrade.

### Subscription and insurance eligibility
An active subscription at the time of a trade is one of the eligibility criteria for filing an insurance claim. Lapsed subscriptions at the time of the frozen trade disqualify the claim.

### Billing
Handled at the platform level. Payment method TBD (likely UPI/card via a compliant billing provider for INR collection).

---

## Tech
- **Subscription state:** Stored in NeonDB against the user record
- **Cap tracking:** Trade volume aggregated in NeonDB per user per billing month
- **Enforcement:** Checked in the Hono API before any trade initiation
