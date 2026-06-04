"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";

// Reusable Navigation Widget
import { WalletNavWidget } from "@/components/WalletNavWidget";

// ── DATA FOR ARTICLES ──

interface ArticleSection {
  id: string;
  title: string;
  content: string;
}

interface Article {
  id: string;
  title: string;
  shortDesc: string;
  sections: ArticleSection[];
}

const TERMS_SECTIONS: ArticleSection[] = [
  {
    id: "agreement",
    title: "1. Agreement to Terms",
    content: `By accessing or using CryptoBazaar ("the Platform", "we", "us", "our"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree, you must not use the Platform.

These Terms form a legally binding agreement between you and CryptoBazaar. By completing registration, you confirm that you have read, understood, and accepted these Terms in full.

We reserve the right to update these Terms at any time. Continued use of the Platform after changes are published constitutes acceptance of the revised Terms. We will notify active members of material changes via email or an in-app notice.`
  },
  {
    id: "definitions",
    title: "2. Definitions",
    content: `"Verified Member" - A user who has successfully completed all three layers of verification: KYC, Enhanced Due Diligence (bank statement review), and the AI-scored questionnaire.

"Trade" - A peer-to-peer transaction between a Verified Member seller and a Verified Member buyer, facilitated by the Platform's escrow smart contract.

"Escrow Contract" - A self-executing smart contract deployed on a public blockchain that holds the seller's crypto until the trade is confirmed or resolved.

"Member Protection Fund" ("the Fund") - A voluntary, discretionary benefit pool funded by 0.75% of every completed trade, held in a separate on-chain contract. Not an insurance product.

"Membership Plan" - A monthly subscription (Starter, Trader, or Pro) that grants trading access and defines monthly volume limits.

"UTR" - Unique Transaction Reference number issued by NPCI for every UPI, IMPS, or NEFT payment.

"DID" - Decentralised Identifier created via Hyperledger Identus on behalf of each Verified Member to hold their verifiable credentials.`
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

Verification of eligibility is ongoing. If your circumstances change such that you no longer meet these criteria, you must immediately cease trading and notify us at support@cryptobazaar.co.in.`
  },
  {
    id: "account",
    title: "4. Account Registration and Verification",
    content: `4.1 Registration
You must sign in via Google OAuth to create an account. You are responsible for all activity under your account. You must not share your account credentials or access with any other person.

4.2 Three-Layer Verification
Before trading, you must complete:
- Layer 1 (KYC): Identity verification via Didit using Aadhaar, PAN, and a liveness check.
- Layer 2 (EDD): Upload of 6 months of bank statements, analysed by our ML system for red flags.
- Layer 3 (AI Questionnaire): A 10-question online interview scored by AI.

All three layers must pass for Verified Member status to be granted.

4.3 Wallet Binding
You must connect a cryptocurrency wallet. This wallet address is permanently bound to your account. If you change your wallet, all verification credentials are invalidated and you must restart the full verification process. This policy exists because wallet history is a key component of risk assessment.

4.4 Credential Validity
Verification credentials expire after 6 months. You must renew all three layers to continue trading. Failure to renew results in trading access being suspended until renewal is complete.

4.5 Accuracy of Information
You represent that all information provided during registration and verification is true, accurate, and complete. Providing false, misleading, or fraudulent information is a serious breach of these Terms and may result in permanent suspension and reporting to relevant authorities.`
  },
  {
    id: "membership",
    title: "5. Membership Plans",
    content: `5.1 Plan Tiers
Access to trading requires an active Membership Plan:
- Starter: ₹200/month, ₹5,00,000 monthly trade cap
- Trader: ₹500/month, ₹20,00,000 monthly trade cap
- Pro: ₹1,000/month, no trade cap

5.2 Payment
Membership fees are currently collected via UPI transfer to our registered business account. Payment instructions are provided after verification is complete. Plans are month-to-month. No automatic renewals occur without your explicit confirmation and payment.

5.3 Cap Enforcement
Your cumulative INR trade volume within a billing month is tracked. When you approach your cap, you will be notified. If you reach it, new trades are blocked until the next billing cycle or you upgrade your plan.

5.4 Refunds
Membership fees are non-refundable once a billing period has begun, unless we are unable to provide access to the Platform for more than 72 consecutive hours due to a fault on our side. Any refund requests must be submitted to support@cryptobazaar.co.in within 7 days of the fee being paid.

5.5 Member Protection Fund Eligibility
An active Membership Plan at the time of a trade is a prerequisite for eligibility to request a disbursement from the Member Protection Fund. A lapsed subscription at the time of the relevant trade disqualifies a claim.`
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
(a) Confirm receipt - the smart contract releases crypto to the buyer, and 0.75% is sent to the Member Protection Fund contract; or
(b) Raise a dispute - the trade enters dispute resolution.

If the seller does not respond within 15 minutes, the trade automatically escalates to dispute resolution.

6.5 Irreversibility
Once the buyer has marked payment, the seller cannot cancel the trade. This is a deliberate design choice to protect buyers against the most common P2P fraud - a seller cancelling after receiving funds.

6.6 Platform Role
CryptoBazaar is a technology facilitator. We do not process, hold, or control INR payments between parties. We do not hold custody of crypto at any point during a trade. The smart contract operates independently on the public blockchain.`
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
- Bank statements covering the date of the trade (PDF).
- Any additional context.

Screenshots are accepted as supplementary context only. Bank statements are the primary evidence.

7.3 Tampering Detection
All submitted PDFs are run through Perfios/Authbridge for:
- PDF metadata validation.
- Digital signature verification.
- Anomaly detection (font inconsistencies, image layers over text, known manipulation patterns).

Submitting a tampered or forged document results in immediate ruling against that party, permanent suspension, and may result in a criminal complaint being filed. All users are Aadhaar-linked and fully identified.

7.4 Cross-Reference Analysis
A genuine payment appears on both parties' bank statements. The Platform's compliance team cross-references the buyer's debit against the seller's credit. The UTR provides an additional reference point. The outcome is almost always unambiguous from bank data alone.

7.5 Ruling and Execution
The compliance team issues a ruling:
- Payment confirmed: crypto released to buyer via smart contract.
- Payment not confirmed: crypto returned to seller via smart contract.

The losing party's account is flagged. A second dispute loss within 12 months results in permanent suspension.

7.6 Finality
Dispute rulings are final. If you believe a ruling was made in error, you may appeal in writing to disputes@cryptobazaar.co.in within 7 days. Appeals are reviewed by a senior compliance officer. The appeal decision is final.`
  },
  {
    id: "fund",
    title: "8. Member Protection Fund",
    content: `8.1 Nature of the Fund
The Member Protection Fund ("the Fund") is a voluntary, discretionary benefit available to eligible Verified Members.

THE FUND IS NOT AN INSURANCE PRODUCT. IT IS NOT REGULATED AS ONE. IT DOES NOT CONSTITUTE A FINANCIAL GUARANTEE, POLICY, OR CONTRACT OF INDEMNITY. PAYOUTS FROM THE FUND ARE NOT GUARANTEED.

8.2 Fund Construction
0.75% of the value of every completed trade is automatically transferred from the escrow contract to the Fund contract at settlement. The Fund is held on-chain. CryptoBazaar cannot spend it without multisig approval from a minimum of 3 of 5 designated signatories.

8.3 Nature of Disbursements
Disbursements from the Fund are a contractual service remedy under the Indian Contract Act, 1872 (Sections 73–74) for CryptoBazaar's failure to deliver the service it promised - namely, that every counterparty on the Platform has been adequately screened. A disbursement is compensation for our screening failure, not a payment for an external risk event. The Fund does not operate as an insurance pool.

8.4 Eligibility to Request a Disbursement
All five conditions must be satisfied:
(a) You had an active Membership Plan at the time of the trade that caused the freeze.
(b) You had valid (unexpired) EDD and KYC credentials at the time of the trade.
(c) The trade was executed through CryptoBazaar's escrow smart contract - on-chain verifiable.
(d) The bank freeze is directly and demonstrably attributable to that specific CryptoBazaar trade, evidenced by a police notice or official bank freeze letter citing the transaction.
(e) The freeze is attributable to a failure in CryptoBazaar's vetting process - specifically, that the counterparty to your trade was admitted to the Platform despite posing an identifiable risk that our screening should have caught. Freezes resulting from events unrelated to our screening failure are not eligible.

8.5 Disbursement Tiers
Subject to fund availability and approval:
- Emergency: Up to ₹10,000 within 24 hours. Requires: freeze notice + FIR/complaint number.
- Standard: Up to ₹1,00,000 within 7 days. Requires: above + proof of legal representation.
- Full: Up to ₹5,00,000 within 30 days. Requires: above + account unfrozen or NOC issued.

Disbursement amounts are subject to the Fund's available balance at the time of approval. If the Fund cannot cover the full approved amount, a partial disbursement may be made.

8.6 Anti-Abuse Rules
- Maximum 2 disbursement requests per member per 12-month period.
- A 90-day waiting period applies from the date of becoming a Verified Member before a first request may be submitted. This prevents "join-and-claim" abuse.
- All requests are cross-checked against on-chain trade records. No on-chain trade record means no disbursement.
- Fraudulent disbursement requests (fabricated freeze notices, false information) result in permanent suspension and may result in criminal complaint.

8.7 Scope Limitations
The Fund does not cover:
- Losses from cryptocurrency price movements.
- Bank freezes caused by transactions unrelated to CryptoBazaar.
- Bank freezes where CryptoBazaar's vetting process functioned correctly and the risk was undetectable by reasonable screening methods.
- Losses from your own negligence (e.g., sharing private keys, trading outside the Platform).
- Tax liabilities arising from your trading activity.
- Events of force majeure.

8.8 No Fiduciary Duty
CryptoBazaar's administration of the Fund does not create a fiduciary duty, trust relationship, or any other special duty of care beyond what is expressly set out in these Terms.`
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
(f) Manipulating trade outcomes - including submitting false UTRs, fabricating bank statements, or coordinating with a counterparty to deceive the Platform.
(g) Circumventing verification checks through technical means or third-party services.
(h) Posting listings for assets other than those supported by the Platform.
(i) Any other activity that is illegal under Indian law or any law applicable to you.

Violation of any of the above results in immediate suspension, forfeiture of any funds held in active escrow contracts to the relevant authorities, and reporting to law enforcement where required.`
  },
  {
    id: "ip",
    title: "10. Intellectual Property",
    content: `All content, design, code, trade marks, and intellectual property on CryptoBazaar are owned by or licensed to us. You may not copy, reproduce, distribute, or create derivative works from any part of the Platform without our prior written consent.

You retain ownership of any data you provide (e.g., bank statements, trade history). By providing this data, you grant us a limited licence to process it for the purposes described in our Privacy Policy.`
  },
  {
    id: "privacy",
    title: "11. Privacy and Data",
    content: `We collect and process only the data necessary to operate the Platform. Key principles:

- KYC data (Aadhaar, PAN, biometric liveness) is processed via Didit and is never stored on CryptoBazaar servers. Only the resulting cryptographic credential is stored, on your DID.
- Bank statement PDFs are processed in-flight for ML scoring and discarded. We do not retain your statement.
- We store: your Google account identifier, wallet address, DID, onboarding status, trade history (on-chain), and subscription status.
- We do not sell your data to third parties.

A full Privacy Policy is available at cryptobazaar.co.in/privacy. By using the Platform you consent to the data practices described therein.`
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
We are not liable for any indirect, incidental, special, or consequential losses, including loss of profit, loss of data, or loss of opportunity, even if we have been advised of the possibility of such losses.`
  },
  {
    id: "termination",
    title: "13. Termination",
    content: `13.1 By You
You may close your account at any time by contacting support@cryptobazaar.co.in. Outstanding active trades must be completed or resolved before closure. Membership fees for the current period are non-refundable.

13.2 By Us
We may suspend or permanently terminate your access if:
(a) You breach any of these Terms.
(b) Your verification credentials expire and are not renewed.
(c) We are required to do so by applicable law or regulatory authority.
(d) Your continued use presents a legal or reputational risk to the Platform.

Where termination is for breach, we are not required to give advance notice.

13.3 Effect of Termination
On termination, your right to use the Platform ceases immediately. Any pending disbursement requests from the Fund that were submitted before termination will continue to be processed. Your on-chain trade history is immutable and remains on the blockchain regardless of account status.`
  },
  {
    id: "governing",
    title: "14. Governing Law and Disputes",
    content: `These Terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.

Any dispute, controversy, or claim arising from or relating to these Terms or the Platform shall first be attempted to be resolved through good-faith negotiation. If negotiation fails within 30 days, the matter shall be submitted to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be [City], India. Arbitration proceedings shall be conducted in English.

Nothing in this clause prevents either party from seeking urgent injunctive relief from a competent court.`
  },
  {
    id: "contact",
    title: "15. Contact and Notices",
    content: `For general support: support@cryptobazaar.co.in
For dispute appeals: disputes@cryptobazaar.co.in
For legal notices: legal@cryptobazaar.co.in

CryptoBazaar
[Registered Address]
India

Udyam Registration: [Number]

Notices to us must be sent in writing to the legal email above. Notices to you will be sent to the email address linked to your Google account.`
  }
];

const ARTICLES_DATA: Article[] = [
  {
    id: "terms",
    title: "Terms of Use",
    shortDesc: "The core legal contract between you and CryptoBazaar.",
    sections: TERMS_SECTIONS
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    shortDesc: "How we collect, secure, and discard your sensitive data.",
    sections: [
      {
        id: "data-minimization",
        title: "1. Data Minimization Principles",
        content: `We believe that the safest way to store sensitive data is not to store it at all. 

Unlike traditional exchanges that maintain massive central databases of user identity files and bank transactions, CryptoBazaar uses a zero-custody data architecture. We only store the absolute bare minimum needed to verify eligibility, route trades, and settle disputes.`
      },
      {
        id: "kyc-processing",
        title: "2. Identity Verification (Layer 1)",
        content: `Your identity verification (Aadhaar, PAN, and liveness face-match) is processed directly by Didit, our authorized identity verification partner.

CryptoBazaar servers never see or store your raw Aadhaar card number, PAN card scan, or selfie biometric data. Didit verifies your documents, issues a cryptographic credential, and we bind this credential to your Decentralized Identifier (DID) stored locally in your browser and on-chain. We only know if you are verified or not.`
      },
      {
        id: "bank-statements",
        title: "3. Bank Statements (Layer 2)",
        content: `During the onboarding phase, you are required to upload 6 months of bank statement PDFs.

This data is processed in-memory by our Machine Learning parser to calculate your risk scoring and flag suspicious transaction patterns (like money-mule activity or shell accounts). Immediately after scoring, the PDF files are permanently deleted from our servers. We never write your statement documents to disk, and no human at CryptoBazaar reads them unless a dispute occurs.`
      },
      {
        id: "security-measures",
        title: "4. Information Security",
        content: `We implement state-of-the-art security measures to protect your metadata:
- All data in transit is encrypted using TLS 1.3.
- All stored metadata (such as Google identifiers and wallet addresses) is encrypted at rest using AES-256.
- Database access is restricted to essential microservices using IAM roles and private VPC routing.`
      }
    ]
  },
  {
    id: "mpf-guide",
    title: "Member Protection Fund",
    shortDesc: "A voluntary pool compensating members for vetting failures.",
    sections: [
      {
        id: "mpf-what-is-it",
        title: "1. What is the Member Protection Fund?",
        content: `The Member Protection Fund (MPF) is a dedicated on-chain smart contract holding a pool of funds to compensate Verified Members who suffer wrongful bank freezes.

It is funded by 0.75% of every completed trade. It acts as our direct accountability check: if our screening fails to block a bad actor and you get frozen, the fund is there to help. Note: The MPF is not an insurance product and is run at our discretion.`
      },
      {
        id: "mpf-how-it-works",
        title: "2. Multisig Governance",
        content: `The fund is held in a multi-signature safe on-chain. Moving funds requires approval from a minimum of 3 of 5 designated signatories, including:
- Two independent cryptocurrency legal advisors.
- One representative from our compliance team.
- Two independent community representatives chosen from active Pro-tier traders.`
      },
      {
        id: "disbursement-process",
        title: "3. Requesting a Disbursement",
        content: `To request a disbursement, you must file a claim under the 'Protection Fund' tab in your Dashboard. You must provide:
- A copy of the formal bank freeze letter or Cyber Cell police notice.
- Evidence that the freeze is linked directly to the UTR number of a CryptoBazaar trade.
- An active membership subscription at the time of the trade.

Claims are processed through three tiers, with Emergency claims (up to ₹10,000) resolved in under 24 hours.`
      }
    ]
  },
  {
    id: "disputes-escrow",
    title: "Disputes & Escrow",
    shortDesc: "How the secure smart contracts resolve trade conflicts.",
    sections: [
      {
        id: "escrow-mechanics",
        title: "1. The Escrow Smart Contract",
        content: `Every transaction on CryptoBazaar is executed using an autonomous, non-custodial escrow smart contract.

Once the seller deposits crypto into the contract, it cannot be recovered until either:
- The seller clicks 'Confirm Release' (successful trade).
- The buyer cancels the trade (funds returned to seller).
- A dispute is raised and our compliance team issues a cryptographic signature resolving the trade based on bank evidence.`
      },
      {
        id: "dispute-resolution",
        title: "2. The Dispute Process",
        content: `If a seller does not release the funds after you pay, or if you suspect foul play, you can trigger a Dispute.

Our compliance team will require both parties to upload PDF bank statements. We do not accept screenshots because they are easily forged. All PDFs are run through forensic analysis tools to verify signatures, check metadata, and confirm whether the transfer actually cleared NPCI servers.`
      }
    ]
  },
  {
    id: "bank-freezes",
    title: "P2P Safety Guide",
    shortDesc: "Practical advice on preventing account freezes in India.",
    sections: [
      {
        id: "what-causes-freezes",
        title: "1. Understanding UPI/Bank Freezes",
        content: `Indian bank accounts are frozen when 'tainted' funds (money linked to online scams, cyber fraud, or gambling) touch the account.

Even if you are an innocent seller, if a buyer pays you using money from a compromised account, the police (cyber cell) will mark the entire transaction chain, leading to a debit freeze on your bank account.`
      },
      {
        id: "how-to-stay-safe",
        title: "2. The CryptoBazaar Shield",
        content: `We enforce 4 golden rules to make trading as safe as humanly possible:

1. **Gated Access**: Absolutely no unverified users. Everyone passes Aadhaar liveness checks.
2. **Bank Account Matching**: You must only send and receive funds using a bank account where the name EXACTLY matches your verified PAN and Clerk profile. Third-party payments are strictly blocked.
3. **ML Risk Profiling**: We analyze statement uploads to screen out 'mule accounts'—dormant accounts that suddenly receive large crypto-related deposits.
4. **On-chain Wallet Screening**: We screen connected Web3 wallets using Nominis to ensure they have no history with crypto mixers or illicit addresses.`
      }
    ]
  }
];

export default function ArticlesPage() {
  const [activeArticleId, setActiveArticleId] = useState<string>("terms");
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  const activeArticle = ARTICLES_DATA.find((a) => a.id === activeArticleId) || ARTICLES_DATA[0];

  // Sync article selection from query parameter on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const topic = params.get("topic");
      if (topic && ARTICLES_DATA.some((a) => a.id === topic)) {
        setActiveArticleId(topic);
      }
    }
  }, []);

  // Sync initial section ID when changing active article
  useEffect(() => {
    if (activeArticle.sections.length > 0) {
      setActiveSectionId(activeArticle.sections[0].id);
    } else {
      setActiveSectionId("");
    }
  }, [activeArticleId, activeArticle.sections]);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    setMobileSidebarOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // offset for sticky navigation header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-lime selection:text-black">
      {/* ── STICKY HEADER ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 px-5 md:px-10 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-condensed text-[1.6rem] tracking-[3px] text-black hover:text-lime-dark transition-colors duration-200">
            CRYPTOBAZAAR
          </Link>
          <span className="text-zinc-200 hidden sm:inline">|</span>
          <span className="font-sans text-xs tracking-[2px] uppercase text-zinc-500 font-bold hidden sm:inline">
            Resources & Legal
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="font-sans text-sm text-zinc-500 hover:text-black transition-colors duration-200 no-underline hidden md:inline">
            Home
          </Link>
          <span className="text-zinc-200 hidden md:inline">·</span>
          <WalletNavWidget />
          <span className="text-zinc-200 hidden md:inline">·</span>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 no-underline py-1.5 pr-3.5 pl-1.5 border border-zinc-200 rounded-full bg-zinc-50 hover:bg-zinc-100 transition-colors"
            >
              {user?.imageUrl && (
                <img src={user.imageUrl} alt="" width={24} height={24} className="rounded-full" />
              )}
              <span className="font-sans text-sm font-medium text-zinc-800">
                Dashboard
              </span>
            </Link>
          ) : (
            <Link href="/login" className="btn-login py-1 px-5 border border-zinc-300 rounded-full text-zinc-800 font-condensed hover:bg-black hover:text-white transition-all">
              Sign In
            </Link>
          )}

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-lg bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 transition-colors"
            aria-label="Toggle Navigation Sidebar"
          >
            <span className="font-sans text-xs tracking-wider uppercase text-zinc-700 font-bold">
              Menu
            </span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="max-w-[1280px] mx-auto flex min-h-[calc(100vh-64px)] relative">
        
        {/* Sidebar TOC - Desktop */}
        <aside className="w-[300px] border-r border-zinc-200 p-8 shrink-0 hidden md:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="mb-8">
            <h3 className="font-condensed text-lg tracking-[2px] uppercase text-zinc-400 mb-4">
              Documentation Hub
            </h3>
            <nav className="flex flex-col gap-2">
              {ARTICLES_DATA.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setActiveArticleId(article.id)}
                  className={`flex flex-col w-full p-3 rounded-xl font-sans text-left transition-all duration-200 border ${
                    activeArticleId === article.id
                      ? "bg-zinc-100 border-zinc-300 text-black shadow-sm"
                      : "bg-transparent border-transparent text-zinc-500 hover:text-black hover:bg-zinc-50"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-condensed text-base tracking-[0.5px] leading-tight font-bold">
                      {article.title}
                    </p>
                    <p className="text-[0.7rem] text-zinc-400 truncate mt-0.5 font-sans">
                      {article.shortDesc}
                    </p>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Sub-sections of current selected article */}
          <div className="border-t border-zinc-200 pt-6">
            <h3 className="font-condensed text-lg tracking-[2px] uppercase text-zinc-400 mb-4">
              On This Page
            </h3>
            <nav className="flex flex-col gap-1.5 pl-1">
              {activeArticle.sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`font-sans text-xs text-left leading-relaxed py-1.5 px-3 border-l-2 transition-all duration-150 ${
                    activeSectionId === sec.id
                      ? "border-black text-black font-bold bg-zinc-50 rounded-r-lg"
                      : "border-transparent text-zinc-400 hover:text-zinc-900 hover:border-zinc-200"
                  }`}
                >
                  {sec.title.replace(/^\d+(\.\d+)?\s/, "")}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── MOBILE MENU OVERLAY ── */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md md:hidden pt-20 px-6 overflow-y-auto"
            >
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="font-condensed text-lg tracking-[2px] uppercase text-zinc-400 mb-3">
                    Select Resource
                  </h3>
                  <div className="grid gap-2">
                    {ARTICLES_DATA.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => {
                          setActiveArticleId(article.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`flex flex-col w-full p-4 rounded-xl border font-sans text-left transition-all ${
                          activeArticleId === article.id
                            ? "bg-zinc-100 border-zinc-300 text-black"
                            : "bg-zinc-50 border-zinc-200 text-zinc-600"
                        }`}
                      >
                        <div>
                          <p className="font-condensed text-base tracking-[0.5px] font-bold">{article.title}</p>
                          <p className="text-xs text-zinc-400 font-sans mt-0.5">{article.shortDesc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-6">
                  <h3 className="font-condensed text-lg tracking-[2px] uppercase text-zinc-400 mb-3">
                    Sections
                  </h3>
                  <div className="flex flex-col gap-2">
                    {activeArticle.sections.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        className={`font-sans text-sm text-left py-2 px-3 border-l-2 transition-all ${
                          activeSectionId === sec.id
                            ? "border-black text-black font-bold bg-zinc-50"
                            : "border-transparent text-zinc-500"
                        }`}
                      >
                        {sec.title}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="mt-4 py-3 bg-black text-white font-condensed text-lg rounded-xl tracking-wider uppercase font-semibold"
                >
                  Close Menu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAIN ARTICLE READER AREA ── */}
        <main className="flex-1 p-6 md:p-12 min-w-0 max-w-[900px]">
          
          {/* Article Header Card */}
          <div className="mb-10 pb-8 border-b border-zinc-250">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-sans text-xs tracking-[4px] uppercase text-lime-dark font-bold">
                CryptoBazaar Knowledge Base
              </span>
            </div>
            <h1 className="font-condensed text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-[1px] text-black uppercase">
              {activeArticle.title}
            </h1>
            <p className="font-sans text-sm md:text-base text-zinc-500 mt-4 leading-relaxed max-w-[680px]">
              {activeArticle.shortDesc}
            </p>
          </div>

          {/* Member Protection Fund disclaimer notice */}
          {activeArticleId === "terms" && (
            <div className="relative overflow-hidden bg-[#fffbeb] border-[1.5px] border-[#fde68a] rounded-2xl p-6 mb-12 shadow-[0_4px_30px_rgba(245,158,11,0.02)]">
              <p className="font-sans text-[0.88rem] text-[#92400e] leading-[1.8] relative z-10">
                <strong>Important Notice:</strong> The Member Protection Fund described in Section 8 is a <strong>contractual service remedy</strong> for CryptoBazaar&apos;s screening failures - it is <strong>not an insurance product</strong> and is not regulated as such. Disbursements require proof that the freeze was caused by a failure in our vetting process (Section 8.4(e)), not merely that a freeze occurred. Payouts are discretionary and subject to fund availability. Please read Section 8 carefully.
              </p>
            </div>
          )}

          {/* Article Content Render */}
          <div className="space-y-12">
            {activeArticle.sections.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                className={`scroll-mt-24 ${
                  idx < activeArticle.sections.length - 1 ? "border-b border-zinc-100 pb-10" : ""
                }`}
              >
                <h2 className="font-condensed text-[1.8rem] text-black tracking-[0.5px] mb-6 flex items-start gap-3">
                  <span className="text-zinc-400 font-sans text-sm font-semibold select-none mt-1.5">§</span>
                  {section.title}
                </h2>
                <div className="space-y-4 font-sans text-[0.92rem] text-zinc-600 leading-[1.85]">
                  {section.content.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx} className="whitespace-pre-line">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Support Disclaimer Banner */}
          <div className="mt-16 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-condensed text-lg tracking-[1px] text-zinc-900">
                STILL NEED HELP?
              </p>
              <p className="font-sans text-xs text-zinc-500 leading-relaxed mt-1">
                Our support team is available 24/7 for urgent disputes or verification issues.
              </p>
            </div>
            <a
              href="mailto:support@cryptobazaar.co.in"
              className="inline-flex items-center gap-2 bg-black text-white py-2.5 px-6 rounded-lg font-condensed text-base tracking-[0.5px] hover:bg-zinc-800 transition-colors duration-200 no-underline font-semibold"
            >
              Contact Support
            </a>
          </div>

        </main>
      </div>
    </div>
  );
}
