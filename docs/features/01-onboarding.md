# Onboarding & Identity

## What it does
Creates a unique decentralised identity (DID) for every new user and ties all verification credentials to it. CryptoBazaar never stores raw personal data — only the DID.

---

## How it works

### Wallet Connection
User connects their crypto wallet via ThirdWeb SDK. The wallet address becomes the user's login identifier — no email, no password.

### DID Creation
On first connection, the platform calls the Hyperledger Identus agent to create a DID (Decentralised Identifier) for the user. This DID is an address on the Cardano/Prism network that uniquely represents the user.

The DID is stored in NeonDB against the wallet address. That's the only record CryptoBazaar holds on the user at this stage.

### Verifiable Credentials (VCs)
Each time a user passes an EDD layer, CryptoBazaar issues a Verifiable Credential (VC) to their DID. A VC is a cryptographically signed statement — like a digital certificate — that says "this user passed X check on Y date."

The 3 credentials issued through onboarding:
- `KYCCredential` — issued after HyperVerge KYC passes
- `EDDCredential` — issued after bank statement ML scoring passes
- `InterviewCredential` — issued after AI interview passes

### Credential Verification at Trade Time
When a user tries to trade, the platform cryptographically verifies all 3 credentials from their DID. If any are missing or expired, trading is blocked and re-verification is triggered.

### Credential Expiry
All credentials expire after 6 months. Users must re-verify to continue trading. This ensures the platform's member data stays current.

### Onboarding State Machine
```
REGISTERED
  → KYC_PENDING → KYC_PASSED
               → REJECTED (reason shown, reapply after 30 days)
  → EDD_PENDING → EDD_PASSED
               → REJECTED (reason shown, reapply after 30 days)
  → INTERVIEW_PENDING → VERIFIED_MEMBER
                      → REJECTED (reason shown, reapply after 30 days)
```

### Privacy
Raw Aadhaar, PAN, and bank statements are never persisted on CryptoBazaar servers. The platform only stores the DID. All sensitive data is processed in-flight and discarded after the VC is issued.

---

## Tech
- **Wallet connection:** ThirdWeb SDK
- **DID creation:** Hyperledger Identus TypeScript SDK
- **DID registry:** Cardano / Prism blockchain
- **VC issuance:** Identus Cloud Agent
- **Database:** NeonDB — stores wallet address ↔ DID mapping and onboarding status
