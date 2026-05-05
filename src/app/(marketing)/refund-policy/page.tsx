export const metadata = {
  title: 'Refund Policy — CryptoBazaar',
  description: 'CryptoBazaar refund policy for subscription fees.',
}

const sections = [
  {
    title: '1. Scope',
    content: `This Refund Policy applies to monthly subscription fees paid to CryptoBazaar. It does not apply to cryptocurrency transactions, trade outcomes, or insurance fund payouts, which are governed separately by the Terms and Conditions and Insurance Fund rules.`,
  },
  {
    title: '2. EDD Rejection Before First Trade',
    content: `If your Enhanced Due Diligence (EDD) application is rejected at any layer before you have completed a first trade, you are entitled to a full refund of any subscription fee paid.

To claim this refund, email support@cryptobazaar.co.in within 14 days of receiving your rejection notice, with your registered wallet address and the UPI/payment reference number. Refunds are processed within 7 business days to the original payment source.`,
  },
  {
    title: '3. No Refund Once Trading is Activated',
    content: `Once your EDD is approved and your subscription is activated (allowing you to trade), the subscription fee is non-refundable for the current billing period.

This includes cases where:
- You decide not to trade during the period
- You traded fewer transactions than your tier permits
- Your account is suspended for Terms violations
- You request cancellation mid-period

The subscription grants access to the Platform's infrastructure, compliance systems, smart contract escrow, and insurance fund eligibility — not a guarantee of specific trade volume.`,
  },
  {
    title: '4. Duplicate Charges',
    content: `If you were charged more than once for the same subscription period due to a technical error, the duplicate charge will be fully refunded. Submit a request with both payment reference numbers to support@cryptobazaar.co.in. Duplicate charge refunds are processed within 3 business days.`,
  },
  {
    title: '5. Failed or Incomplete Payments',
    content: `If a payment was deducted from your account but not confirmed by our system, and as a result your subscription was not activated, contact us at support@cryptobazaar.co.in with the payment reference. We will either activate your subscription or issue a full refund within 5 business days.`,
  },
  {
    title: '6. Platform Downtime',
    content: `If the Platform experiences downtime exceeding 72 consecutive hours during your active subscription period, you may request a pro-rata credit for the affected period. This credit is applied to your next subscription renewal and is not issued as a cash refund. Downtime due to blockchain network issues, third-party service outages, or force majeure is excluded.`,
  },
  {
    title: '7. Account Closure by User',
    content: `If you close your account during an active subscription period, no refund is issued for the remaining days. Your credentials and identity remain on-chain and can be reactivated if you return.`,
  },
  {
    title: '8. Account Suspension for Violations',
    content: `If your account is suspended or permanently banned due to violations of the Terms and Conditions (including submitting forged documents, fraudulent insurance claims, or prohibited trading activity), no subscription refund will be issued.`,
  },
  {
    title: '9. How to Request a Refund',
    content: `Email support@cryptobazaar.co.in with the subject line "Refund Request — [your wallet address]". Include:

1. Your registered wallet address
2. Payment reference number (UTR or Stripe receipt ID)
3. Date of payment
4. Reason for refund request

We aim to respond within 2 business days. Approved refunds are credited within 7 business days to the original payment method.`,
  },
  {
    title: '10. Disputes',
    content: `If you disagree with a refund decision, you may escalate to compliance@cryptobazaar.co.in. We will review your case within 10 business days. Our decision following escalation review is final.

This policy is governed by Indian consumer protection law. Nothing in this policy limits your statutory rights under applicable Indian law.`,
  },
]

export default function RefundPolicyPage() {
  return (
    <div className="min-h-dvh pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Legal</p>
          <h1 className="text-3xl font-bold text-zinc-50 mb-2">Refund Policy</h1>
          <p className="text-sm text-zinc-500">
            Last updated: May 2026 · Applies to subscription fees only
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 mb-10 text-sm text-zinc-400 leading-relaxed">
          CryptoBazaar&apos;s refund policy is straightforward: if your EDD is rejected before your
          first trade, you get a full refund. Once trading is activated, subscription fees are
          non-refundable. Duplicate charges and technical billing errors are always resolved.
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

        <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm font-medium text-zinc-200 mb-1">Questions about a payment?</p>
          <p className="text-sm text-zinc-400">
            Email{' '}
            <a
              href="mailto:support@cryptobazaar.co.in"
              className="text-amber-400 hover:text-amber-400 cursor-pointer"
            >
              support@cryptobazaar.co.in
            </a>{' '}
            with your wallet address and payment reference. We respond within 2 business days.
          </p>
        </div>
      </div>
    </div>
  )
}
