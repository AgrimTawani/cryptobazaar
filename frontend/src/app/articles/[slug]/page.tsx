import { ArrowRight, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ARTICLES_CATEGORIES,
  getArticleBySlug,
  getAllArticleSlugs,
  getAdjacentArticles,
} from "@/data/articlesData";
import { ArticleSidebar } from "@/components/ArticleSidebar";
import { ArticleHeader } from "@/components/ArticleHeader";
import { MoveToTopButton } from "@/components/MoveToTopButton";
import { AnimatedMain } from "@/components/AnimatedMain";

// ── Static params for all articles ──
export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

// ── Per-page metadata ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = getArticleBySlug(slug);
  if (!result) return { title: "Article Not Found | CryptoBazaar" };

  const { article, category } = result;
  const title = `${article.title} | CryptoBazaar`;
  const description = article.shortDesc;
  const url = `https://cryptobazaar.co.in/articles/${article.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "CryptoBazaar",
      locale: "en_IN",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ── Render **bold** markers ──
function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-zinc-900 font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getArticleBySlug(slug);
  if (!result) notFound();

  const { article, category } = result;
  const { prev, next } = getAdjacentArticles(slug);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.shortDesc,
    url: `https://cryptobazaar.co.in/articles/${article.id}`,
    publisher: {
      "@type": "Organization",
      name: "CryptoBazaar",
      url: "https://cryptobazaar.co.in",
    },
    isPartOf: {
      "@type": "CollectionPage",
      name: category.title,
      url: "https://cryptobazaar.co.in/articles",
    },
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-lime selection:text-black">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── STICKY HEADER ── */}
      <ArticleHeader />

      {/* ── MAIN CONTENT GRID ── */}
      <div className="w-full max-w-[1536px] mx-auto flex min-h-[calc(100vh-64px)] relative">
        {/* Sidebar */}
        <ArticleSidebar
          currentSlug={slug}
          sections={article.sections.map((s) => ({ id: s.id, title: s.title }))}
        />

        {/* ── MAIN ARTICLE READER AREA ── */}
        <AnimatedMain key={slug} className="flex-1 p-6 md:p-12 min-w-0 max-w-[900px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-sans text-zinc-400 mb-6">
            <Link
              href="/articles"
              className="hover:text-zinc-700 transition-colors no-underline text-zinc-400"
            >
              Knowledge Base
            </Link>
            <span>›</span>
            <span className="text-zinc-500">{category.title}</span>
          </nav>

          {/* Article Header */}
          <div className="mb-10 pb-8 border-b border-zinc-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-sans text-xs tracking-[4px] uppercase text-black font-bold">
                CryptoBazaar Knowledge Base
              </span>
            </div>
            <h1 className="font-condensed text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-[1px] text-black uppercase">
              {article.title}
            </h1>
            {article.shortDesc && (
              <p className="font-sans text-sm md:text-base text-zinc-500 mt-4 leading-relaxed max-w-[680px]">
                {article.shortDesc}
              </p>
            )}
          </div>

          {/* Article Content */}
          <div className="space-y-12">
            {article.sections.map((section, idx) => (
              <section
                key={section.id}
                id={section.id}
                className={`scroll-mt-24 ${
                  idx < article.sections.length - 1
                    ? "border-b border-zinc-100 pb-10"
                    : ""
                }`}
              >
                <h2 className="font-condensed text-[1.8rem] text-black tracking-[0.5px] mb-6 flex items-start gap-3">
                  <span className="text-zinc-400 font-sans text-sm font-semibold select-none mt-1.5">
                    §
                  </span>
                  {section.title}
                </h2>
                <div className="space-y-4 font-sans text-[0.92rem] text-zinc-600 leading-[1.85]">
                  {section.content.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx} className="whitespace-pre-line">
                      {renderFormattedText(para)}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Previous / Next navigation */}
          <div className="mt-16 pt-8 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prev ? (
              <Link
                href={`/articles/${prev.id}`}
                className="group flex flex-col gap-1 p-5 rounded-xl border border-zinc-200 hover:border-zinc-400 transition-colors no-underline"
              >
                <span className="font-sans text-xs text-zinc-400 uppercase tracking-widest">
                  <ArrowLeft className="inline-block w-4 h-4 mr-1" /> Previous
                </span>
                <span className="font-condensed text-base text-zinc-800 group-hover:text-black transition-colors">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/articles/${next.id}`}
                className="group flex flex-col gap-1 p-5 rounded-xl border border-zinc-200 hover:border-zinc-400 transition-colors no-underline text-right"
              >
                <span className="font-sans text-xs text-zinc-400 uppercase tracking-widest">
                  Next <ArrowRight className="inline-block w-4 h-4 ml-1" />
                </span>
                <span className="font-condensed text-base text-zinc-800 group-hover:text-black transition-colors">
                  {next.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Support Banner */}
          <div className="mt-10 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        </AnimatedMain>
      </div>
      <MoveToTopButton />
    </div>
  );
}
