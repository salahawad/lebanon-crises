"use client";

import { useState, useEffect } from "react";
import { Newspaper, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

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

export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let active = true;

    function fetchNews() {
      fetch("/api/news")
        .then((r) => r.json())
        .then((data) => {
          if (!active) return;
          const incoming: NewsItem[] = data.items ?? [];
          setItems((prev) => {
            // Merge: add new items at top, dedupe by link
            const seen = new Set(incoming.map((n) => n.link));
            const kept = prev.filter((p) => !seen.has(p.link));
            const merged = [...incoming, ...kept].slice(0, 30);
            // Flash if new items appeared
            if (prev.length > 0 && merged.length > prev.length) {
              setFlash(true);
              setTimeout(() => setFlash(false), 2000);
            }
            return merged;
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }

    fetchNews();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchNews, 120_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-5/6" />
          <div className="h-3 bg-slate-100 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, 5);

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-colors duration-500 ${
        flash
          ? "border-[#e8913a] ring-2 ring-[#e8913a]/20"
          : "border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#e8913a]" />
          <h3 className="text-sm font-bold text-slate-800">
            <span dir="rtl">أخبار الساعة</span>
            <span className="text-slate-400 font-normal ms-2">Live News</span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wide">
            Live
          </span>
        </div>
      </div>

      {/* News items */}
      <ul className="divide-y divide-slate-100">
        {visible.map((item, i) => (
          <li key={i}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm text-slate-800 leading-relaxed line-clamp-2 group-hover:text-[#1e3a5f]"
                  dir="rtl"
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-400">
                    {timeAgo(item.pubDate)}
                  </span>
                  {Date.now() - new Date(item.pubDate).getTime() < 600_000 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#e8913a] bg-[#e8913a]/10 px-1.5 py-0.5 rounded">
                      new
                    </span>
                  )}
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-1 group-hover:text-[#e8913a]" />
            </a>
          </li>
        ))}
      </ul>

      {/* Show more / less */}
      {items.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-medium text-slate-500 hover:text-[#1e3a5f] hover:bg-slate-50 border-t border-slate-100 transition-colors"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Show {items.length - 5} more{" "}
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}

      {/* Source attribution */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center">
          Source:{" "}
          <a
            href="https://www.lebanonfiles.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            LebanonFiles
          </a>{" "}
          · <span dir="rtl">ليبانون فايلز</span>
        </p>
      </div>
    </div>
  );
}
