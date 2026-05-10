'use client';

import { useState, useMemo } from 'react';
import { PLAYERS } from '@/src/mockData';
import { DRIVER_RECORDS, getAllAlerts } from '@/src/mockDriverInfo';
import type { DriverFullRecord, ExpiryAlert, AlertSeverity } from '@/src/types';

// ============================================================
// ユーティリティ
// ============================================================

type InfoTab = 'personal' | 'vehicle' | 'qualifications';

function daysLeftLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}日超過`;
  if (days === 0) return '本日期限';
  return `残り${days}日`;
}

function severityColor(s: AlertSeverity): { bg: string; text: string } {
  switch (s) {
    case 'expired': return { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' };
    case 'urgent': return { bg: 'rgba(249,115,22,0.15)', text: '#F97316' };
    case 'warning': return { bg: 'rgba(234,179,8,0.15)', text: '#EAB308' };
    default: return { bg: 'rgba(16,185,129,0.1)', text: '#10B981' };
  }
}

function severityLabel(s: AlertSeverity): string {
  switch (s) {
    case 'expired': return '期限切れ';
    case 'urgent': return '緊急';
    case 'warning': return '更新近し';
    default: return '有効';
  }
}

function InfoRow({ label, value, warn, mono }: { label: string; value: string; warn?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)', minWidth: '110px' }}>{label}</span>
      <span className={`text-sm text-right ${mono ? 'num' : ''}`}
        style={{ color: warn ? 'var(--negative)' : 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function SeverityBadge({ severity, daysLeft }: { severity: AlertSeverity; daysLeft?: number }) {
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

function calcDays(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function calcSev(dateStr: string): AlertSeverity {
  const d = calcDays(dateStr);
  if (d < 0) return 'expired';
  if (d <= 30) return 'urgent';
  if (d <= 90) return 'warning';
  return 'ok';
}

// ============================================================
// アラートダッシュボード（KURUMAN Step②）
// ============================================================

function AlertDashboard({ alerts, onSelectDriver }: { alerts: ExpiryAlert[]; onSelectDriver: (name: string) => void }) {
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const handleSendReminder = async (alert: ExpiryAlert) => {
    const key = `${alert.driverName}-${alert.category}`;
    setSendingTo(key);
    // デモ: 実際にはLINE APIで通知
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

  // グループ化: 期限切れ → 緊急 → 更新近し
  const grouped: Record<string, ExpiryAlert[]> = {};
  alerts.forEach(a => {
    const key = a.severity;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
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

// ============================================================
// 資格一覧テーブル（全ドライバー横断）
// ============================================================

function QualificationsOverview({ onSelectDriver }: { onSelectDriver: (name: string) => void }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>資格・保険 一覧表</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
              {['ドライバー', '免許', '車検', '自賠責', '任意保険', '貨物保険', 'リース'].map(h => (
                <th key={h} className="text-left text-[10px] py-2.5 px-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAYERS.map(p => {
              const rec = DRIVER_RECORDS[p.name];
              if (!rec) return null;

              const cells = [
                { date: rec.qualifications.license.expiryDate },
                { date: rec.vehicle.inspection.expiryDate },
                { date: rec.qualifications.jibaiseki.expiryDate },
                { date: rec.qualifications.voluntaryInsurance.expiryDate },
                { date: rec.qualifications.cargoInsurance?.expiryDate || '' },
                { date: rec.vehicle.leaseEnd },
              ];

              return (
                <tr key={p.name} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="py-2.5 px-3">
                    <button onClick={() => onSelectDriver(p.name)}
                      className="flex items-center gap-2 cursor-pointer hover:underline"
                      style={{ background: 'none', border: 'none', padding: 0 }}>
                      <div className="w-6 h-6 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ borderRadius: '4px', background: p.color, color: '#fff' }}>
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    </button>
                  </td>
                  {cells.map((cell, ci) => {
                    if (!cell.date) {
                      return <td key={ci} className="py-2.5 px-3 text-xs" style={{ color: 'var(--text-disabled)' }}>-</td>;
                    }
                    const sev = calcSev(cell.date);
                    const days = calcDays(cell.date);
                    const c = severityColor(sev);
                    return (
                      <td key={ci} className="py-2.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] num" style={{ color: 'var(--text-secondary)' }}>{cell.date}</span>
                          {sev !== 'ok' && (
                            <span className="text-[9px] font-semibold num px-1.5 py-0.5 self-start"
                              style={{ background: c.bg, color: c.text, borderRadius: '3px' }}>
                              {daysLeftLabel(days)}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// ドライバー詳細パネル（3タブ）
// ============================================================

function DriverDetailPanel({ record, onClose }: { record: DriverFullRecord; onClose: () => void }) {
  const [tab, setTab] = useState<InfoTab>('personal');
  const player = PLAYERS.find(p => p.name === record.personal.driverName);
  const { personal: info, vehicle: veh, qualifications: qual } = record;

  const tabs: { key: InfoTab; label: string; icon: string }[] = [
    { key: 'personal', label: 'ドライバー情報', icon: '👤' },
    { key: 'vehicle', label: '車両情報', icon: '🚐' },
    { key: 'qualifications', label: '資格・保険', icon: '📋' },
  ];

  return (
    <div className="card overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{ borderRadius: 'var(--r-md)', background: player?.color || 'var(--brand-crimson)', color: '#fff' }}>
            {info.driverName.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{info.driverName}</h2>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{player?.character} / {info.contractType} / 入社 {info.joinDate}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 cursor-pointer" style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* タブ */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border-default)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium cursor-pointer transition-colors"
            style={{
              background: tab === t.key ? 'var(--bg-elevated)' : 'transparent',
              color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--brand-crimson)' : '2px solid transparent',
              border: 'none',
              borderRadius: 0,
            }}>
            <span className="text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* ① ドライバー情報 */}
        {tab === 'personal' && (
          <>
            <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>基本情報</h3>
              <InfoRow label="氏名" value={info.driverName} />
              <InfoRow label="生年月日" value={info.birthDate} mono />
              <InfoRow label="電話番号" value={info.phone} mono />
              <InfoRow label="メール" value={info.email} />
              <InfoRow label="住所" value={info.address} />
              <InfoRow label="入社日" value={info.joinDate} mono />
              <InfoRow label="契約形態" value={info.contractType} />
            </div>

            <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>緊急連絡先</h3>
              <InfoRow label="氏名" value={info.emergencyContact.name} />
              <InfoRow label="続柄" value={info.emergencyContact.relation} />
              <InfoRow label="電話番号" value={info.emergencyContact.phone} mono />
            </div>

            {info.notes && (
              <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
                <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>備考</h3>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{info.notes}</p>
              </div>
            )}
          </>
        )}

        {/* ② 車両情報 */}
        {tab === 'vehicle' && (
          <>
            <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>車両基本情報</h3>
              <InfoRow label="ナンバー" value={veh.plateNumber} mono />
              <InfoRow label="車種" value={veh.model} />
              <InfoRow label="車体タイプ" value={veh.bodyType} />
              <InfoRow label="年式" value={`${veh.year}年`} mono />
              <InfoRow label="色" value={veh.color} />
            </div>

            <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>リース情報</h3>
                <SeverityBadge severity={calcSev(veh.leaseEnd)} daysLeft={calcDays(veh.leaseEnd)} />
              </div>
              <InfoRow label="リース会社" value={veh.leaseCompany} />
              <InfoRow label="リース開始" value={veh.leaseStart} mono />
              <InfoRow label="リース満了" value={veh.leaseEnd} mono warn={calcSev(veh.leaseEnd) !== 'ok'} />
            </div>

            <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>車検情報</h3>
                <SeverityBadge severity={calcSev(veh.inspection.expiryDate)} daysLeft={calcDays(veh.inspection.expiryDate)} />
              </div>
              <InfoRow label="前回車検日" value={veh.inspection.lastDate} mono />
              <InfoRow label="車検満了日" value={veh.inspection.expiryDate} mono warn={calcSev(veh.inspection.expiryDate) !== 'ok'} />
              <InfoRow label="整備工場" value={veh.inspection.shop} />
            </div>
          </>
        )}

        {/* ③ 資格・保険情報 */}
        {tab === 'qualifications' && (
          <>
            <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>運転免許証</h3>
                <SeverityBadge severity={calcSev(qual.license.expiryDate)} daysLeft={calcDays(qual.license.expiryDate)} />
              </div>
              <InfoRow label="免許番号" value={qual.license.number} mono />
              <InfoRow label="免許種別" value={qual.license.type} />
              <InfoRow label="交付日" value={qual.license.issueDate} mono />
              <InfoRow label="有効期限" value={qual.license.expiryDate} mono warn={calcSev(qual.license.expiryDate) !== 'ok'} />
            </div>

            {/* 自賠責保険 */}
            <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>自賠責保険（強制）</h3>
                <SeverityBadge severity={calcSev(qual.jibaiseki.expiryDate)} daysLeft={calcDays(qual.jibaiseki.expiryDate)} />
              </div>
              <InfoRow label="保険会社" value={qual.jibaiseki.company} />
              <InfoRow label="証券番号" value={qual.jibaiseki.policyNumber} mono />
              <InfoRow label="保険開始" value={qual.jibaiseki.startDate} mono />
              <InfoRow label="有効期限" value={qual.jibaiseki.expiryDate} mono warn={calcSev(qual.jibaiseki.expiryDate) !== 'ok'} />
            </div>

            {/* 任意保険 */}
            <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>任意保険</h3>
                <SeverityBadge severity={calcSev(qual.voluntaryInsurance.expiryDate)} daysLeft={calcDays(qual.voluntaryInsurance.expiryDate)} />
              </div>
              <InfoRow label="保険会社" value={qual.voluntaryInsurance.company} />
              <InfoRow label="証券番号" value={qual.voluntaryInsurance.policyNumber} mono />
              <InfoRow label="保険開始" value={qual.voluntaryInsurance.startDate} mono />
              <InfoRow label="有効期限" value={qual.voluntaryInsurance.expiryDate} mono warn={calcSev(qual.voluntaryInsurance.expiryDate) !== 'ok'} />
              {qual.voluntaryInsurance.coverageAmount && (
                <InfoRow label="補償内容" value={qual.voluntaryInsurance.coverageAmount} />
              )}
            </div>

            {/* 貨物保険 */}
            {qual.cargoInsurance && (
              <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>貨物保険</h3>
                  <SeverityBadge severity={calcSev(qual.cargoInsurance.expiryDate)} daysLeft={calcDays(qual.cargoInsurance.expiryDate)} />
                </div>
                <InfoRow label="保険会社" value={qual.cargoInsurance.company} />
                <InfoRow label="証券番号" value={qual.cargoInsurance.policyNumber} mono />
                <InfoRow label="保険開始" value={qual.cargoInsurance.startDate} mono />
                <InfoRow label="有効期限" value={qual.cargoInsurance.expiryDate} mono warn={calcSev(qual.cargoInsurance.expiryDate) !== 'ok'} />
                {qual.cargoInsurance.coverageAmount && (
                  <InfoRow label="補償額" value={qual.cargoInsurance.coverageAmount} />
                )}
              </div>
            )}

            {/* その他資格 */}
            {qual.otherCerts.length > 0 && (
              <div className="p-4" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)' }}>
                <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>その他保有資格</h3>
                {qual.otherCerts.map((cert, i) => (
                  <div key={i} className={i > 0 ? 'mt-3 pt-3' : ''} style={i > 0 ? { borderTop: '1px solid var(--border-subtle)' } : {}}>
                    <InfoRow label="資格名" value={cert.name} />
                    <InfoRow label="資格番号" value={cert.number} mono />
                    <InfoRow label="有効期限" value={cert.expiryDate === '9999-12-31' ? '無期限' : cert.expiryDate} mono />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// メインページ
// ============================================================

type PageView = 'dashboard' | 'list' | 'detail';

export default function DriverInfoPage() {
  const [view, setView] = useState<PageView>('dashboard');
  const [selected, setSelected] = useState<string | null>(null);

  const alerts = useMemo(() => getAllAlerts(), []);

  const expiredCount = alerts.filter(a => a.severity === 'expired').length;
  const urgentCount = alerts.filter(a => a.severity === 'urgent').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const selectDriver = (name: string) => {
    setSelected(name);
    setView('detail');
  };

  const selectedRecord = selected ? DRIVER_RECORDS[selected] : null;

  // サマリーカード用データ
  const totalDrivers = PLAYERS.length;
  const driversWithAlerts = new Set(alerts.map(a => a.driverName)).size;

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>ドライバー情報管理</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            ドライバー・車両・資格情報の一元管理 / 期限アラート / LINE更新通知
          </p>
        </div>
        {view !== 'dashboard' && (
          <button onClick={() => { setView('dashboard'); setSelected(null); }}
            className="text-xs px-3 py-1.5 cursor-pointer"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-sm)' }}>
            ダッシュボードに戻る
          </button>
        )}
      </div>

      {/* ダッシュボードビュー */}
      {view === 'dashboard' && (
        <>
          {/* サマリーカード */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl num font-bold" style={{ color: 'var(--text-primary)' }}>{totalDrivers}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>登録ドライバー</p>
            </div>
            <div className="card p-4 text-center cursor-pointer" onClick={() => setView('list')} style={{ cursor: 'pointer' }}>
              <p className="text-2xl num font-bold" style={{ color: driversWithAlerts > 0 ? 'var(--negative)' : 'var(--positive)' }}>
                {driversWithAlerts}
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>要対応ドライバー</p>
            </div>
            <div className="card p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg num font-bold" style={{ color: '#EF4444' }}>{expiredCount}</span>
                <span className="text-lg num font-bold" style={{ color: '#F97316' }}>{urgentCount}</span>
                <span className="text-lg num font-bold" style={{ color: '#EAB308' }}>{warningCount}</span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: '#EF4444' }}>切れ</span> /
                <span style={{ color: '#F97316' }}> 緊急</span> /
                <span style={{ color: '#EAB308' }}> 注意</span>
              </p>
            </div>
            <div className="card p-4 text-center cursor-pointer" onClick={() => setView('list')} style={{ cursor: 'pointer' }}>
              <p className="text-2xl num font-bold" style={{ color: 'var(--text-primary)' }}>{totalDrivers - driversWithAlerts}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--positive)' }}>問題なし</p>
            </div>
          </div>

          {/* フロー図（KURUMAN Step1→2→3） */}
          <div className="card p-5">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>運用フロー</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: '1', title: '情報の登録・更新', desc: 'ドライバー・車両・資格情報をダッシュボードで一元管理', color: '#2563eb' },
                { step: '2', title: '期限アラート通知', desc: '期限到来時にシステムアラート＋LINEで更新依頼を自動通知', color: '#F97316' },
                { step: '3', title: '更新資料の提出', desc: 'ドライバーが更新した資格・書類をシステムに反映', color: '#10B981' },
              ].map(s => (
                <div key={s.step} className="p-4 relative" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', borderTop: `3px solid ${s.color}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center text-[10px] font-bold rounded-full"
                      style={{ background: s.color, color: '#fff' }}>
                      {s.step}
                    </span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{s.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* アラートダッシュボード */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>期限アラート</h3>
            <AlertDashboard alerts={alerts} onSelectDriver={selectDriver} />
          </div>

          {/* 資格一覧テーブル */}
          <QualificationsOverview onSelectDriver={selectDriver} />

          {/* 全ドライバーリストへ */}
          <button onClick={() => setView('list')}
            className="w-full text-sm py-3 font-medium cursor-pointer"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-md)' }}>
            全ドライバー一覧を表示
          </button>
        </>
      )}

      {/* リストビュー */}
      {view === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-2">
            {PLAYERS.map(p => {
              const rec = DRIVER_RECORDS[p.name];
              const isActive = selected === p.name;
              const driverAlerts = alerts.filter(a => a.driverName === p.name);
              const worstSeverity = driverAlerts.length > 0 ? driverAlerts[0].severity : 'ok';

              return (
                <button
                  key={p.name}
                  onClick={() => selectDriver(p.name)}
                  className="w-full text-left p-3 cursor-pointer transition-colors"
                  style={{
                    background: isActive ? 'var(--brand-crimson-soft)' : 'var(--bg-surface)',
                    border: `1px solid ${isActive ? 'var(--brand-crimson)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ borderRadius: 'var(--r-sm)', background: p.color, color: '#fff' }}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.character}</span>
                        {worstSeverity !== 'ok' && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: severityColor(worstSeverity).text }} />
                        )}
                      </div>
                      {rec && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{rec.vehicle.model}</span>
                          <span className="text-[10px] num" style={{ color: 'var(--text-disabled)' }}>{rec.vehicle.plateNumber}</span>
                        </div>
                      )}
                      {driverAlerts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {driverAlerts.slice(0, 2).map((a, i) => (
                            <SeverityBadge key={i} severity={a.severity} />
                          ))}
                          {driverAlerts.length > 2 && (
                            <span className="text-[9px] px-1 py-0.5" style={{ color: 'var(--text-muted)' }}>+{driverAlerts.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {selectedRecord ? (
              <DriverDetailPanel record={selectedRecord} onClose={() => { setSelected(null); setView('list'); }} />
            ) : (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
                    <circle cx="7" cy="5" r="2.5" stroke="var(--text-disabled)" strokeWidth="1.5"/>
                    <path d="M2 15c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="var(--text-disabled)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>左のリストからドライバーを選択してください</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 詳細ビュー（ダッシュボードから直接遷移） */}
      {view === 'detail' && selectedRecord && (
        <DriverDetailPanel record={selectedRecord} onClose={() => { setSelected(null); setView('dashboard'); }} />
      )}
    </div>
  );
}
