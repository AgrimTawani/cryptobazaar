# Layer 2 — Bank Statement EDD

## What it does
Analyses 6 months of a user's bank transaction history to detect patterns associated with money laundering, tainted funds, or illicit activity — before they are allowed on the platform.

---

## How it works

### Input
User uploads last 6 months of bank statements as PDF, or consents to share via India's Account Aggregator framework (if available).

### Step 1 — Tampering Detection
Perfios or Authbridge ingests the PDF and immediately checks for document tampering:
- PDF metadata validation (font, spacing, formatting against known bank templates)
- Digital signature validation (most Indian banks sign their PDFs)
- Pixel-level anomaly detection for edited fields

A tampered statement results in immediate rejection and permanent ban.

### Step 2 — Parsing
If clean, the API extracts all transactions into structured JSON:
- Date, amount, direction (credit/debit)
- Counterparty name, UPI ID, or IFSC code
- Transaction category (salary, UPI, NEFT, IMPS, cash, etc.)

### Step 3 — Feature Engineering
The ML pipeline computes risk features from the parsed transactions:

| Feature | What it detects |
|---|---|
| Transaction velocity | Unusually high number of transactions per day/week |
| Structuring score | Many transactions just below ₹50,000 or ₹1,00,000 thresholds |
| Rapid pass-through ratio | Money received and sent out within 4 hours |
| Counterparty concentration (HHI) | All money coming from a small number of unknown sources |
| Cash deposit ratio | Large cash deposits before crypto purchases |
| Income mismatch | Monthly inflows inconsistent with stated occupation/income |
| Unknown counterparty ratio | High proportion of senders with no transaction history |

### Step 4 — ML Scoring
**Phase 1:** XGBoost classifier trained on synthetic AML datasets (IBM AMLSim, AMLNet, PaySim). Outputs a risk score 0–100 and a list of the top contributing features.

**Phase 2:** Graph Neural Network (GNN) layer added. Models accounts as nodes and transactions as edges to detect multi-hop laundering patterns invisible to tabular models.

### Risk Thresholds
| Score | Action |
|---|---|
| 0–40 | Auto-approved |
| 41–70 | Sent to human compliance reviewer |
| 71+ | Rejected |

### Outcome
**Pass:** `EDDCredential` VC issued to the user's DID:
```
{
  type: "EDDCredential",
  score: <0-100>,
  riskTier: "LOW",
  issuedAt: <timestamp>,
  validUntil: <6 months>
}
```

**Fail:** Specific reason shown (e.g., "High-velocity pass-through transactions detected", "Structuring pattern identified"). User can reapply after 30 days with a new set of statements.

### Re-verification
EDD credentials expire every 6 months. Users must re-upload statements to continue trading. If a user's on-platform behaviour raises their risk score significantly (e.g., frequent disputes, suspicious trade patterns), re-verification is triggered early.

### Use in Disputes
The same Perfios/Authbridge tampering detection is used when bank statements are submitted as dispute evidence. A tampered statement submitted during a dispute results in an immediate ruling against that party and a permanent ban.

---

## Tech
- **Statement parsing & tampering detection:** Perfios API or Authbridge BSA API
- **ML model (Phase 1):** XGBoost, trained on IBM AMLSim + AMLNet + PaySim
- **ML model (Phase 2):** PyTorch Geometric (GraphSAGE / Heterogeneous GNN)
- **ML service:** Python 3.12 + FastAPI, deployed on Railway
- **Credential issuance:** Hyperledger Identus
