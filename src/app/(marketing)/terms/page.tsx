export const metadata = {
  title: 'Terms & Conditions — CryptoBazaar',
  description: 'Terms and conditions for using the CryptoBazaar platform.',
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using CryptoBazaar ("Platform", "we", "us", or "our"), you agree to be bound by these Terms and Conditions. If you do not agree, do not use the Platform. These Terms constitute a legally binding agreement between you and CryptoBazaar.

CryptoBazaar is operated as a peer-to-peer facilitation platform. It is not a regulated exchange, bank, payment aggregator, or financial institution.`,
  },
  {
    title: '2. Eligibility',
    content: `You must be at least 18 years of age and a resident of India to use the Platform. You must provide accurate identity information during the Enhanced Due Diligence (EDD) process, including Aadhaar and PAN verification.

You are prohibited from using the Platform if you are subject to any sanctions, have been convicted of financial fraud, money laundering, or related offences, or are acting on behalf of a prohibited entity.`,
  },
  {
    title: '3. Verification Requirements',
    content: `Access to trading requires successful completion of all three EDD layers:

Layer 1 — KYC: Aadhaar OTP, PAN match, and liveness check via HyperVerge.
Layer 2 — Bank Statement EDD: 6 months of bank statements scored by an ML model for AML risk patterns.
Layer 3 — AI Interview: Text questionnaire evaluating source of funds, trading purpose, and expected volume.

All three layers must be passed and unexpired for trading to be permitted. Credentials expire every 6 months and require re-verification. CryptoBazaar reserves the right to reject any application without providing reasons.`,
  },
  {
    title: '4. Platform Role',
    content: `CryptoBazaar acts solely as a facilitator of peer-to-peer trades. The Platform:

- Verifies and gates users through EDD
- Coordinates trade listings and matching
- Holds seller's USDT/USDC in smart contract escrow during an active trade
- Resolves disputes using verified bank data
- Manages the insurance fund

The Platform does NOT:
- Hold user funds outside of active trade escrow
- Touch, receive, convert, or transmit INR
- Operate as a payment gateway, aggregator, or licensed money transmitter
- Guarantee any trade outcome or profit`,
  },
  {
    title: '5. Subscription',
    content: `Trading requires an active monthly subscription. Current tiers are Starter (₹200/month, ₹5 lakh cap), Trader (₹500/month, ₹20 lakh cap), and Pro (₹1,000/month, unlimited cap).

Subscriptions are collected via UPI or Stripe. Subscriptions auto-expire at the end of the billing period and do not auto-renew. Non-payment results in suspended trading access. EDD credentials are not affected by subscription lapse.

Subscription fees are non-refundable once trading access has been activated. See the Refund Policy for full details.`,
  },
  {
    title: '6. Trade Execution',
    content: `When a trade is initiated:

1. The seller's USDT/USDC is locked in a smart contract escrow
2. The buyer sends INR directly to the seller's bank account via UPI, IMPS, or NEFT
3. The buyer submits the UTR number on the Platform
4. The seller manually verifies receipt in their bank account and confirms
5. The smart contract releases USDT/USDC to the buyer's wallet
6. 0.75% of the trade value is automatically transferred to the insurance fund contract

CryptoBazaar does not verify or process any fiat payment. The Platform provides a coordination layer. If the seller does not respond within 15 minutes of buyer marking paid, the trade enters dispute.`,
  },
  {
    title: '7. Disputes',
    content: `Either party may raise a dispute. Both parties must submit bank statements for the relevant period. Statements are verified for tampering using Perfios/Authbridge.

Submission of a tampered or forged bank statement results in immediate ruling against that party, permanent account ban, and potential referral to law enforcement. Users are fully identified via Aadhaar and PAN.

CryptoBazaar's compliance team reviews verified statements and issues a final ruling. Rulings are binding and not subject to external arbitration. The losing party in two disputes receives a permanent ban.`,
  },
  {
    title: '8. Insurance Fund',
    content: `The insurance fund is available to Verified Members with an active subscription who have been members for at least 90 days. Claims require:

- Active subscription at the time of the frozen trade
- Valid (unexpired) EDD credential at the time of the trade
- Confirmed on-chain trade record
- Police notice or bank freeze letter directly attributable to the specific trade

Maximum payouts: ₹10,000 (Emergency, 24h), ₹1,00,000 (Standard, 7 days), ₹5,00,000 (Full, 30 days). Maximum 2 claims per user per year. Fraudulent claims result in permanent ban and legal action.`,
  },
  {
    title: '9. Prohibited Activities',
    content: `You must not:

- Use the Platform to launder money or finance illegal activities
- Submit false, forged, or altered documents during EDD or dispute resolution
- Attempt to circumvent verification requirements
- Use the Platform on behalf of a third party without their knowledge
- Attempt to manipulate trade outcomes
- Reverse-engineer or exploit Platform systems
- Create multiple accounts
- Engage in structuring or smurfing transactions

Violations result in immediate account suspension, permanent ban, forfeiture of escrowed funds where legally permissible, and referral to law enforcement.`,
  },
  {
    title: '10. Data & Privacy',
    content: `CryptoBazaar processes your identity documents (Aadhaar, PAN, bank statements) only during EDD verification. After a Verifiable Credential is issued, the raw data is not retained. Your on-chain identity (DID) is the only identifier stored.

By using the Platform, you consent to data processing as described. You have rights under the Digital Personal Data Protection Act, 2023 (DPDPA). Contact compliance@cryptobazaar.co.in for data requests.`,
  },
  {
    title: '11. Limitations of Liability',
    content: `To the maximum extent permitted by applicable law, CryptoBazaar shall not be liable for:

- Losses arising from market price movements
- Bank account freezes or legal actions by third parties
- Losses due to smart contract bugs or blockchain network issues beyond our control
- Acts of the counterparty in a trade
- Force majeure events

The Platform's total liability to any user shall not exceed the subscription fees paid in the 3 months preceding the claim.`,
  },
  {
    title: '12. Amendments',
    content: `These Terms may be updated at any time. Continued use after 15 days of notification constitutes acceptance of the updated Terms. Material changes will be communicated by email and an in-app notice.`,
  },
  {
    title: '13. Governing Law',
    content: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [City], India. Users agree to first attempt resolution through the Platform's compliance team before initiating legal proceedings.`,
  },
  {
    title: '14. Contact',
    content: `For legal inquiries: legal@cryptobazaar.co.in
For compliance: compliance@cryptobazaar.co.in
For support: support@cryptobazaar.co.in`,
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-dvh pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Legal</p>
          <h1 className="text-3xl font-bold text-zinc-50 mb-2">Terms & Conditions</h1>
          <p className="text-sm text-zinc-500">
            Last updated: May 2026 · Effective immediately upon account creation
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 mb-10 text-sm text-zinc-400 leading-relaxed">
          Please read these Terms and Conditions carefully before creating an account or trading on
          CryptoBazaar. By registering, you confirm you have read, understood, and agree to be bound
          by these Terms.
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold text-zinc-200 mb-3">{section.title}</h2>
              <p className="text-sm text-zinc-400 leading-[1.8] whitespace-pre-line">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
