"use client";

import { useState, useEffect, useRef } from "react";

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
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const posRef = useRef(0);
  const lastRef = useRef(0);
  const [ready, setReady] = useState(false);

  // Fetch news
  useEffect(() => {
    let active = true;
    function fetchNews() {
      fetch("/api/news")
        .then((r) => r.json())
        .then((data) => {
          if (!active) return;
          const incoming: NewsItem[] = data.items ?? [];
          if (incoming.length === 0) return;
          setItems((prev) => {
            const seen = new Set(incoming.map((n) => n.link));
            const kept = prev.filter((p) => !seen.has(p.link));
            const merged = [...incoming, ...kept].slice(0, 30);
            // Sort newest first
            merged.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
            // If new items appeared, reset scroll to show them
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

  // Clone the inner content once rendered so we have 2 identical strips
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner || items.length === 0) return;

    // Remove any previous clones
    while (wrapper.children.length > 1) {
      wrapper.removeChild(wrapper.lastChild!);
    }

    // Clone the strip and append it
    const clone = inner.cloneNode(true) as HTMLDivElement;
    clone.removeAttribute("id");
    wrapper.appendChild(clone);
    setReady(true);
  }, [items]);

  // Animate: move wrapper left, reset when first strip fully exits
  useEffect(() => {
    if (!ready || items.length === 0) return;
    const inner = innerRef.current;
    const wrapper = wrapperRef.current;
    if (!inner || !wrapper) return;

    const stripWidth = inner.offsetWidth;
    if (stripWidth === 0) return;

    function tick(now: number) {
      if (lastRef.current === 0) lastRef.current = now;
      const dt = now - lastRef.current;
      lastRef.current = now;

      if (!paused) {
        posRef.current += dt * 0.05; // 50px/sec
        if (posRef.current >= stripWidth) {
          posRef.current -= stripWidth;
        }
        wrapper!.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); lastRef.current = 0; };
  }, [ready, paused, items]);

  if (loading || items.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-primary text-white shadow-[0_-2px_10px_rgba(0,0,0,0.15)]" dir="ltr">
      <div className="flex items-center h-11">
        {/* Live badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full bg-danger-dark border-e border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
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
          {/* This wrapper moves left; dir=ltr ensures translateX works on RTL pages */}
          <div
            ref={wrapperRef}
            className="will-change-transform"
            style={{ display: "inline-flex", direction: "ltr" }}
          >
            {/* Original strip — measured for loop width */}
            <div ref={innerRef} className="flex-shrink-0 whitespace-nowrap" style={{ direction: "ltr" }}>
              {items.map((item, i) => (
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
              ))}
            </div>
            {/* Clone appended via useEffect */}
          </div>
        </div>
      </div>
    </div>
  );
}
