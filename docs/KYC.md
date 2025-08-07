# KYC Integration Guide for CryptoBazar

## Overview

This document outlines how to integrate advanced KYC (Know Your Customer) verification using third-party providers like **HyperVerge**, **IDfy**, and **Sumsub** into the CryptoBazar platform.

---

## Current Architecture Summary (from README)

* **Frontend**: Next.js 13+
* **Backend**: Node.js + Express
* **Database**: PostgreSQL
* **KYC features already included**:

  * Document verification
  * Face recognition
  * Address verification
  * PEP screening
  * Risk scoring

---

## Third-Party KYC Providers

### 1. HyperVerge

* Full RBI-compliant video KYC
* ID OCR, face match, liveness detection
* Supports both automated and agent-assisted verification
* Used by INDMoney, Navi, KreditBee

### 2. IDfy

* Offers automated and live agent video KYC
* Real-time document verification
* Encrypted video and selfie storage
* Compliant with Indian regulations

### 3. Sumsub

* Global AML/KYC provider
* Supports video verification and liveness checks
* Works across multiple compliance jurisdictions
* May require configuration for Indian KYC norms

---

## Integration Steps

### Step 1: Choose Provider

E.g., HyperVerge

### Step 2: Backend API Setup

```ts
// /api/kyc/start
import axios from 'axios';

export const startKYC = async (req, res) => {
  try {
    const { userId } = req.body;

    const response = await axios.post('https://api.hyperverge.co/v2/verifyKyc', {
      userId,
      redirect_url: 'https://cryptobazar.com/kyc/callback',
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.HYPERVERGE_API_KEY}`
      }
    });

    res.json({ kycUrl: response.data.redirect_url });
  } catch (err) {
    res.status(500).json({ error: 'KYC initiation failed' });
  }
};
```

### Step 3: Frontend Hook

```ts
export const useKYC = () => {
  const startKYCProcess = async (userId: string) => {
    const res = await fetch('/api/kyc/start', {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.kycUrl) {
      window.location.href = data.kycUrl;
    }
  };

  return { startKYCProcess };
};
```

### Step 4: Database Schema

```prisma
model KYCStatus {
  id        Int      @id @default(autoincrement())
  userId    Int
  status    String
  provider  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Step 5: Webhook Endpoint

```ts
app.post('/api/kyc/callback', async (req, res) => {
  const { userId, status } = req.body;

  await prisma.kYCStatus.update({
    where: { userId },
    data: { status },
  });

  res.status(200).send('KYC status updated');
});
```

### Step 6: Gate Access

```ts
const kyc = await prisma.kYCStatus.findFirst({ where: { userId } });
if (kyc?.status !== 'verified') {
  return res.status(403).json({ error: 'KYC not verified' });
}
```

---

## Video KYC Support Comparison

| Feature                  | HyperVerge | IDfy | Sumsub           |
| ------------------------ | ---------- | ---- | ---------------- |
| Automated Video KYC      | ✅          | ✅    | ✅                |
| Agent-Assisted Video KYC | ✅          | ✅    | ⚠️ Optional      |
| India Regulatory Focus   | ✅          | ✅    | ⚠️ Needs tuning  |
| Real-time Liveness Check | ✅          | ✅    | ✅                |
| Compliance (RBI/SEBI)    | ✅          | ✅    | ❌ (global focus) |

---

## Conclusion

Integrating a robust third-party KYC provider like HyperVerge or IDfy will significantly enhance security, compliance, and user trust in CryptoBazar. These providers offer real-time video verification, PEP screening, and liveness checks, and can be integrated via API with callback support.

Would recommend HyperVerge for Indian P2P crypto platforms needing RBI-compliant video KYC.

---

For further improvements:

* Add KYC attempt limits
* Store audit logs for video sessions
* Automate fallback to human agent if liveness fails
