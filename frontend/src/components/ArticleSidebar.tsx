"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ARTICLES_CATEGORIES } from "@/data/articlesData";
import type { Article } from "@/data/articlesData";

interface ArticleSidebarProps {
  currentSlug: string;
  sections: { id: string; title: string }[];
}

export function ArticleSidebar({ currentSlug, sections }: ArticleSidebarProps) {
  const pathname = usePathname();

  // Find which category owns the current article
  const currentCategoryId = ARTICLES_CATEGORIES.find((cat) =>
    cat.articles.some((a) => a.id === currentSlug)
  )?.id;

  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    currentCategoryId ? [currentCategoryId] : []
  );
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sections.length > 0 ? sections[0].id : ""
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Expand the category of the current article when slug changes
  useEffect(() => {
    if (currentCategoryId && !expandedCategories.includes(currentCategoryId)) {
      setExpandedCategories((prev) => [...prev, currentCategoryId]);
    }
    if (sections.length > 0) {
      setActiveSectionId(sections[0].id);
    }
  }, [currentSlug, currentCategoryId, sections]);

  // Intersection observer for scroll-based section tracking
  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    setMobileSidebarOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const renderNav = (isMobile: boolean) => (
    <>
      <h3 className="font-condensed text-lg tracking-[2px] uppercase text-zinc-400 mb-6">
        Documentation Hub
      </h3>
      <nav className="flex flex-col gap-4">
        {ARTICLES_CATEGORIES.map((category) => (
          <div key={category.id} className="flex flex-col gap-1">
            <button
              onClick={() => toggleCategory(category.id)}
              className={`flex items-center justify-between w-full text-left font-condensed text-base tracking-[0.5px] font-bold text-black py-${isMobile ? "2" : "1"} hover:text-lime-dark transition-colors ${isMobile ? "border-b border-zinc-200" : ""}`}
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
                  className={`overflow-hidden flex flex-col gap-${isMobile ? "2" : "1"} mt-${isMobile ? "2" : "1"}`}
                >
                  {category.articles.map((article) => (
                    <div key={article.id}>
                      <Link
                        href={`/articles/${article.id}`}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex flex-col w-full p-2.5 rounded-lg font-sans text-left transition-all duration-200 border no-underline ${
                          currentSlug === article.id
                            ? "bg-zinc-100 border-zinc-300 text-black shadow-sm"
                            : "bg-transparent border-transparent text-zinc-500 hover:text-black hover:bg-zinc-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-condensed text-[0.9rem] tracking-[0.3px] leading-tight font-medium">
                            {article.title}
                          </p>
                        </div>
                      </Link>

                      {/* Section navigation for active article */}
                      <AnimatePresence initial={false}>
                        {currentSlug === article.id && sections.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className={`pt-1 pb-2 pl-4 pr-1`}>
                              <nav className="flex flex-col gap-0.5 border-l border-zinc-200 ml-1 pl-2">
                                {sections.map((sec) => (
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
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-[320px] border-r border-zinc-200 p-8 shrink-0 hidden md:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div>{renderNav(false)}</div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-black text-white shadow-lg hover:bg-zinc-800 transition-colors"
        aria-label="Toggle Navigation Sidebar"
      >
        <span className="font-sans text-xs tracking-wider uppercase font-bold">
          {mobileSidebarOpen ? "✕" : "☰"}
        </span>
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md md:hidden pt-20 px-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-8 pb-10">
              <div>{renderNav(true)}</div>
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
    </>
  );
}
