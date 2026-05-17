"use client";

import { useEffect } from "react";

export function ScrollbarThemer() {
  useEffect(() => {
    let ticking = false;

    const updateScrollbar = () => {
      // Calculate the approximate center Y coordinate of the scrollbar thumb
      const scrollHeight = document.documentElement.scrollHeight;
      const innerHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // If the page doesn't scroll, do nothing
      if (scrollHeight <= innerHeight) return;

      const scrollPercentage = scrollY / (scrollHeight - innerHeight);
      
      // We want to probe a point on the far right of the screen where the thumb is.
      // The thumb moves down the screen as we scroll down.
      const thumbY = Math.max(10, Math.min(innerHeight - 10, scrollPercentage * innerHeight));
      
      // Probe the element at the right edge, slightly inward to avoid hitting the scrollbar itself
      const el = document.elementFromPoint(window.innerWidth - 20, thumbY);
      
      if (el) {
        // Check if the element or any of its ancestors has a dark background class
        const isDark = !!el.closest('.bg-black, footer, .dark-bg, [data-theme="dark"]');
        
        if (isDark) {
          document.documentElement.classList.add('dark-scrollbar');
        } else {
          document.documentElement.classList.remove('dark-scrollbar');
        }
      }
      
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollbar);
        ticking = true;
      }
    };

    // Initial check
    updateScrollbar();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return null;
}
