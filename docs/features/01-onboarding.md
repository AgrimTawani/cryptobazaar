# Onboarding & Identity

## What it does
Creates a verified identity for every new user through a 4-stage flow: Google authentication → 3-layer verification → wallet connection. CryptoBazaar never stores raw personal data — only the DID linked to the user's Google account.

---

## Auth Architecture

### Why Google first, wallet second
The original design used wallet as the login identifier. This is now changed:

- **Google OAuth** is the authentication mechanism — handles sessions, identity, route protection
- **Wallet** is the custody mechanism — connected separately after onboarding, tied permanently to the account

This separation means users can log in from any device without importing their wallet, and the wallet becomes a verified custody address rather than a password.

### Wallet lock rule
Once a user connects a wallet and completes onboarding, the wallet address is permanently bound to their account. If the wallet is changed:
- All 3 verification credentials are invalidated
- The user must restart the full onboarding flow from KYC
- This is because the wallet is screened for on-chain history (Nominis) as part of verification

This rule is shown explicitly before wallet connection. The user must acknowledge it before proceeding.

---

## Onboarding Flow

```
Landing page
    ↓
Login page — Google OAuth only
    ↓
New user detected → /onboarding (hub)
    ↓
Step 1: KYC via Didit
  → Aadhaar OCR + liveness check + face match
  → KYCCredential issued to DID on pass
    ↓
Step 2: Bank Statement EDD
  → 6-month PDF upload → Perfios/Authbridge ML scoring
  → EDDCredential issued to DID on pass
    ↓
Step 3: AI Interview (Questionnaire)
  → 10 questions scored by Claude API
  → InterviewCredential issued to DID on pass
    ↓
Step 4: Wallet Connection
  → ThirdWeb ConnectButton
  → User warned: wallet change = full re-verification
  → Wallet address stored against Clerk user ID in NeonDB
  → Nominis on-chain wallet screening runs in background
    ↓
Dashboard — trading enabled
```

---

## Onboarding State Machine

```
REGISTERED
  → KYC_PENDING   → KYC_PASSED
                  → KYC_REJECTED (reason shown, reapply after 30 days)
  → EDD_PENDING   → EDD_PASSED
                  → EDD_REJECTED (reason shown, reapply after 30 days)
  → INTERVIEW_PENDING → INTERVIEW_PASSED
                      → INTERVIEW_REJECTED (reason shown, reapply after 30 days)
  → WALLET_PENDING → VERIFIED_MEMBER
```

Steps are sequential — each step is locked until the previous passes. A user who fails a step cannot proceed and must wait before reapplying.

---

## Verifiable Credentials (VCs)

Each passed step issues a Verifiable Credential (VC) to the user's DID:
- `KYCCredential` — issued after Didit KYC passes
- `EDDCredential` — issued after bank statement ML scoring passes
- `InterviewCredential` — issued after AI interview passes

At trade time, the platform cryptographically verifies all 3 credentials from the user's DID. Any missing or expired credential blocks trading and triggers re-verification.

All credentials expire after **6 months**. Users must re-verify to continue trading.

---

## Privacy

Raw Aadhaar, PAN, and bank statements are never persisted on CryptoBazaar servers. The platform stores:
- Clerk user ID (from Google OAuth)
- DID (created via Hyperledger Identus on first login)
- Wallet address (after step 4)
- Onboarding status per step
- Credential metadata (type, issued_at, expires_at) — not the credential content itself

All sensitive data is processed in-flight and discarded after the VC is issued.

---

## Route Protection

| Route | Access |
|---|---|
| `/` | Public |
| `/login` | Public (redirect to /onboarding if already signed in) |
| `/onboarding/*` | Auth required |
| `/dashboard/*` | Auth + all 4 steps complete |
| `/api/*` | Auth required (Clerk session token verified server-side) |

---

## Tech
- **Auth:** Clerk (Google OAuth only)
- **Wallet connection:** ThirdWeb SDK
- **DID creation:** Hyperledger Identus TypeScript SDK
- **DID registry:** Cardano / Prism blockchain
- **VC issuance:** Identus Cloud Agent
- **KYC:** Didit API
- **Bank statement ML:** Perfios / Authbridge
- **AI Interview:** Claude API
- **Wallet screening:** Nominis
- **Database:** NeonDB — stores Clerk user ID ↔ DID ↔ wallet address + onboarding status
