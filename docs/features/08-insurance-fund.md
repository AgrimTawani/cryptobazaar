# Insurance Fund

## What it does
Compensates verified members whose bank accounts are frozen due to a CryptoBazaar trade, even when they did everything right. Funded entirely by a 0.75% levy on every completed trade.

---

## How the fund is built

Every time a trade completes on CryptoBazaar, 0.75% of the USDT/USDC value is automatically sent from the escrow contract to the `InsuranceFund` smart contract. This happens at settlement — no manual action required.

The fund is on-chain. CryptoBazaar cannot spend it arbitrarily. Payouts require multisig approval.

### Conservative sustainability estimate
```
500 active users
₹20,000 avg trade × 3 trades/user/month
= ₹30M/month total volume

0.75% levy = ₹225,000/month into fund
Expected claims: 2–3 users/month at ₹30,000 avg = ₹75,000/month
Fund is cash-flow positive from month 1.
```

---

## Who can claim

All four conditions must be true:
1. Active subscription at the time of the frozen trade
2. Valid (unexpired) EDD credential at the time of the trade
3. The trade was executed through CryptoBazaar's escrow contract (on-chain verifiable)
4. The bank freeze is directly attributable to that specific trade (requires police notice or bank freeze letter)

---

## Claim tiers

| Tier | Evidence Required | Max Payout | SLA |
|---|---|---|---|
| Emergency | Bank freeze notice + FIR/complaint number | ₹10,000 | 24 hours |
| Standard | Above + proof of legal representation | ₹1,00,000 | 7 days |
| Full | Above + NOC issued or account unfrozen | ₹5,00,000 | 30 days |

The emergency tier exists because a frozen account means the member may have zero access to cash. Fast partial relief is prioritised.

---

## How a claim is processed

1. Member submits claim through the platform with supporting documents
2. CryptoBazaar's compliance team verifies:
   - The trade exists on-chain
   - The member's credentials were valid at trade time
   - The freeze notice is genuine and references the correct transaction
3. Approved claims trigger a payout from the `InsuranceFund` smart contract
4. CryptoBazaar also assigns a support agent to help the member navigate the bank unfreeze process

---

## Anti-abuse rules

- Maximum 2 claims per user per year
- 90-day waiting period after becoming a Verified Member before first claim eligibility (prevents join-and-claim)
- All claims are cross-checked against on-chain trade records — no trade record, no claim
- Fraudulent claim (fabricated freeze notice) → permanent ban + potential legal action

---

## Governance

| Phase | Mechanism |
|---|---|
| Phase 1 (launch) | 3-of-5 multisig — CryptoBazaar compliance team approves claims |
| Phase 2 | Community vote required for claims above ₹1,00,000 |
| Phase 3 | Fully on-chain DAO governs all claims |

---

## Tech
- **Fund contract (Polygon):** `InsuranceFund.sol` — receives levy, holds USDC pool, executes payouts on multisig approval
- **Fund program (Solana):** `insurance_fund` Anchor program — mirrors Polygon logic
- **Claim management:** Internal compliance dashboard + NeonDB for claim records
- **Multisig:** 3-of-5 for Phase 1
