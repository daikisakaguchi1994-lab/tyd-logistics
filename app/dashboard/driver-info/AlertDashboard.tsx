'use client';

import { useState } from 'react';
import { PLAYERS } from '@/src/mockData';
import type { ExpiryAlert, AlertSeverity } from '@/src/types';
import { severityColor, severityLabel, daysLeftLabel } from '@/lib/utils';

export function AlertDashboard({ alerts, onSelectDriver }: { alerts: ExpiryAlert[]; onSelectDriver: (name: string) => void }) {
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const handleSendReminder = async (alert: ExpiryAlert) => {
    const key = `${alert.driverName}-${alert.category}`;
    setSendingTo(key);
    const driver = PLAYERS.find(p => p.name === alert.driverName);
    if (driver) {
      try {
        await fetch('/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: driver.userId,
            message: `【TYD管理】${alert.driverName}さん、${alert.category}の期限が${alert.daysLeft < 0 ? '切れています' : `${alert.daysLeft}日後に迫っています`}（${alert.expiryDate}）。更新手続きをお願いいたします。`,
          }),
        });
      } catch { /* ignore */ }
    }
    setTimeout(() => setSendingTo(null), 2000);
  };

  if (alerts.length === 0) {
    return (
      <div className="card p-5 text-center">
        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(16,185,129,0.1)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--positive)' }}>全ての資格・保険が有効期限内です</p>
      </div>
    );
  }

  const grouped: Record<string, ExpiryAlert[]> = {};
  alerts.forEach(a => {
    if (!grouped[a.severity]) grouped[a.severity] = [];
    grouped[a.severity].push(a);
  });

  return (
    <div className="space-y-3">
      {(['expired', 'urgent', 'warning'] as AlertSeverity[]).map(sev => {
        const items = grouped[sev];
        if (!items?.length) return null;
        const c = severityColor(sev);
        return (
          <div key={sev} className="card p-4" style={{ borderLeft: `3px solid ${c.text}` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-2 py-0.5" style={{ background: c.bg, color: c.text, borderRadius: '4px' }}>
                {severityLabel(sev)}
              </span>
              <span className="text-xs num font-medium" style={{ color: 'var(--text-muted)' }}>{items.length}件</span>
            </div>
            <div className="space-y-2">
              {items.map((a, i) => {
                const key = `${a.driverName}-${a.category}`;
                const isSending = sendingTo === key;
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5"
                    style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)' }}>
                    <button onClick={() => onSelectDriver(a.driverName)}
                      className="text-sm font-semibold cursor-pointer hover:underline"
                      style={{ color: 'var(--text-primary)', background: 'none', border: 'none', padding: 0 }}>
                      {a.driverName}
                    </button>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.category}</span>
                    <span className="text-xs num" style={{ color: 'var(--text-muted)' }}>{a.expiryDate}</span>
                    <span className="text-[10px] num font-semibold" style={{ color: c.text }}>
                      {daysLeftLabel(a.daysLeft)}
                    </span>
                    <button
                      onClick={() => handleSendReminder(a)}
                      disabled={isSending}
                      className="ml-auto text-[10px] px-2.5 py-1 cursor-pointer flex-shrink-0 font-medium"
                      style={{
                        background: isSending ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface)',
                        color: isSending ? 'var(--positive)' : 'var(--text-secondary)',
                        border: `1px solid ${isSending ? 'var(--positive)' : 'var(--border-default)'}`,
                        borderRadius: '4px',
                      }}>
                      {isSending ? '通知済' : 'LINE通知'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
