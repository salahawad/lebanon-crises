import { NextResponse } from "next/server";

const RSS_FEEDS = [
  "https://www.lebanonfiles.com/topics/%d8%a3%d8%ae%d8%a8%d8%a7%d8%b1-%d8%a7%d9%84%d8%b3%d8%a7%d8%b9%d8%a9/feed/",
  "https://www.lebanon24.com/Rss/News/1/%D9%84%D8%A8%D9%86%D8%A7%D9%86",
];

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  category: string;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function parseItems(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const pubDate =
      block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
    const category =
      block
        .match(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/)?.[1]
        ?.trim() ?? "";

    if (title && link) {
      items.push({ title: decodeEntities(title), link, pubDate, category });
    }
  }

  return items;
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map((url) =>
        fetch(url, {
          headers: { "User-Agent": "LebanonRelief/1.0" },
          cache: "no-store",
        }).then((r) => (r.ok ? r.text() : ""))
      )
    );

    const allItems: NewsItem[] = [];
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        allItems.push(...parseItems(result.value));
      }
    }

    if (allItems.length === 0) {
      return NextResponse.json(
        { items: [], error: "Feeds unavailable" },
        { status: 502 }
      );
    }

    // Sort newest first and deduplicate by link
    allItems.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    const seen = new Set<string>();
    const items = allItems.filter((item) => {
      if (seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    }).slice(0, 30);

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { items: [], error: "Failed to fetch feeds" },
      { status: 502 }
    );
  }
}
