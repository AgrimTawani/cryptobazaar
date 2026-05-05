import Link from 'next/link'

export default function LandingPage() {
  const features = [
    { title: '3-Layer EDD', desc: 'KYC + Bank Statement ML + AI Interview' },
    { title: 'Smart Contract Escrow', desc: 'Platform holds nothing. Ever.' },
    { title: 'Insurance Fund', desc: '0.75% trade levy protects every member.' },
  ]

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 p-8">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight">CryptoBazaar</h1>
        <p className="text-xl text-zinc-400">
          India&apos;s gated P2P stablecoin exchange. Trade USDT and USDC without the fear of bank
          freezes.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="rounded bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-200"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="rounded border border-zinc-700 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-900"
          >
            Dashboard
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-zinc-400 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
