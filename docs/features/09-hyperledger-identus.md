# Hyperledger Identus — Decentralised Identity Layer

## In Simple Terms

Every time a user passes a verification step on CryptoBazaar, Identus issues them a digital certificate that proves it. Like a badge that says "this person passed KYC on this date" — but one that is mathematically impossible to fake or tamper with because it's signed cryptographically and recorded on a blockchain.

### Why users would want it

Right now when you do KYC on Binance, that data sits on Binance's servers. If Binance gets hacked, your Aadhaar and PAN are leaked. If Binance shuts down, your verification history is gone.

With Identus, **your verification lives with you, not with CryptoBazaar.**

Three practical benefits for the user:

1. **Privacy** — CryptoBazaar never stores your Aadhaar, PAN, or bank statements. Once you're verified, all the platform holds is a cryptographic badge. Your sensitive data is not sitting in a startup's database waiting to be leaked.

2. **Proof when you need it** — If your bank gets frozen and you need to prove you were a legitimate, fully-verified trader at the time of the transaction, your credentials are on-chain and undeniable. No "the platform lost our records" situation.

3. **One-time verification (future)** — Eventually your CryptoBazaar verification badge could be accepted by other platforms. You did the hard work once, you don't repeat it everywhere. Think of it like a verified passport that works across multiple services.

> Identus makes sure your verified status is yours — not stored by us, not dependent on us staying in business, and provable to anyone without revealing your personal details.

---

## What it does (technical)
Gives every CryptoBazaar user a self-sovereign digital identity (DID) and issues cryptographically verifiable certificates (VCs) for each EDD layer they pass. The platform never stores raw personal data — only the DID. All verification results live as tamper-proof credentials attached to the user's identity.

---

## Core Concepts

### DID (Decentralised Identifier)
A unique identifier for a user that lives on the Cardano/Prism blockchain. It looks like:
```
did:prism:abc123def456...
```
It is not tied to any email, phone number, or personal detail. It is owned by the user and controlled by CryptoBazaar on their behalf (custodial DID in Phase 1, user-held wallet in Phase 2).

### Verifiable Credential (VC)
A cryptographically signed digital certificate issued by CryptoBazaar to a user's DID. Think of it as a tamper-proof badge. Each VC states a specific fact about the user — "passed KYC", "passed EDD", "passed interview" — signed with CryptoBazaar's private key.

VCs cannot be faked. Anyone can verify a VC's authenticity by checking the cryptographic signature against CryptoBazaar's known DID on-chain.

---

## The 3 Credentials Issued

| Credential | Issued When | Expires |
|---|---|---|
| `KYCCredential` | HyperVerge KYC passes | 6 months |
| `EDDCredential` | Bank statement ML scoring passes | 6 months |
| `InterviewCredential` | AI interview passes | 6 months |

All 3 must be present and unexpired for a user to trade.

---

## How it works — Step by Step

### 1. DID Creation (on first wallet connection)
When a user connects their wallet for the first time, the platform calls the Identus Cloud Agent API to create a DID for them:

```
POST /cloud-agent/v1/did-registrar/dids

Body: {
  documentTemplate: {
    publicKeys: [
      { id: "auth-key", purpose: "authentication" },
      { id: "issue-key", purpose: "assertionMethod" }
    ]
  }
}

Response: {
  longFormDid: "did:prism:abc123...",
  status: "CREATED"
}
```

The `longFormDid` is stored in NeonDB against the user's wallet address. This is the only identifier CryptoBazaar stores for the user.

### 2. VC Issuance (after each EDD layer passes)
When a user passes an EDD layer, the platform issues a VC to their DID via the Identus agent:

```
POST /cloud-agent/v1/issue-credentials/credential-offers

Body: {
  credentialFormat: "JWT",
  claims: {
    type: "KYCCredential",
    level: 3,
    provider: "HyperVerge",
    issuedAt: "2026-05-03T10:00:00Z",
    validUntil: "2026-11-03T10:00:00Z"
  },
  issuingDID: "<CryptoBazaar's issuer DID>",
  subjectId: "<user's DID>"
}
```

The VC is signed with CryptoBazaar's private key and associated with the user's DID on-chain.

### 3. VC Verification (at trade time)
Before any trade, the platform verifies all 3 credentials for both parties:

```
POST /cloud-agent/v1/present-proof/presentations

Checks:
- All 3 credential types are present
- Each credential is signed by CryptoBazaar's issuer DID
- None are expired
- The subject DID matches the trading user
```

If any check fails → trading blocked.

### 4. VC Revocation (on ban or re-verification trigger)
If a user is banned or their risk score triggers early re-verification, their credentials are revoked via the Identus agent. Revoked credentials fail verification immediately, blocking them from trading until new credentials are issued after re-verification.

---

## Why this approach

### No raw data stored
CryptoBazaar processes Aadhaar, PAN, bank statements, and interview responses in-flight. After a VC is issued, none of this data is kept. The VC is the only proof of verification. This is structural DPDPA compliance — the data protection law is satisfied by design, not by policy.

### Reusable credentials (Phase 2)
In a future phase, users could present their CryptoBazaar-issued VCs to other platforms that accept them — porting their verified status without re-doing KYC. Other platforms can verify the VC's cryptographic signature against CryptoBazaar's public DID.

### Audit trail without data
If a user's bank gets frozen and they file an insurance claim, they can prove they were a Verified Member at the time of the trade by presenting their DID and credentials. The claim is verifiable on-chain without CryptoBazaar needing to produce any stored personal data.

---

## Tech
- **SDK:** Hyperledger Identus TypeScript SDK (`@hyperledger/identus-sdk`)
- **Agent:** Identus Cloud Agent (self-hosted or cloud)
- **DID method:** `did:prism` (Cardano-anchored)
- **Credential format:** JWT VCs (W3C standard)
- **Storage:** NeonDB stores wallet address ↔ DID mapping only
- **Integration points:** Called from the Hono API after each EDD layer decision
