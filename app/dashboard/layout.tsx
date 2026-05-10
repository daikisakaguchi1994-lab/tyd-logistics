'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MessageProvider } from '@/components/MessageContext';
import { RateProvider } from '@/components/RateContext';
import { TickerBar } from '@/components/TickerBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  return (
    <RateProvider>
      <MessageProvider>
        <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col min-w-0">
            {/* ニュースティッカー */}
            <TickerBar />

            <header
              className="sticky top-0 z-10 flex items-center justify-between px-4 lg:px-6 py-3 border-b border-b-border-subtle"
              style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(12px)' }}
            >
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 cursor-pointer text-secondary" aria-label="メニューを開く">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <div />
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-surface text-secondary border border-border-subtle rounded-sm">
                  {dateStr}
                </span>
                <button
                  onClick={async () => {
                    await fetch('/api/auth', { method: 'DELETE' });
                    window.location.href = '/login';
                  }}
                  className="text-xs px-2.5 py-1 cursor-pointer bg-elevated text-muted border border-border-subtle rounded-sm"
                >
                  ログアウト
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </MessageProvider>
    </RateProvider>
  );
}
