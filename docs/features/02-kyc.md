# Layer 1 — KYC

## What it does
Verifies that the user is who they say they are using government-issued Indian identity documents and a liveness check.

---

## How it works

### Documents Verified
- Aadhaar — OTP-based verification via UIDAI
- PAN — matched against the Aadhaar name
- Liveness check — real-time selfie analysis to confirm the person is physically present and not using a photo or video

All three must pass. A mismatch between Aadhaar and PAN names, or a failed liveness check, results in rejection.

### Provider
HyperVerge handles all KYC checks. They are an Indian KYC provider natively integrated with UIDAI and the Indian document ecosystem.

### Outcome
**Pass:** CryptoBazaar issues a `KYCCredential` VC to the user's DID:
```
{
  type: "KYCCredential",
  level: 3,
  provider: "HyperVerge",
  issuedAt: <timestamp>,
  validUntil: <6 months>
}
```

**Fail:** Specific reason shown to the user (e.g., "Aadhaar OTP verification failed", "Liveness check failed"). User can reapply after 30 days.

### What CryptoBazaar stores
Nothing. The KYC check happens via HyperVerge's API. CryptoBazaar receives a pass/fail result and the issued VC. No Aadhaar number, PAN number, or selfie is stored on CryptoBazaar's servers.

---

## Tech
- **KYC provider:** HyperVerge API
- **Credential issuance:** Hyperledger Identus
- **Duration:** ~3 minutes for the user
