import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=%E8%BB%BD%E8%B2%A8%E7%89%A9+OR+%E9%81%8B%E9%80%81%E6%A5%AD+OR+%E7%89%A9%E6%B5%81+OR+%E3%83%A9%E3%82%B9%E3%83%88%E3%83%9E%E3%82%A4%E3%83%AB%E9%85%8D%E9%80%81+OR+%E4%BC%81%E6%A5%AD%E9%85%8D%E9%80%81&hl=ja&gl=JP&ceid=JP:ja',
    source: 'Google News',
  },
];

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

let cachedNews: NewsItem[] = [];
let cacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30分

export async function GET() {
  const now = Date.now();

  if (cachedNews.length > 0 && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json({ news: cachedNews });
  }

  try {
    const allItems: NewsItem[] = [];

    for (const feed of FEEDS) {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items.slice(0, 10)) {
        allItems.push({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || '',
          source: item.creator || item.content?.match(/<a[^>]*>([^<]+)<\/a>/)?.[1] || feed.source,
        });
      }
    }

    cachedNews = allItems;
    cacheTime = now;

    return NextResponse.json({ news: allItems });
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json({ news: cachedNews.length > 0 ? cachedNews : [] });
  }
}
