'use client';

import { useMessage } from './MessageContext';
import { PLAYERS } from '@/src/mockData';

interface WeeklySummaryProps {
  summary: string;
}

// アクション文からドライバー名を抽出
function extractDriverName(text: string): string | null {
  for (const p of PLAYERS) {
    if (text.includes(p.name)) return p.name;
  }
  return null;
}

export function WeeklySummary({ summary }: WeeklySummaryProps) {
  const { openSendMessage } = useMessage();
  const lines = summary.split('\n');

  const handleAction = (text: string, driverName: string) => {
    const player = PLAYERS.find(p => p.name === driverName);
    if (!player) return;
    openSendMessage({
      driverName: player.name,
      userId: player.userId,
      context: text,
    });
  };

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 flex items-center justify-center text-xs font-bold"
          style={{ borderRadius: '50%', background: 'var(--brand-crimson-soft)', color: 'var(--brand-crimson)' }}>
          AI
        </div>
        <div>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>週次AIサマリー</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Claude による自動分析</p>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-2" />;

          // セクション見出し
          if (trimmed.startsWith('【') || trimmed.endsWith('：')) {
            return <p key={i} className="label pt-2 pb-1">{trimmed}</p>;
          }

          // 番号付きリスト (アクション項目) — ドライバー名があればボタン付き
          if (trimmed.match(/^\d+\./)) {
            const driverName = extractDriverName(trimmed);
            return (
              <div key={i} className="flex items-center gap-2 pl-1 py-0.5">
                <div className="w-0.5 self-stretch flex-shrink-0 rounded-full" style={{ background: 'var(--brand-crimson)' }} />
                <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{trimmed}</p>
                {driverName && (
                  <button
                    onClick={() => handleAction(trimmed, driverName)}
                    className="flex-shrink-0 text-xs px-2 py-1 cursor-pointer transition-colors whitespace-nowrap"
                    style={{
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--brand-crimson-soft)',
                      color: 'var(--brand-crimson)',
                      border: 'none',
                    }}
                  >
                    LINE送信
                  </button>
                )}
              </div>
            );
          }

          // 箇条書き
          if (trimmed.startsWith('・')) {
            return (
              <div key={i} className="flex gap-2 pl-1 py-0.5">
                <div className="w-0.5 self-stretch flex-shrink-0 rounded-full" style={{ background: 'var(--brand-crimson)' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{trimmed.slice(1).trim()}</p>
              </div>
            );
          }

          return <p key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{trimmed}</p>;
        })}
      </div>
    </div>
  );
}
