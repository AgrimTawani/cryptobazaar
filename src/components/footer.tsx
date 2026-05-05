import Link from 'next/link'
import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/6 bg-[#020617]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-50 mb-3 cursor-pointer">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/15 border border-amber-500/25">
                <Shield className="h-3 w-3 text-amber-400" aria-hidden="true" />
              </div>
              CryptoBazaar
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[200px]">
              India&apos;s first gated P2P stablecoin exchange. Trade with verified members only.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Platform</p>
            <ul className="space-y-2">
              {[{ label: 'How It Works', href: '/#how-it-works' }, { label: 'Pricing', href: '/pricing' }, { label: 'Get Started', href: '/login' }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-600 hover:text-slate-300 transition-colors cursor-pointer">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Legal</p>
            <ul className="space-y-2">
              {[{ label: 'Terms & Conditions', href: '/terms' }, { label: 'Refund Policy', href: '/refund-policy' }, { label: 'Privacy Policy', href: '/privacy' }].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-600 hover:text-slate-300 transition-colors cursor-pointer">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Contact</p>
            <ul className="space-y-2">
              {['support@cryptobazaar.co.in', 'compliance@cryptobazaar.co.in'].map((email) => (
                <li key={email}>
                  <a href={`mailto:${email}`} className="text-sm text-slate-600 hover:text-slate-300 transition-colors cursor-pointer break-all">{email}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/6">
          <p className="text-xs text-slate-700">&copy; {new Date().getFullYear()} CryptoBazaar. All rights reserved.</p>
          <p className="text-xs text-slate-700 text-center md:text-right max-w-md">
            CryptoBazaar is not a bank, payment gateway, or registered exchange. It is a peer-to-peer
            facilitation platform. All fiat transactions occur directly between users.
          </p>
        </div>
      </div>
    </footer>
  )
}
