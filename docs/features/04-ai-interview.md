# Layer 3 — AI Interview

## What it does
Assesses whether the user has a legitimate reason for doing regular P2P crypto transactions and whether their stated source of funds is consistent with their bank statement EDD results.

---

## How it works

### Step 1 — Text Questionnaire
User fills in a structured questionnaire:
1. What is your primary source of income?
2. Why do you want to do regular P2P crypto transactions?
3. What is your expected monthly trading volume in INR?
4. What will you use the USDT/USDC for after purchase?
5. Have you previously traded crypto on any other platform? If yes, which ones?

### Step 2 — LLM Scoring
Claude API scores the responses across 3 dimensions:
- **Consistency** — do the answers align with each other and with the EDD bank statement results? (e.g., claiming to be a salaried employee but stating ₹20L/month trading volume)
- **Plausibility** — are the reasons given realistic and coherent?
- **Red flags** — evasive language, contradictions, stated purposes that are high-risk (e.g., "I receive payments from overseas clients in cash")

Each dimension scored 0–100. A combined score is computed.

### Step 3 — Decision
| Combined Score | Action |
|---|---|
| Above threshold | Auto-approved |
| Borderline | Escalated to video interview |
| Below threshold | Rejected with specific reason |

### Step 4 — Video Interview (borderline cases only)
User records short video answers to 5–6 questions. AI analyses the content and flags it for human review. A compliance reviewer watches the video and makes the final call within 24–48 hours.

### Outcome
**Pass:** `InterviewCredential` VC issued to the user's DID:
```
{
  type: "InterviewCredential",
  purpose: "legitimate_trader",
  issuedAt: <timestamp>,
  validUntil: <6 months>
}
```

**Fail:** Specific reason shown (e.g., "Stated trading volume is inconsistent with declared income"). User can reapply after 30 days.

---

## Tech
- **LLM scoring:** Claude API (claude-sonnet-4-6)
- **Video storage (borderline cases):** IPFS
- **Credential issuance:** Hyperledger Identus
- **Human review:** Internal compliance dashboard
