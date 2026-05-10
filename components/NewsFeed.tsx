'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return '1時間以内';
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return `${Math.floor(days / 7)}週間前`;
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => { setNews(data.news || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 flex items-center justify-center text-xs font-bold bg-crimson-soft text-crimson"
          style={{ borderRadius: '50%' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 2h8v10H1zM9 4h3v2M9 7h2v1M9 9h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">運送業界ニュース</h2>
          <p className="text-xs text-muted">軽貨物・物流の最新動向</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-3 rounded bg-elevated" style={{ width: '90%' }} />
              <div className="h-2 rounded mt-2 bg-elevated" style={{ width: '40%' }} />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <p className="text-xs py-4 text-center text-muted">
          ニュースを取得できませんでした
        </p>
      ) : (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 transition-colors rounded-md"
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <p className="text-sm leading-snug line-clamp-2 text-secondary">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-disabled">{item.source}</span>
                <span className="text-xs text-disabled">{timeAgo(item.pubDate)}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
