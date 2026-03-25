"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  category: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function NewsTicker() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [quiet, setQuiet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const posRef = useRef(0);
  const lastRef = useRef(0);
  const prevQuietRef = useRef(false);
  const t = useTranslations("news");

  // Fetch news
  useEffect(() => {
    let active = true;
    function fetchNews() {
      fetch("/api/news")
        .then((r) => r.json())
        .then((data) => {
          if (!active) return;
          if (data.quiet) {
            setQuiet(true);
            setLoading(false);
            return;
          }
          setQuiet(false);
          const incoming: NewsItem[] = data.items ?? [];
          if (incoming.length === 0) return;
          setItems((prev) => {
            const seen = new Set(incoming.map((n) => n.link));
            const kept = prev.filter((p) => !seen.has(p.link));
            const merged = [...incoming, ...kept].slice(0, 30);
            merged.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
            const hadNew = incoming.some((n) => !prev.find((p) => p.link === n.link));
            if (hadNew && prev.length > 0) {
              posRef.current = 0;
            }
            return merged;
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    fetchNews();
    const interval = setInterval(fetchNews, 120_000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  // Reset scroll state on quiet <-> active transition
  useEffect(() => {
    if (prevQuietRef.current !== quiet) {
      posRef.current = 0;
      lastRef.current = 0;
      prevQuietRef.current = quiet;
    }
  }, [quiet]);

  const hasContent = quiet || items.length > 0;

  // Clone the inner content enough times for seamless loop
  useEffect(() => {
    if (!hasContent) return;
    const id = requestAnimationFrame(() => {
      const wrapper = wrapperRef.current;
      const inner = innerRef.current;
      if (!wrapper || !inner) return;

      // Remove any previous clones
      while (wrapper.children.length > 1) {
        wrapper.removeChild(wrapper.lastChild!);
      }

      // Add enough clones so total width >= viewport + one strip
      const stripWidth = inner.offsetWidth;
      const viewportWidth = window.innerWidth;
      const clonesNeeded = Math.max(1, Math.ceil(viewportWidth / stripWidth));
      for (let i = 0; i < clonesNeeded; i++) {
        const clone = inner.cloneNode(true) as HTMLDivElement;
        clone.removeAttribute("id");
        wrapper.appendChild(clone);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [items, quiet, hasContent]);

  // Animate
  useEffect(() => {
    if (!hasContent) return;
    const inner = innerRef.current;
    const wrapper = wrapperRef.current;
    if (!inner || !wrapper) return;

    function tick(now: number) {
      if (lastRef.current === 0) lastRef.current = now;
      const dt = now - lastRef.current;
      lastRef.current = now;

      const stripWidth = inner!.offsetWidth;
      if (!paused && stripWidth > 0) {
        posRef.current += dt * 0.05;
        if (posRef.current >= stripWidth) {
          posRef.current -= stripWidth;
        }
        wrapper!.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); lastRef.current = 0; };
  }, [hasContent, paused, quiet, items]);

  if (loading || !hasContent) return null;

  const quietMessage = quiet ? t("quietMessage", { time: "7:00 AM" }) : "";

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.15)] ${
        quiet ? "bg-slate-800 text-white/80" : "bg-primary text-white"
      }`}
      dir="ltr"
    >
      <div className="flex items-center h-11">
        {/* Badge */}
        <div
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 h-full border-e border-white/10 ${
            quiet ? "bg-slate-700" : "bg-danger-dark"
          }`}
        >
          {quiet ? (
            <span className="text-sm">🌙</span>
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
              quiet ? "opacity-70" : ""
            }`}
          >
            News
          </span>
        </div>

        {/* Scrolling area */}
        <div
          className="flex-1 overflow-hidden h-full flex items-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div
            ref={wrapperRef}
            className="will-change-transform"
            style={{ display: "inline-flex", direction: "ltr" }}
          >
            <div ref={innerRef} className="flex-shrink-0 whitespace-nowrap" style={{ direction: "ltr" }}>
              {quiet ? (
                <>
                  <span className="inline-flex items-center gap-3 px-6 text-xs font-medium">
                    {quietMessage}
                  </span>
                  <span className="text-white/20 mx-2" aria-hidden>|</span>
                  <span className="inline-flex items-center gap-3 px-6 text-xs font-medium">
                    {quietMessage}
                  </span>
                  <span className="text-white/20 mx-2" aria-hidden>|</span>
                  <span className="inline-flex items-center gap-3 px-6 text-xs font-medium">
                    {quietMessage}
                  </span>
                  <span className="text-white/20 mx-2" aria-hidden>|</span>
                </>
              ) : (
                items.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 hover:text-accent transition-colors"
                  >
                    <span className="text-[11px] text-white/40">
                      {timeAgo(item.pubDate)}
                    </span>
                    <span className="text-xs font-medium" dir="rtl">
                      {item.title}
                    </span>
                    {Date.now() - new Date(item.pubDate).getTime() < 600_000 && (
                      <span className="text-[8px] font-bold uppercase bg-accent text-white px-1 py-px rounded">
                        new
                      </span>
                    )}
                    <span className="text-white/20 mx-1" aria-hidden>|</span>
                  </a>
                ))
              )}
            </div>
            {/* Clone appended via useEffect */}
          </div>
        </div>
      </div>
    </div>
  );
}
