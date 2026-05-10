'use client';

import { useState, useCallback } from 'react';
import type { AlertSeverity } from '@/src/types';
import { severityColor, severityLabel, daysLeftLabel } from '@/lib/utils';

// ============================================================
// 情報表示行
// ============================================================

export function InfoRow({ label, value, warn, mono }: { label: string; value: string; warn?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-b-border-subtle">
      <span className="text-xs flex-shrink-0 text-muted" style={{ minWidth: '110px' }}>{label}</span>
      <span className={`text-sm text-right ${mono ? 'num' : ''} ${warn ? 'text-negative' : 'text-primary'}`}>{value}</span>
    </div>
  );
}

// ============================================================
// コピー対応行
// ============================================================

export function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);
  return (
    <button onClick={handleCopy} className="text-[10px] px-2 py-0.5 font-medium cursor-pointer transition-colors border-0"
      style={{
        background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(200,16,46,0.1)',
        color: copied ? '#10B981' : 'var(--brand-crimson)',
        borderRadius: '4px',
      }}>
      {copied ? '✓ コピー済み' : label}
    </button>
  );
}

export function CopyableRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);
  return (
    <div className="flex items-center justify-between py-2 border-b border-b-border-subtle">
      <span className="text-xs flex-shrink-0 text-muted" style={{ minWidth: '110px' }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${mono ? 'num' : ''} text-primary`}>{value}</span>
        <button onClick={handleCopy} className="text-[10px] px-1.5 py-0.5 cursor-pointer flex-shrink-0"
          style={{
            background: copied ? 'rgba(16,185,129,0.15)' : 'var(--bg-base)',
            color: copied ? '#10B981' : 'var(--text-muted)',
            border: `1px solid ${copied ? '#10B981' : 'var(--border-subtle)'}`,
            borderRadius: '3px',
          }}>
          {copied ? '✓' : 'コピー'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Severity バッジ
// ============================================================

export function SeverityBadge({ severity, daysLeft }: { severity: AlertSeverity; daysLeft?: number }) {
  if (severity === 'ok') return null;
  const c = severityColor(severity);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 font-semibold"
      style={{ background: c.bg, color: c.text, borderRadius: '4px' }}>
      {severityLabel(severity)}
      {daysLeft !== undefined && <span className="num">({daysLeftLabel(daysLeft)})</span>}
    </span>
  );
}

// ============================================================
// 変動シグナル（↑↓→）
// ============================================================

export function Signal({ value }: { value: number }) {
  const color = value >= 5 ? '#10B981' : value >= 0 ? '#F59E0B' : '#EF4444';
  const bg = value >= 5 ? 'rgba(16,185,129,0.12)' : value >= 0 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';
  const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '→';
  return (
    <span className="num text-xs font-semibold px-1.5 py-0.5 inline-flex items-center gap-0.5" style={{ borderRadius: '4px', background: bg, color }}>
      {arrow} {Math.abs(value)}%
    </span>
  );
}
