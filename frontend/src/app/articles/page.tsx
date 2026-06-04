"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";

// Reusable Navigation Widget
import { WalletNavWidget } from "@/components/WalletNavWidget";

// ── DATA FOR ARTICLES ──
import { ARTICLES_CATEGORIES, Article, ArticleCategory } from "@/data/articlesData";

export default function ArticlesPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(ARTICLES_CATEGORIES[0].id);
  const [activeArticleId, setActiveArticleId] = useState<string>(ARTICLES_CATEGORIES[0].articles[0].id);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([ARTICLES_CATEGORIES[0].id]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const articleTopRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Find the active article safely
  let activeArticle = ARTICLES_CATEGORIES[0].articles[0];
  for (const cat of ARTICLES_CATEGORIES) {
    const found = cat.articles.find(a => a.id === activeArticleId);
    if (found) {
      activeArticle = found;
      break;
    }
  }

  // Sync article selection from query parameter on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const topic = params.get("topic");
      if (topic) {
        for (const cat of ARTICLES_CATEGORIES) {
          const found = cat.articles.find((a) => a.id === topic);
          if (found) {
            setActiveArticleId(topic);
            if (!expandedCategories.includes(cat.id)) {
              setExpandedCategories(prev => [...prev, cat.id]);
            }
            break;
          }
        }
      }
    }
  }, []);

  // Sync initial section ID and scroll to top when changing active article
  useEffect(() => {
    if (activeArticle.sections && activeArticle.sections.length > 0) {
      setActiveSectionId(activeArticle.sections[0].id);
    } else {
      setActiveSectionId("");
    }

    // Scroll to the top of the page (skip on initial mount)
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // Delay to ensure DOM has updated after React re-render
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
      });
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

  // Parse **bold** markers in content strings into <strong> elements
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-zinc-900 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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
        <aside className="w-[320px] border-r border-zinc-200 p-8 shrink-0 hidden md:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div>
            <h3 className="font-condensed text-lg tracking-[2px] uppercase text-zinc-400 mb-6">
              Documentation Hub
            </h3>
            <nav className="flex flex-col gap-4">
              {ARTICLES_CATEGORIES.map((category) => (
                <div key={category.id} className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center justify-between w-full text-left font-condensed text-base tracking-[0.5px] font-bold text-black py-1 hover:text-lime-dark transition-colors"
                  >
                    {category.title}
                    <span className="text-zinc-400 text-xs font-sans">
                      {expandedCategories.includes(category.id) ? "−" : "+"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedCategories.includes(category.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden flex flex-col gap-1 mt-1"
                      >
                        {category.articles.map((article) => (
                          <div key={article.id}>
                            <button
                              onClick={() => setActiveArticleId(article.id)}
                              className={`flex flex-col w-full p-2.5 rounded-lg font-sans text-left transition-all duration-200 border ${
                                activeArticleId === article.id
                                  ? "bg-zinc-100 border-zinc-300 text-black shadow-sm"
                                  : "bg-transparent border-transparent text-zinc-500 hover:text-black hover:bg-zinc-50"
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="font-condensed text-[0.9rem] tracking-[0.3px] leading-tight font-medium">
                                  {article.title}
                                </p>
                              </div>
                            </button>

                            {/* On This Page — inline below the active article */}
                            <AnimatePresence initial={false}>
                              {activeArticleId === article.id && article.sections && article.sections.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-1 pb-2 pl-4 pr-1">
                                    <nav className="flex flex-col gap-0.5 border-l border-zinc-200 ml-1 pl-2">
                                      {article.sections.map((sec) => (
                                        <button
                                          key={sec.id}
                                          onClick={() => scrollToSection(sec.id)}
                                          className={`font-sans text-[0.7rem] text-left leading-relaxed py-1 px-2 transition-all duration-150 rounded-r-md ${
                                            activeSectionId === sec.id
                                              ? "text-black font-bold bg-zinc-50"
                                              : "text-zinc-400 hover:text-zinc-900"
                                          }`}
                                        >
                                          {sec.title.replace(/^\d+(\.\d+)?\s/, "")}
                                        </button>
                                      ))}
                                    </nav>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
              <div className="flex flex-col gap-8 pb-10">
                <div>
                  <h3 className="font-condensed text-lg tracking-[2px] uppercase text-zinc-400 mb-6">
                    Documentation Hub
                  </h3>
                  <div className="flex flex-col gap-4">
                    {ARTICLES_CATEGORIES.map((category) => (
                      <div key={category.id} className="flex flex-col gap-1">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="flex items-center justify-between w-full text-left font-condensed text-base tracking-[0.5px] font-bold text-black py-2 border-b border-zinc-200"
                        >
                          {category.title}
                          <span className="text-zinc-400 text-xs font-sans">
                            {expandedCategories.includes(category.id) ? "−" : "+"}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {expandedCategories.includes(category.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden flex flex-col gap-2 mt-2"
                            >
                              {category.articles.map((article) => (
                                <div key={article.id}>
                                  <button
                                    onClick={() => setActiveArticleId(article.id)}
                                    className={`flex flex-col w-full p-4 rounded-xl border font-sans text-left transition-all ${
                                      activeArticleId === article.id
                                        ? "bg-zinc-100 border-zinc-300 text-black"
                                        : "bg-zinc-50 border-zinc-200 text-zinc-600"
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <p className="font-condensed text-[0.95rem] tracking-[0.5px] font-bold">{article.title}</p>
                                    </div>
                                  </button>

                                  {/* Inline sections below active article */}
                                  <AnimatePresence initial={false}>
                                    {activeArticleId === article.id && article.sections && article.sections.length > 0 && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                      >
                                        <div className="pt-3 pb-2 pl-4 pr-1">
                                          <div className="flex flex-col gap-1 border-l border-zinc-200 pl-3">
                                            {article.sections.map((sec) => (
                                              <button
                                                key={sec.id}
                                                onClick={() => scrollToSection(sec.id)}
                                                className={`font-sans text-sm text-left py-1.5 px-3 transition-all rounded-r-lg ${
                                                  activeSectionId === sec.id
                                                    ? "text-black font-bold bg-zinc-50"
                                                    : "text-zinc-500 hover:text-black"
                                                }`}
                                              >
                                                {sec.title.replace(/^\d+(\.\d+)?\s/, "")}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
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
          <div ref={articleTopRef} className="mb-10 pb-8 border-b border-zinc-250">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-sans text-xs tracking-[4px] uppercase text-lime-dark font-bold">
                CryptoBazaar Knowledge Base
              </span>
            </div>
            <h1 className="font-condensed text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-[1px] text-black uppercase">
              {activeArticle.title}
            </h1>
            {activeArticle.shortDesc && (
              <p className="font-sans text-sm md:text-base text-zinc-500 mt-4 leading-relaxed max-w-[680px]">
                {activeArticle.shortDesc}
              </p>
            )}
          </div>

          {/* Article Content Render */}
          <div className="space-y-12">
            {activeArticle.sections && activeArticle.sections.map((section, idx) => (
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
                      {renderFormattedText(para)}
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
