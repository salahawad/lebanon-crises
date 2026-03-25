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
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    let active = true;
    function fetchNews() {
      fetch("/api/news")
        .then((r) => r.json())
        .then((data) => {
          if (!active) return;
          const incoming: NewsItem[] = data.items ?? [];
          setItems((prev) => {
            const seen = new Set(incoming.map((n) => n.link));
            const kept = prev.filter((p) => !seen.has(p.link));
            return [...incoming, ...kept].slice(0, 30);
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    fetchNews();
    const interval = setInterval(fetchNews, 120_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Calculate duration based on content width — slower for more items
  useEffect(() => {
    if (trackRef.current) {
      const w = trackRef.current.scrollWidth / 2;
      // ~50px per second scrolling speed
      setDuration(Math.max(30, w / 50));
    }
  }, [items]);

  if (loading || items.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Fixed bottom ticker */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[#1e3a5f] text-white shadow-[0_-2px_10px_rgba(0,0,0,0.15)]">
        <div className="flex items-center h-11">
          {/* Live badge */}
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full bg-[#b91c1c] border-e border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
              News
            </span>
          </div>

          {/* Scrolling track — CSS animation, GPU-accelerated */}
          <div
            className="flex-1 overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <div
              ref={trackRef}
              className="inline-flex items-center whitespace-nowrap will-change-transform"
              style={{
                animation: `ticker-scroll ${duration}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              {/* Render items twice for seamless loop */}
              {[0, 1].map((copy) =>
                items.map((item, i) => (
                  <a
                    key={`${copy}-${i}`}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 hover:text-[#e8913a] transition-colors"
                  >
                    <span className="text-[11px] text-white/40 flex-shrink-0">
                      {timeAgo(item.pubDate)}
                    </span>
                    <span className="text-xs font-medium flex-shrink-0" dir="rtl">
                      {item.title}
                    </span>
                    {Date.now() - new Date(item.pubDate).getTime() <
                      600_000 && (
                      <span className="text-[8px] font-bold uppercase bg-[#e8913a] text-white px-1 py-px rounded flex-shrink-0">
                        new
                      </span>
                    )}
                    <span className="text-white/20 mx-1 flex-shrink-0">|</span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
