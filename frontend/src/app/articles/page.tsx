import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES_CATEGORIES } from "@/data/articlesData";
import { MoveToTopButton } from "@/components/MoveToTopButton";

export const metadata: Metadata = {
  title: "Knowledge Base | CryptoBazaar",
  description:
    "Guides, tutorials, and legal documents for CryptoBazaar — India's gated P2P stablecoin exchange. Learn about P2P trading, stablecoins, escrow, security, and more.",
  alternates: { canonical: "https://cryptobazaar.co.in/articles" },
  openGraph: {
    type: "website",
    title: "Knowledge Base | CryptoBazaar",
    description:
      "Guides, tutorials, and legal documents for CryptoBazaar — India's gated P2P stablecoin exchange.",
    url: "https://cryptobazaar.co.in/articles",
    siteName: "CryptoBazaar",
    locale: "en_IN",
  },
};

export default function ArticlesIndexPage() {
  // JSON-LD for CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CryptoBazaar Knowledge Base",
    description: metadata.description,
    url: "https://cryptobazaar.co.in/articles",
    publisher: {
      "@type": "Organization",
      name: "CryptoBazaar",
      url: "https://cryptobazaar.co.in",
    },
  };

  const totalArticles = ARTICLES_CATEGORIES.reduce(
    (sum, cat) => sum + cat.articles.length,
    0
  );

  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-lime selection:text-black">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HEADER ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200 px-5 md:px-10 h-[64px] flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="nav-logo no-underline text-black"
          >
            CRYPTOBAZAAR
          </Link>
          <span className="text-zinc-200 hidden sm:inline">|</span>
          <span className="font-sans text-xs tracking-[2px] uppercase text-zinc-500 font-bold hidden sm:inline">
            Knowledge Base
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-sans text-sm text-zinc-500 hover:text-black transition-colors duration-200 no-underline"
          >
            Home
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-16 pb-12 border-b border-zinc-200">
        <span className="font-sans text-sm tracking-[4px] uppercase text-black font-bold">
          CryptoBazaar
        </span>
        <h1 className="font-condensed text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-[1px] text-black uppercase mt-3">
          Knowledge Base
        </h1>
        <p className="font-sans text-base text-zinc-500 mt-4 leading-relaxed max-w-[640px]">
          Guides, tutorials, and legal documents covering everything you need to
          know about P2P trading on CryptoBazaar. {totalArticles} articles across{" "}
          {ARTICLES_CATEGORIES.length} categories.
        </p>
      </div>

      {/* ── CATEGORIES & ARTICLES GRID ── */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-12">
        <div className="space-y-16">
          {ARTICLES_CATEGORIES.map((category) => (
            <section key={category.id}>
              {/* Category heading */}
              <div className="mb-8 pb-4 border-b border-zinc-200">
                <h2 className="font-condensed text-[2.2rem] tracking-[0.5px] text-black">
                  {category.title}
                </h2>
                <p className="font-sans text-sm text-zinc-500 mt-1">
                  {category.articles.length} article
                  {category.articles.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Articles grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="group flex flex-col gap-3 p-8 rounded-2xl border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all duration-200 no-underline"
                  >
                    <h3 className="font-condensed text-[1.4rem] tracking-[0.3px] text-zinc-900 group-hover:text-black transition-colors leading-tight">
                      {article.title}
                    </h3>
                    <p className="font-sans text-sm text-zinc-500 leading-relaxed line-clamp-3">
                      {article.shortDesc}
                    </p>
                    <span className="font-sans text-sm text-black font-semibold mt-auto pt-4">
                      Read article →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-10 border-t border-zinc-200">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="font-condensed text-lg tracking-[1px] text-zinc-900">
              STILL NEED HELP?
            </p>
            <p className="font-sans text-xs text-zinc-500 leading-relaxed mt-1">
              Our support team is available 24/7 for urgent disputes or
              verification issues.
            </p>
          </div>
          <a
            href="mailto:support@cryptobazaar.co.in"
            className="inline-flex items-center gap-2 bg-black text-white py-2.5 px-6 rounded-lg font-condensed text-base tracking-[0.5px] hover:bg-zinc-800 transition-colors duration-200 no-underline font-semibold"
          >
            Contact Support
          </a>
        </div>
      </div>
      <MoveToTopButton />
    </div>
  );
}
