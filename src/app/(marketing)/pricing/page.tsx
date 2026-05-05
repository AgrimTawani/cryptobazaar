import Link from 'next/link'
import { Check, ArrowRight, Shield } from 'lucide-react'

export const metadata = {
  title: 'Pricing — CryptoBazaar',
  description: 'Simple monthly subscriptions. Your fees fund the INR insurance pool.',
}

const tiers = [
  {
    name: 'Starter',
    price: '₹200',
    cap: '₹5 lakh / month',
    highlight: false,
    features: [
      'All 3-layer EDD verification',
      'Smart contract escrow on every trade',
      'Insurance fund eligibility (after 90 days)',
      'UPI / IMPS / NEFT payment methods',
      'USDT and USDC support',
      'On-chain DID & verifiable credentials',
      'Email support',
    ],
  },
  {
    name: 'Trader',
    price: '₹500',
    cap: '₹20 lakh / month',
    highlight: true,
    features: [
      'Everything in Starter',
      '₹20 lakh monthly trading cap',
      'Priority dispute resolution',
      'Faster EDD re-verification',
      'Priority email & chat support',
    ],
  },
  {
    name: 'Pro',
    price: '₹1,000',
    cap: 'Unlimited',
    highlight: false,
    features: [
      'Everything in Trader',
      'Unlimited monthly trading cap',
      'Dedicated compliance agent',
      'Expedited insurance claim processing',
      'Phone support',
    ],
  },
]

const faqs = [
  {
    q: 'How is the subscription collected?',
    a: 'Currently via manual UPI transfer to our registered business account. An automated Stripe payment link is coming shortly. Subscription is confirmed after we verify the UTR number you submit.',
  },
  {
    q: 'What happens if I don\'t renew?',
    a: 'Your trading access is paused at the end of the billing period. Your EDD credentials and on-chain identity remain valid. Renew at any time to resume trading. Renewing within 7 days of expiry keeps your same tier history.',
  },
  {
    q: 'Is the subscription refundable?',
    a: 'Subscriptions are non-refundable once activated. If your EDD application is rejected before first trade, a full refund is issued. See our Refund Policy for full details.',
  },
  {
    q: 'Does my subscription cover the insurance fund?',
    a: 'The monthly subscription fee funds the INR insurance pool. Separately, 0.75% of every completed trade goes into the on-chain USDT/USDC insurance contract. Both pools are used for different claim types.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'You can upgrade at any time — the new cap applies immediately, and the price difference is prorated. Downgrades take effect at the next renewal.',
  },
  {
    q: 'When do I become eligible for insurance claims?',
    a: 'After 90 days of active membership. This waiting period prevents join-and-claim abuse. The 90 days is cumulative across renewals.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-dvh pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Pricing</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 mb-4 leading-tight">
            Simple, transparent pricing.
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Monthly subscription. Your fees directly fund the INR insurance pool that protects
            every member from wrongful bank freezes.
          </p>
        </div>

        {/* Tiers */}
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl p-6 flex flex-col ${
                tier.highlight
                  ? 'border border-green-500/40 bg-green-500/5'
                  : 'border border-zinc-800 bg-zinc-900'
              }`}
            >
              {tier.highlight && (
                <span className="self-start text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5 mb-3">
                  Most Popular
                </span>
              )}
              <p className="text-base font-semibold text-zinc-200 mb-1">{tier.name}</p>
              <p className="text-4xl font-bold text-zinc-50 tabular-nums mb-0.5">
                {tier.price}
                <span className="text-sm font-normal text-zinc-500">/mo</span>
              </p>
              <p className="text-xs text-zinc-500 mb-6">Monthly cap: {tier.cap}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                    <Check
                      className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={`text-sm font-medium text-center py-2.5 rounded-lg transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 ${
                  tier.highlight
                    ? 'bg-green-500 text-black hover:bg-green-400'
                    : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* All plans include */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 mb-16">
          <h2 className="text-sm font-semibold text-zinc-200 mb-6">All plans include</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, text: '3-layer EDD verification' },
              { icon: Check, text: 'On-chain DID & verifiable credentials (Hyperledger Identus)' },
              { icon: Check, text: 'Smart contract escrow (Polygon, Solana, Tron)' },
              { icon: Check, text: 'Nominis wallet screening before every trade' },
              { icon: Check, text: 'Perfios-verified bank statement dispute resolution' },
              { icon: Check, text: '0.75% insurance levy per trade (crypto fund)' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2.5">
                <item.icon
                  className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-sm text-zinc-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insurance note */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 mb-16">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">Insurance Fund</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            If your bank account is frozen due to a CryptoBazaar trade — and you passed all EDD
            layers — you can file a claim. Payouts up to ₹5,00,000.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { tier: 'Emergency', payout: '₹10,000', sla: '24 hours', evidence: 'Bank freeze notice + FIR number' },
              { tier: 'Standard', payout: '₹1,00,000', sla: '7 days', evidence: 'Above + legal representation proof' },
              { tier: 'Full', payout: '₹5,00,000', sla: '30 days', evidence: 'Above + NOC or account unfrozen' },
            ].map((row) => (
              <div key={row.tier} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-xs font-semibold text-zinc-300 mb-1">{row.tier}</p>
                <p className="text-xl font-bold text-zinc-50 tabular-nums mb-1">{row.payout}</p>
                <p className="text-xs text-zinc-500">SLA: {row.sla}</p>
                <p className="text-xs text-zinc-600 mt-1">{row.evidence}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-4">
            Max 2 claims per year. 90-day waiting period after first activation. On-chain trade record required.
          </p>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-zinc-100 mb-8">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                <p className="text-sm font-medium text-zinc-200 mb-2">{faq.q}</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center rounded-xl border border-zinc-800 bg-zinc-900 p-10">
          <h2 className="text-xl font-bold text-zinc-50 mb-3">Ready to get started?</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Complete EDD in ~15 minutes. Pick your tier. Trade safely.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-6 py-3 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500"
          >
            Apply for Early Access
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
