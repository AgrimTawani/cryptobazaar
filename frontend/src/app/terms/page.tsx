import Link from "next/link";

export const metadata = {
  title: "Terms of Use — CryptoBazaar",
  description: "Full Terms of Use for CryptoBazaar, the gated P2P stablecoin exchange for India.",
};

const SECTIONS = [
  {
    id: "agreement",
    title: "1. Agreement to Terms",
    content: `By accessing or using CryptoBazaar ("the Platform", "we", "us", "our"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree, you must not use the Platform.

These Terms form a legally binding agreement between you and CryptoBazaar. By completing registration, you confirm that you have read, understood, and accepted these Terms in full.

We reserve the right to update these Terms at any time. Continued use of the Platform after changes are published constitutes acceptance of the revised Terms. We will notify active members of material changes via email or an in-app notice.`,
  },
  {
    id: "definitions",
    title: "2. Definitions",
    content: `"Verified Member" — A user who has successfully completed all three layers of verification: KYC, Enhanced Due Diligence (bank statement review), and the AI-scored interview.

"Trade" — A peer-to-peer transaction between a Verified Member seller and a Verified Member buyer, facilitated by the Platform's escrow smart contract.

"Escrow Contract" — A self-executing smart contract deployed on a public blockchain that holds the seller's crypto until the trade is confirmed or resolved.

"Member Protection Fund" ("the Fund") — A voluntary, discretionary benefit pool funded by 0.75% of every completed trade, held in a separate on-chain contract. Not an insurance product.

"Membership Plan" — A monthly subscription (Starter, Trader, or Pro) that grants trading access and defines monthly volume limits.

"UTR" — Unique Transaction Reference number issued by NPCI for every UPI, IMPS, or NEFT payment.

"DID" — Decentralised Identifier created via Hyperledger Identus on behalf of each Verified Member to hold their verifiable credentials.`,
  },
  {
    id: "eligibility",
    title: "3. Eligibility",
    content: `You may use CryptoBazaar only if all of the following are true:

(a) You are a resident of India.
(b) You are 18 years of age or older and have the legal capacity to enter into binding contracts.
(c) You are not a politically exposed person (PEP) as defined under PMLA 2002, or if you are, you have disclosed this during verification.
(d) You are not subject to any sanction, restriction, or prohibition under Indian law or any applicable international framework.
(e) You are trading on your own behalf and not as an agent, nominee, or representative of any other person or entity.
(f) Your use of the Platform does not violate any law or regulation applicable to you.

Verification of eligibility is ongoing. If your circumstances change such that you no longer meet these criteria, you must immediately cease trading and notify us at support@cryptobazaar.in.`,
  },
  {
    id: "account",
    title: "4. Account Registration and Verification",
    content: `4.1 Registration
You must sign in via Google OAuth to create an account. You are responsible for all activity under your account. You must not share your account credentials or access with any other person.

4.2 Three-Layer Verification
Before trading, you must complete:
— Layer 1 (KYC): Identity verification via Didit using Aadhaar, PAN, and a liveness check.
— Layer 2 (EDD): Upload of 6 months of bank statements, analysed by our ML system for red flags.
— Layer 3 (Interview): A 10-question online interview scored by AI.

All three layers must pass for Verified Member status to be granted.

4.3 Wallet Binding
You must connect a cryptocurrency wallet. This wallet address is permanently bound to your account. If you change your wallet, all verification credentials are invalidated and you must restart the full verification process. This policy exists because wallet history is a key component of risk assessment.

4.4 Credential Validity
Verification credentials expire after 6 months. You must renew all three layers to continue trading. Failure to renew results in trading access being suspended until renewal is complete.

4.5 Accuracy of Information
You represent that all information provided during registration and verification is true, accurate, and complete. Providing false, misleading, or fraudulent information is a serious breach of these Terms and may result in permanent suspension and reporting to relevant authorities.`,
  },
  {
    id: "membership",
    title: "5. Membership Plans",
    content: `5.1 Plan Tiers
Access to trading requires an active Membership Plan:
— Starter: ₹200/month, ₹5,00,000 monthly trade cap
— Trader: ₹500/month, ₹20,00,000 monthly trade cap
— Pro: ₹1,000/month, no trade cap

5.2 Payment
Membership fees are currently collected via UPI transfer to our registered business account. Payment instructions are provided after verification is complete. Plans are month-to-month. No automatic renewals occur without your explicit confirmation and payment.

5.3 Cap Enforcement
Your cumulative INR trade volume within a billing month is tracked. When you approach your cap, you will be notified. If you reach it, new trades are blocked until the next billing cycle or you upgrade your plan.

5.4 Refunds
Membership fees are non-refundable once a billing period has begun, unless we are unable to provide access to the Platform for more than 72 consecutive hours due to a fault on our side. Any refund requests must be submitted to support@cryptobazaar.in within 7 days of the fee being paid.

5.5 Member Protection Fund Eligibility
An active Membership Plan at the time of a trade is a prerequisite for eligibility to request a disbursement from the Member Protection Fund. A lapsed subscription at the time of the relevant trade disqualifies a claim.`,
  },
  {
    id: "trading",
    title: "6. Trade Rules and Escrow",
    content: `6.1 Pre-Trade Checks
Before any trade begins, the Platform verifies:
(a) Both parties are Verified Members with valid, unexpired credentials.
(b) Both parties have active Membership Plans.
(c) Both wallet addresses pass Nominis on-chain screening (checked against known mixers, hacked wallets, darknet markets, and sanctioned addresses).

If any check fails, the trade is blocked. The reason is shown to the affected party.

6.2 Escrow Mechanics
When a trade is initiated:
(a) A smart contract is deployed on the relevant blockchain.
(b) The seller deposits crypto into the escrow contract.
(c) From this point, neither party can cancel the trade without going through the Platform's resolution process.
(d) The buyer sends INR directly to the seller's bank account via UPI, IMPS, or NEFT.

6.3 Payment Window
The buyer has 30 minutes from trade initiation to submit payment and enter the UTR number. If this window expires without payment being marked, the trade is cancelled automatically and the crypto is returned to the seller.

6.4 Confirmation Window
Once the buyer marks "I have paid", the seller has 15 minutes to:
(a) Confirm receipt — the smart contract releases crypto to the buyer, and 0.75% is sent to the Member Protection Fund contract; or
(b) Raise a dispute — the trade enters dispute resolution.

If the seller does not respond within 15 minutes, the trade automatically escalates to dispute resolution.

6.5 Irreversibility
Once the buyer has marked payment, the seller cannot cancel the trade. This is a deliberate design choice to protect buyers against the most common P2P fraud — a seller cancelling after receiving funds.

6.6 Platform Role
CryptoBazaar is a technology facilitator. We do not process, hold, or control INR payments between parties. We do not hold custody of crypto at any point during a trade. The smart contract operates independently on the public blockchain.`,
  },
  {
    id: "disputes",
    title: "7. Dispute Resolution",
    content: `7.1 When a Dispute Arises
A dispute is triggered when:
(a) The seller raises a dispute after the buyer marks payment.
(b) The seller fails to respond within the 15-minute confirmation window.
(c) Either party raises a formal complaint within 24 hours of a trade expiring.

7.2 Evidence Submission
Both parties are given 24 hours to submit evidence:
— Bank statements covering the date of the trade (PDF).
— Any additional context.

Screenshots are accepted as supplementary context only. Bank statements are the primary evidence.

7.3 Tampering Detection
All submitted PDFs are run through Perfios/Authbridge for:
— PDF metadata validation.
— Digital signature verification.
— Anomaly detection (font inconsistencies, image layers over text, known manipulation patterns).

Submitting a tampered or forged document results in immediate ruling against that party, permanent suspension, and may result in a criminal complaint being filed. All users are Aadhaar-linked and fully identified.

7.4 Cross-Reference Analysis
A genuine payment appears on both parties' bank statements. The Platform's compliance team cross-references the buyer's debit against the seller's credit. The UTR provides an additional reference point. The outcome is almost always unambiguous from bank data alone.

7.5 Ruling and Execution
The compliance team issues a ruling:
— Payment confirmed: crypto released to buyer via smart contract.
— Payment not confirmed: crypto returned to seller via smart contract.

The losing party's account is flagged. A second dispute loss within 12 months results in permanent suspension.

7.6 Finality
Dispute rulings are final. If you believe a ruling was made in error, you may appeal in writing to disputes@cryptobazaar.in within 7 days. Appeals are reviewed by a senior compliance officer. The appeal decision is final.`,
  },
  {
    id: "fund",
    title: "8. Member Protection Fund",
    content: `8.1 Nature of the Fund
The Member Protection Fund ("the Fund") is a voluntary, discretionary benefit available to eligible Verified Members.

THE FUND IS NOT AN INSURANCE PRODUCT. IT IS NOT REGULATED AS ONE. IT DOES NOT CONSTITUTE A FINANCIAL GUARANTEE, POLICY, OR CONTRACT OF INDEMNITY. PAYOUTS FROM THE FUND ARE NOT GUARANTEED.

8.2 Fund Construction
0.75% of the value of every completed trade is automatically transferred from the escrow contract to the Fund contract at settlement. The Fund is held on-chain. CryptoBazaar cannot spend it without multisig approval from a minimum of 3 of 5 designated signatories.

8.3 Eligibility to Request a Disbursement
All four conditions must be satisfied:
(a) You had an active Membership Plan at the time of the trade that caused the freeze.
(b) You had valid (unexpired) EDD and KYC credentials at the time of the trade.
(c) The trade was executed through CryptoBazaar's escrow smart contract — on-chain verifiable.
(d) The bank freeze is directly and demonstrably attributable to that specific CryptoBazaar trade, evidenced by a police notice or official bank freeze letter citing the transaction.

8.4 Disbursement Tiers
Subject to fund availability and approval:
— Emergency: Up to ₹10,000 within 24 hours. Requires: freeze notice + FIR/complaint number.
— Standard: Up to ₹1,00,000 within 7 days. Requires: above + proof of legal representation.
— Full: Up to ₹5,00,000 within 30 days. Requires: above + account unfrozen or NOC issued.

Disbursement amounts are subject to the Fund's available balance at the time of approval. If the Fund cannot cover the full approved amount, a partial disbursement may be made.

8.5 Anti-Abuse Rules
— Maximum 2 disbursement requests per member per 12-month period.
— A 90-day waiting period applies from the date of becoming a Verified Member before a first request may be submitted. This prevents "join-and-claim" abuse.
— All requests are cross-checked against on-chain trade records. No on-chain trade record means no disbursement.
— Fraudulent disbursement requests (fabricated freeze notices, false information) result in permanent suspension and may result in criminal complaint.

8.6 Scope Limitations
The Fund does not cover:
— Losses from cryptocurrency price movements.
— Bank freezes caused by transactions unrelated to CryptoBazaar.
— Losses from your own negligence (e.g., sharing private keys, trading outside the Platform).
— Tax liabilities arising from your trading activity.
— Events of force majeure.

8.7 No Fiduciary Duty
CryptoBazaar's administration of the Fund does not create a fiduciary duty, trust relationship, or any other special duty of care beyond what is expressly set out in these Terms.`,
  },
  {
    id: "prohibited",
    title: "9. Prohibited Activities",
    content: `You must not use CryptoBazaar for any of the following:

(a) Money laundering or any activity that violates the Prevention of Money Laundering Act (PMLA) 2002 or any successor legislation.
(b) Tax evasion or concealment of taxable income or assets.
(c) Financing of terrorism or any activities prohibited under the Unlawful Activities (Prevention) Act.
(d) Trading on behalf of sanctioned individuals, entities, or jurisdictions.
(e) Using another person's identity, bank account, or wallet without their knowledge and consent.
(f) Manipulating trade outcomes — including submitting false UTRs, fabricating bank statements, or coordinating with a counterparty to deceive the Platform.
(g) Circumventing verification checks through technical means or third-party services.
(h) Posting listings for assets other than those supported by the Platform.
(i) Any other activity that is illegal under Indian law or any law applicable to you.

Violation of any of the above results in immediate suspension, forfeiture of any funds held in active escrow contracts to the relevant authorities, and reporting to law enforcement where required.`,
  },
  {
    id: "ip",
    title: "10. Intellectual Property",
    content: `All content, design, code, trade marks, and intellectual property on CryptoBazaar are owned by or licensed to us. You may not copy, reproduce, distribute, or create derivative works from any part of the Platform without our prior written consent.

You retain ownership of any data you provide (e.g., bank statements, trade history). By providing this data, you grant us a limited licence to process it for the purposes described in our Privacy Policy.`,
  },
  {
    id: "privacy",
    title: "11. Privacy and Data",
    content: `We collect and process only the data necessary to operate the Platform. Key principles:

— KYC data (Aadhaar, PAN, biometric liveness) is processed via Didit and is never stored on CryptoBazaar servers. Only the resulting cryptographic credential is stored, on your DID.
— Bank statement PDFs are processed in-flight for ML scoring and discarded. We do not retain your statement.
— We store: your Google account identifier, wallet address, DID, onboarding status, trade history (on-chain), and subscription status.
— We do not sell your data to third parties.

A full Privacy Policy is available at cryptobazaar.in/privacy. By using the Platform you consent to the data practices described therein.`,
  },
  {
    id: "liability",
    title: "12. Disclaimers and Liability",
    content: `12.1 Platform Provided "As-Is"
CryptoBazaar is provided without warranties of any kind, express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free from security vulnerabilities.

12.2 No Investment Advice
Nothing on the Platform constitutes financial, investment, legal, or tax advice. Cryptocurrency prices are volatile. You trade at your own risk.

12.3 Smart Contract Risk
While our escrow contracts are audited, blockchain software may contain bugs. We are not liable for losses caused by smart contract vulnerabilities that are not attributable to gross negligence on our part.

12.4 Liability Cap
To the maximum extent permitted by applicable law, our total liability to you for any claim arising from or related to these Terms or the Platform is limited to the membership fees paid by you in the 12 months preceding the event giving rise to the claim.

12.5 Consequential Losses
We are not liable for any indirect, incidental, special, or consequential losses, including loss of profit, loss of data, or loss of opportunity, even if we have been advised of the possibility of such losses.`,
  },
  {
    id: "termination",
    title: "13. Termination",
    content: `13.1 By You
You may close your account at any time by contacting support@cryptobazaar.in. Outstanding active trades must be completed or resolved before closure. Membership fees for the current period are non-refundable.

13.2 By Us
We may suspend or permanently terminate your access if:
(a) You breach any of these Terms.
(b) Your verification credentials expire and are not renewed.
(c) We are required to do so by applicable law or regulatory authority.
(d) Your continued use presents a legal or reputational risk to the Platform.

Where termination is for breach, we are not required to give advance notice.

13.3 Effect of Termination
On termination, your right to use the Platform ceases immediately. Any pending disbursement requests from the Fund that were submitted before termination will continue to be processed. Your on-chain trade history is immutable and remains on the blockchain regardless of account status.`,
  },
  {
    id: "governing",
    title: "14. Governing Law and Disputes",
    content: `These Terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.

Any dispute, controversy, or claim arising from or relating to these Terms or the Platform shall first be attempted to be resolved through good-faith negotiation. If negotiation fails within 30 days, the matter shall be submitted to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be [City], India. Arbitration proceedings shall be conducted in English.

Nothing in this clause prevents either party from seeking urgent injunctive relief from a competent court.`,
  },
  {
    id: "contact",
    title: "15. Contact and Notices",
    content: `For general support: support@cryptobazaar.in
For dispute appeals: disputes@cryptobazaar.in
For legal notices: legal@cryptobazaar.in

CryptoBazaar
[Registered Address]
India

Udyam Registration: [Number]

Notices to us must be sent in writing to the legal email above. Notices to you will be sent to the email address linked to your Google account.`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Header */}
      <header style={{ background: "#000", padding: "40px", borderBottom: "1px solid #222" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Link href="/" style={{ fontFamily: "var(--condensed)", fontSize: "1rem", letterSpacing: "3px", color: "#D4FF00", textDecoration: "none", display: "inline-block", marginBottom: "32px" }}>
            ← CRYPTOBAZAAR
          </Link>
          <h1 style={{ fontFamily: "var(--condensed)", fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#fff", lineHeight: 1, letterSpacing: "1px", marginBottom: "12px" }}>
            TERMS OF USE
          </h1>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
            Last updated: May 2026 · Effective for all users from the date of account creation
          </p>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 40px", display: "flex", gap: "60px", alignItems: "flex-start" }}>
        {/* Sidebar TOC */}
        <aside style={{ flexShrink: 0, width: "200px", position: "sticky", top: "32px" }}>
          <p style={{ fontFamily: "var(--sans)", fontSize: "0.65rem", color: "#bbb", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>
            Contents
          </p>
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{ fontFamily: "var(--sans)", fontSize: "0.78rem", color: "#888", lineHeight: 1.5, textDecoration: "none", padding: "4px 0", borderLeft: "2px solid transparent", paddingLeft: "10px", transition: "all 0.15s" }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#000"; (e.target as HTMLElement).style.borderLeftColor = "#D4FF00"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#888"; (e.target as HTMLElement).style.borderLeftColor = "transparent"; }}
              >
                {s.title.replace(/^\d+\.\s/, "")}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Important notice */}
          <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "12px", padding: "20px 24px", marginBottom: "48px" }}>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.85rem", color: "#92400e", lineHeight: 1.7 }}>
              <strong>Important:</strong> The Member Protection Fund described in Section 8 is a voluntary member benefit. It is <strong>not an insurance product</strong> and is not regulated as such. Payouts are discretionary and subject to fund availability. Please read Section 8 carefully before making any decisions based on the Fund.
            </p>
          </div>

          {SECTIONS.map((section, i) => (
            <section key={section.id} id={section.id} style={{ marginBottom: "52px", paddingBottom: "52px", borderBottom: i < SECTIONS.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <h2 style={{ fontFamily: "var(--condensed)", fontSize: "1.6rem", color: "#000", letterSpacing: "0.5px", marginBottom: "20px" }}>
                {section.title}
              </h2>
              {section.content.split("\n\n").map((para, j) => (
                <p key={j} style={{ fontFamily: "var(--sans)", fontSize: "0.875rem", color: "#444", lineHeight: 1.85, marginBottom: "16px", whiteSpace: "pre-line" }}>
                  {para}
                </p>
              ))}
            </section>
          ))}

          {/* Footer note */}
          <div style={{ background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "24px", marginTop: "16px" }}>
            <p style={{ fontFamily: "var(--sans)", fontSize: "0.8rem", color: "#888", lineHeight: 1.7 }}>
              These Terms were last reviewed by the CryptoBazaar compliance team in May 2026. If you have any questions about these Terms, please contact us at <a href="mailto:legal@cryptobazaar.in" style={{ color: "#000", textDecoration: "underline" }}>legal@cryptobazaar.in</a> before using the Platform.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
