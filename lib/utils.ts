import type { AlertSeverity } from '@/src/types';

// ============================================================
// 日付ユーティリティ
// ============================================================

/** 期限日までの残り日数を計算 */
export function calcDaysLeft(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/** 残り日数からseverityを判定 */
export function calcSeverity(dateStr: string): AlertSeverity {
  const d = calcDaysLeft(dateStr);
  if (d < 0) return 'expired';
  if (d <= 30) return 'urgent';
  if (d <= 90) return 'warning';
  return 'ok';
}

/** 残り日数のラベル */
export function daysLeftLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}日超過`;
  if (days === 0) return '本日期限';
  return `残り${days}日`;
}

/** YYYY-MM-DD フォーマット */
export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ============================================================
// 通貨ユーティリティ
// ============================================================

/** 金額を万/億単位で表示 */
export function formatYen(n: number): string {
  if (Math.abs(n) >= 100000000) return `¥${(n / 100000000).toFixed(2)}億`;
  if (Math.abs(n) >= 10000) return `¥${(n / 10000).toFixed(1)}万`;
  return `¥${n.toLocaleString()}`;
}

// ============================================================
// Severity カラー・ラベル
// ============================================================

export function severityColor(s: AlertSeverity): { bg: string; text: string } {
  switch (s) {
    case 'expired': return { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' };
    case 'urgent': return { bg: 'rgba(249,115,22,0.15)', text: '#F97316' };
    case 'warning': return { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' };
    default: return { bg: 'rgba(16,185,129,0.1)', text: '#10B981' };
  }
}

export function severityLabel(s: AlertSeverity): string {
  switch (s) {
    case 'expired': return '期限切れ';
    case 'urgent': return '緊急';
    case 'warning': return '更新近し';
    default: return '有効';
  }
}
